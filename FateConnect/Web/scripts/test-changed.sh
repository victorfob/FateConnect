#!/usr/bin/env bash
# Roda a suíte do front React limitada ao que a mudança alcança.
#
# Recebe a lista de arquivos alterados (caminhos a partir da raiz do
# repositório) e entrega ao `vitest related` os que estão no código do front —
# `src/` e `design-system/`. Ele segue o grafo de imports e roda só os testes
# que alcançam esses arquivos.
#
# Aqui nunca roda a suíte inteira: o que o grafo não alcança — config,
# dependências, setup de teste, documento legal, arquivo removido — fica para o
# CI, que roda a suíte completa com cobertura em todo PR.
#
# Nenhuma corrida mede cobertura: o limite global sobre um recorte reprovaria
# código saudável.
#
# Portabilidade: o hook roda no bash 3.2 do macOS, onde expandir array vazio com
# `set -u` estoura. Por isso a lista de arquivos vai por arquivo temporário.
set -euo pipefail

WEB_PREFIX="FateConnect/Web/"
# Um recorte que alcança o tema ou os tipos compartilhados roda quase a suíte, e
# com um jsdom por núcleo a memória acaba; o tempo maior cobre a máquina ocupada.
MAX_WORKERS=3
TEST_TIMEOUT_MS=15000

cd "$(dirname "${BASH_SOURCE[0]}")/.."

list="$(mktemp)"
left_to_ci="$(mktemp)"
trap 'rm -f "$list" "$left_to_ci"' EXIT

for path in "$@"; do
  # Só interessa o que é do front React.
  case "$path" in
    "$WEB_PREFIX"*) ;;
    *) continue ;;
  esac

  relative="${path#$WEB_PREFIX}"

  case "$relative" in
    src/*|design-system/*) ;;
    *) printf '%s\n' "$relative" >> "$left_to_ci"; continue ;;
  esac

  # Arquivo removido não entra no grafo: quem o importava só o CI alcança.
  if [ -f "$relative" ]; then
    printf '%s\n' "$relative" >> "$list"
  else
    printf '%s (removido)\n' "$relative" >> "$left_to_ci"
  fi
done

# Toda corrida diz em qual Node mediu: suíte verde na versão errada é verde de
# outro mundo, e sem esta linha não há como saber qual foi depois do fato.
echo "test-changed: Node $(node -v)"

if [ -s "$left_to_ci" ]; then
  echo "test-changed: fora do grafo de imports — fica para a suíte completa do CI:"
  sed 's/^/  /' "$left_to_ci"
fi

if [ ! -s "$list" ]; then
  echo "test-changed: nada de src/ nem de design-system/ na mudança — nada a testar aqui."
  exit 0
fi

echo "test-changed: $(wc -l < "$list" | tr -d ' ') arquivo(s) do front — testes relacionados:"
sed 's/^/  /' "$list"
tr '\n' '\0' < "$list" | xargs -0 npx --no-install vitest related --run \
  --maxWorkers="$MAX_WORKERS" --testTimeout="$TEST_TIMEOUT_MS"
