#!/usr/bin/env bash
# Publica um ambiente do FateConnect. Uso:
#   ./deploy.sh hml     # homologação, a partir da branch develop
#   ./deploy.sh prod    # produção, a partir da branch main
#
# Pode ser rodado quantas vezes quiser. O outro ambiente não é tocado.
set -euo pipefail

cd "$(dirname "$0")"

AMBIENTE="${1:-}"
case "$AMBIENTE" in
  hml)  BRANCH=develop ;;
  prod) BRANCH=main ;;
  *) echo "Uso: ./deploy.sh hml|prod" >&2; exit 1 ;;
esac

ARQUIVO_ENV=".env.$AMBIENTE"
PROJETO="fateconnect-$AMBIENTE"
RAIZ_WEB="/var/www/fateconnect/$AMBIENTE"

if [ ! -f "$ARQUIVO_ENV" ]; then
  echo "ERRO: falta o arquivo deploy/$ARQUIVO_ENV." >&2
  echo "  cp .env.example $ARQUIVO_ENV && nano $ARQUIVO_ENV" >&2
  exit 1
fi

# shellcheck disable=SC1090
set -a; . "./$ARQUIVO_ENV"; set +a

faltando=''
for nome in DOMINIO PUBLIC_URL PORTA_CONTA PORTA_CARONA POSTGRES_DB POSTGRES_USER POSTGRES_PASSWORD JWT_SECRET; do
  eval "valor=\${$nome:-}"
  if [ -z "$valor" ]; then
    faltando="$faltando $nome"
  fi
done

if [ -n "$faltando" ]; then
  echo "ERRO: variáveis sem valor em deploy/$ARQUIVO_ENV:$faltando" >&2
  exit 1
fi

if [ ! -f "$RAIZ_WEB/index.html" ]; then
  echo "ERRO: falta o front em $RAIZ_WEB." >&2
  echo "Pela pipeline ele é enviado pelo runner. Publicando à mão, gere antes:" >&2
  echo "  ./build-front.sh $AMBIENTE" >&2
  exit 1
fi

echo "==> Atualizando o código a partir da branch $BRANCH"
# Avisar e seguir não adianta: o `git checkout` abaixo aborta sozinho e a
# mensagem dele não diz o que fazer. Melhor parar aqui, explicando.
if [ -n "$(git -C .. status --porcelain)" ]; then
  echo "ERRO: há alterações não commitadas nesta cópia do repositório." >&2
  echo "Veja o que é com:  git -C '$(cd .. && pwd)' status" >&2
  exit 1
fi
git -C .. fetch --prune
git -C .. checkout "$BRANCH"
git -C .. pull --ff-only

echo "==> Construindo as APIs de $AMBIENTE ($PUBLIC_URL)"
docker compose -p "$PROJETO" --env-file "$ARQUIVO_ENV" build

echo "==> Subindo as APIs de $AMBIENTE"
docker compose -p "$PROJETO" --env-file "$ARQUIVO_ENV" up -d --remove-orphans

echo
docker compose -p "$PROJETO" --env-file "$ARQUIVO_ENV" ps
echo
echo "Memória da máquina depois da subida:"
free -h | sed 's/^/  /'
echo
echo "Pronto. $AMBIENTE responde em $PUBLIC_URL"
echo "Se algo não subiu:  docker compose -p $PROJETO logs -f"
