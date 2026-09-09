#!/usr/bin/env bash
# Mede a cobertura da API por arquivo de produção que o diff toca, contra os 90%
# que a `dotnet-testing.md` exige.
#
# O `dotnet test` sozinho não mede cobertura, e o gate do SonarCloud exige 33% —
# então uma PR pode passar verde nos dois e ainda violar a regra da casa. Foi o
# que aconteceu na #222, com o `AuthService` em 22,7%.
#
#   ./scripts/coverage-changed.sh [ref-base]     # base padrão: origin/develop

set -euo pipefail

cd "$(dirname "$0")/.."

BASE="${1:-origin/develop}"
SOLUTION="FateConnect/FateConnect.Api/FateConnect.Api.sln"
MINIMUM="${MINIMUM:-90}"
output="$(mktemp -d)"
trap 'rm -rf "$output"' EXIT

echo "==> Rodando a suíte com cobertura"
dotnet test "$SOLUTION" --nologo \
  --collect:"XPlat Code Coverage;Format=opencover" \
  --results-directory "$output" >/dev/null

report="$(find "$output" -name coverage.opencover.xml | head -1)"
if [[ -z "$report" ]]; then
  echo "coverage-changed: a suíte não produziu relatório de cobertura" >&2
  exit 1
fi

git diff --name-only "$BASE...HEAD" -- '*.cs' > "$output/changed.txt"

MINIMUM="$MINIMUM" python3 - "$report" "$output/changed.txt" <<'PY'
import os, re, sys, xml.etree.ElementTree as ET

minimum = int(os.environ["MINIMUM"])
root = ET.parse(sys.argv[1]).getroot()
with open(sys.argv[2]) as handle:
    changed = {os.path.abspath(line.strip()) for line in handle if line.strip()}


def is_synthesized(method):
    # Membro que o compilador escreve não tem corpo no arquivo, e o relatório o
    # ancora num vão de um caractere só. Construtor escrito à mão sempre abrange
    # as chaves do próprio corpo, então nunca cai aqui.
    points = list(method.iter("SequencePoint"))

    if len(points) != 1:
        return False

    return int(points[0].get("ec")) - int(points[0].get("sc")) == 1


def is_generated_copy_constructor(class_name, method):
    # O compilador gera um construtor de cópia para todo `record`, e só uma
    # expressão `with` o chama. Nada em produção usa `with`, então ele fica
    # eternamente descoberto e derruba DTO de dados puros para 80%: num arquivo
    # de cinco linhas, uma linha que ninguém pode alcançar vale 20%.
    #
    # As duas condições precisam andar juntas: sem a segunda, um construtor de
    # cópia escrito à mão também sairia da conta, e é justamente a lógica dele
    # que o gate existe para cobrar. Medido em 08/09/2026 sobre a suíte inteira,
    # o par alcança os 8 gerados e nenhum dos 22 escritos à mão.
    signature = re.search(r"::\.ctor\((.*)\)$", method.findtext("Name") or "")

    if signature is None:
        return False

    if re.sub(r"<.*>$", "", signature.group(1)) != class_name:
        return False

    return is_synthesized(method)


by_file = {}
for module in root.iter("Module"):
    paths = {entry.get("uid"): entry.get("fullPath") for entry in module.iter("File")}
    for class_element in module.iter("Class"):
        class_name = class_element.findtext("FullName") or ""
        points = [(point, method.find("FileRef"))
                  for method in class_element.iter("Method")
                  if not is_generated_copy_constructor(class_name, method)
                  for point in method.iter("SequencePoint")]
        if not points:
            continue
        uid = next((ref.get("uid") for _, ref in points if ref is not None), None)
        path = paths.get(uid)
        # Migrations e a própria suíte ficam fora, como no `sonar.coverage.exclusions`.
        if not path or path not in changed or "Migrations" in path or ".Tests/" in path:
            continue
        tally = by_file.setdefault(path, [0, 0])
        tally[0] += sum(1 for point, _ in points if int(point.get("vc")) > 0)
        tally[1] += len(points)

if not by_file:
    print("    nenhum arquivo de produção da API no diff")
    sys.exit(0)

rows = sorted((covered / total * 100, covered, total, path)
              for path, (covered, total) in by_file.items())
below = [row for row in rows if row[0] < minimum]

for percentage, covered, total, path in rows:
    name = path.split("FateConnect.Api/")[-1]
    mark = "  ABAIXO" if percentage < minimum else ""
    print(f"    {name:56s} {percentage:5.1f}%  ({covered}/{total}){mark}")

covered = sum(row[1] for row in rows)
total = sum(row[2] for row in rows)
print(f"\n    {len(rows)} arquivos, agregado {covered / total * 100:.1f}%")

if below:
    print(f"\ncoverage-changed: {len(below)} arquivo(s) abaixo de {minimum}%.", file=sys.stderr)
    sys.exit(1)
PY

echo "==> Todos os arquivos tocados atingem ${MINIMUM}%."
