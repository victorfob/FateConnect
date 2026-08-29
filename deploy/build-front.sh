#!/usr/bin/env bash
# Gera o front de um ambiente direto na VPS, para quem publica sem a pipeline.
# Pela pipeline isto não é usado: lá o runner constrói e envia o resultado, que
# é o que mantém os source maps do Sentry alinhados com o bundle publicado.
#
#   ./build-front.sh hml
set -euo pipefail

cd "$(dirname "$0")"

ENVIRONMENT="${1:-}"
case "$ENVIRONMENT" in
  hml|prod) ;;
  *) echo "Uso: ./build-front.sh hml|prod" >&2; exit 1 ;;
esac

ENV_FILE=".env.$ENVIRONMENT"
if [ ! -f "$ENV_FILE" ]; then
  echo "ERRO: falta deploy/$ENV_FILE." >&2
  exit 1
fi

# shellcheck disable=SC1090
set -a; . "./$ENV_FILE"; set +a

if [ -z "${PUBLIC_URL:-}" ]; then
  echo "ERRO: PUBLIC_URL não está preenchido em deploy/$ENV_FILE." >&2
  exit 1
fi

TARGET="/var/www/fateconnect/$ENVIRONMENT"
if [ ! -d "$TARGET" ]; then
  echo "ERRO: $TARGET não existe. Rode antes:  sudo ./install-site.sh $ENVIRONMENT" >&2
  exit 1
fi

NODE_VERSION=$(tr -d '[:space:]' < ../FateConnect/Web/.nvmrc)

echo "==> Construindo o front de $ENVIRONMENT para $PUBLIC_URL (node $NODE_VERSION)"
docker run --rm \
  -v "$(cd .. && pwd)/FateConnect/Web:/app" \
  -v "$TARGET:/saida" \
  -w /app \
  -e "VITE_API_URL=$PUBLIC_URL/api" \
  -e "VITE_SENTRY_DSN=${VITE_SENTRY_DSN:-}" \
  "node:$NODE_VERSION-alpine" \
  sh -c 'yarn install --frozen-lockfile && yarn build && rm -rf /saida/* && cp -r dist/. /saida/'

echo "==> Pronto: $TARGET"
