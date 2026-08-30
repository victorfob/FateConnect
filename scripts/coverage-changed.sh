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
MINIMO="${MINIMO:-90}"
saida="$(mktemp -d)"
trap 'rm -rf "$saida"' EXIT

echo "==> Rodando a suíte com cobertura"
dotnet test "$SOLUTION" --nologo \
  --collect:"XPlat Code Coverage;Format=opencover" \
  --results-directory "$saida" >/dev/null

relatorio="$(find "$saida" -name coverage.opencover.xml | head -1)"
if [ -z "$relatorio" ]; then
  echo "coverage-changed: a suíte não produziu relatório de cobertura" >&2
  exit 1
fi

git diff --name-only "$BASE...HEAD" -- '*.cs' > "$saida/alterados.txt"

MINIMO="$MINIMO" python3 - "$relatorio" "$saida/alterados.txt" <<'PY'
import os, sys, xml.etree.ElementTree as ET

minimo = int(os.environ["MINIMO"])
raiz = ET.parse(sys.argv[1]).getroot()
with open(sys.argv[2]) as f:
    alterados = {os.path.abspath(linha.strip()) for linha in f if linha.strip()}

por_arquivo = {}
for modulo in raiz.iter("Module"):
    caminhos = {a.get("uid"): a.get("fullPath") for a in modulo.iter("File")}
    for classe in modulo.iter("Class"):
        pontos = [(p, m.find("FileRef")) for m in classe.iter("Method") for p in m.iter("SequencePoint")]
        if not pontos:
            continue
        uid = next((r.get("uid") for _, r in pontos if r is not None), None)
        caminho = caminhos.get(uid)
        # Migrations e a própria suíte ficam fora, como no `sonar.coverage.exclusions`.
        if not caminho or caminho not in alterados or "Migrations" in caminho or ".Tests/" in caminho:
            continue
        acumulado = por_arquivo.setdefault(caminho, [0, 0])
        acumulado[0] += sum(1 for p, _ in pontos if int(p.get("vc")) > 0)
        acumulado[1] += len(pontos)

if not por_arquivo:
    print("    nenhum arquivo de produção da API no diff")
    sys.exit(0)

linhas = sorted((c / t * 100, c, t, p) for p, (c, t) in por_arquivo.items())
abaixo = [linha for linha in linhas if linha[0] < minimo]

for pct, cobertas, total, caminho in linhas:
    nome = caminho.split("FateConnect.Api/")[-1]
    marca = "  ABAIXO" if pct < minimo else ""
    print(f"    {nome:56s} {pct:5.1f}%  ({cobertas}/{total}){marca}")

cobertas = sum(linha[1] for linha in linhas)
total = sum(linha[2] for linha in linhas)
print(f"\n    {len(linhas)} arquivos, agregado {cobertas / total * 100:.1f}%")

if abaixo:
    print(f"\ncoverage-changed: {len(abaixo)} arquivo(s) abaixo de {minimo}%.", file=sys.stderr)
    sys.exit(1)
PY

echo "==> Todos os arquivos tocados atingem ${MINIMO}%."
