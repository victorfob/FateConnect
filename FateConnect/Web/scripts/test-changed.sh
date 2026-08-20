#!/usr/bin/env bash
# Roda a suíte do front React limitada ao que a mudança alcança.
#
# Recebe a lista de arquivos alterados (caminhos a partir da raiz do
# repositório) e decide entre duas corridas:
#
#   related  — `vitest related` segue o grafo de imports e roda só os testes que
#              alcançam os arquivos citados. É o caminho normal.
#   completa — quando a mudança sai de `src/` (config, dependências, setup de
#              teste) ou quando houve remoção de arquivo. Nesses casos o grafo
#              não alcança o efeito: `vitest related vite.config.ts` não encontra
#              teste nenhum e sai com código 0, o que passaria batido.
#
# Nenhuma das duas mede cobertura: aqui o objetivo é ser rápido a cada push.
# Cobertura é responsabilidade do CI, que roda a suíte inteira. Medir o limite
# global sobre um recorte reprovaria código saudável — um recorte em que tudo
# passou reportou 69% contra o limite de 80%.
#
# Portabilidade: o hook roda no bash 3.2 do macOS, onde expandir array vazio com
# `set -u` estoura. Por isso a lista de arquivos vai por arquivo temporário.
set -euo pipefail

WEB_PREFIX="FateConnect/Web/"
cd "$(dirname "${BASH_SOURCE[0]}")/.."

list="$(mktemp)"
trap 'rm -f "$list"' EXIT

run_everything=0

for path in "$@"; do
  # Só interessa o que é do front React.
  case "$path" in
    "$WEB_PREFIX"*) ;;
    *) continue ;;
  esac

  relative="${path#$WEB_PREFIX}"

  case "$relative" in
    src/*) ;;
    *) run_everything=1; continue ;;
  esac

  # Arquivo removido não entra no grafo, e quem importava ele pode ter quebrado.
  if [ -f "$relative" ]; then
    printf '%s\n' "$relative" >> "$list"
  else
    run_everything=1
  fi
done

if [ "$run_everything" -eq 1 ]; then
  echo "test-changed: mudança fora de src/ ou remoção de arquivo — suíte completa."
  exec npx --no-install vitest run
fi

if [ ! -s "$list" ]; then
  echo "test-changed: nada do front React na mudança — nada a testar."
  exit 0
fi

echo "test-changed: $(wc -l < "$list" | tr -d ' ') arquivo(s) de src/ — testes relacionados:"
sed 's/^/  /' "$list"
tr '\n' '\0' < "$list" | xargs -0 npx --no-install vitest related --run
