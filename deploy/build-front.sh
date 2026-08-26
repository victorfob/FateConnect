#!/usr/bin/env bash
# Gera o front de um ambiente direto na VPS, para quem publica sem a pipeline.
# Pela pipeline isto não é usado: lá o runner constrói e envia o resultado, que
# é o que mantém os source maps do Sentry alinhados com o bundle publicado.
#
#   ./build-front.sh hml
set -euo pipefail

cd "$(dirname "$0")"

AMBIENTE="${1:-}"
case "$AMBIENTE" in
  hml|prod) ;;
  *) echo "Uso: ./build-front.sh hml|prod" >&2; exit 1 ;;
esac

ARQUIVO_ENV=".env.$AMBIENTE"
if [ ! -f "$ARQUIVO_ENV" ]; then
  echo "ERRO: falta deploy/$ARQUIVO_ENV." >&2
  exit 1
fi

# shellcheck disable=SC1090
set -a; . "./$ARQUIVO_ENV"; set +a

if [ -z "${PUBLIC_URL:-}" ]; then
  echo "ERRO: PUBLIC_URL não está preenchido em deploy/$ARQUIVO_ENV." >&2
  exit 1
fi

DESTINO="/var/www/fateconnect/$AMBIENTE"
if [ ! -d "$DESTINO" ]; then
  echo "ERRO: $DESTINO não existe. Rode antes:  sudo ./install-site.sh $AMBIENTE" >&2
  exit 1
fi

VERSAO_NODE=$(tr -d '[:space:]' < ../FateConnect/Web/.nvmrc)

echo "==> Construindo o front de $AMBIENTE para $PUBLIC_URL (node $VERSAO_NODE)"
docker run --rm \
  -v "$(cd .. && pwd)/FateConnect/Web:/app" \
  -v "$DESTINO:/saida" \
  -w /app \
  -e "VITE_API_URL=$PUBLIC_URL/api/conta" \
  -e "VITE_RIDE_API_URL=$PUBLIC_URL/api/carona" \
  -e "VITE_SENTRY_DSN=${VITE_SENTRY_DSN:-}" \
  "node:$VERSAO_NODE-alpine" \
  sh -c 'yarn install --frozen-lockfile && yarn build && rm -rf /saida/* && cp -r dist/. /saida/'

echo "==> Pronto: $DESTINO"
