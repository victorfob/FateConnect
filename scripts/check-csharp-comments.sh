#!/usr/bin/env bash
# Reprova comentário em C# — `//`, `///` e `/* */` — fora do código gerado pelo EF.
#
#   ./scripts/check-csharp-comments.sh              # todo .cs rastreado da API e dos testes
#   ./scripts/check-csharp-comments.sh <arquivo>…   # só os arquivos dados (o pre-commit passa os preparados)
#
# Os literais de string e de caractere saem da linha antes da busca, senão a URL
# de `"https://..."` contaria como comentário. O literal verbatim (`@"..."`) tem
# alternativa própria porque nele a barra invertida não escapa: `@"\"` é uma
# string inteira.

set -euo pipefail

cd "$(dirname "$0")/.."

gerados='/Migrations/|\.Designer\.cs$|ModelSnapshot\.cs$'

if [[ $# -gt 0 ]]; then
  candidatos=$(printf '%s\n' "$@")
else
  candidatos=$(git ls-files 'FateConnect/FateConnect.Api/*.cs' 'FateConnect/FateConnect.Api.Tests/*.cs')
fi

arquivos=$(printf '%s\n' "$candidatos" | grep -E '\.cs$' | grep -vE "$gerados" || true)

[[ -z "$arquivos" ]] && exit 0

encontrados=$(
  printf '%s\n' "$arquivos" | tr '\n' '\0' | xargs -0 perl -ne '
    $linha = $_;
    s/(?:@\$?|\$@)"(?:[^"]|"")*"|\$?"(?:[^"\\]|\\.)*"|\x27(?:[^\x27\\]|\\.)\x27//g;
    print "  $ARGV:$.: $linha" if m{//|/\*};
    close ARGV if eof;
  '
)

if [[ -n "$encontrados" ]]; then
  echo "Comentário em C# — a explicação vai no nome do símbolo, no corpo do PR ou na issue:" >&2
  echo "$encontrados" >&2
  exit 1
fi
