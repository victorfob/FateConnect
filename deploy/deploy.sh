#!/usr/bin/env bash
# Publica um ambiente do FateConnect. Uso:
#   ./deploy.sh hml     # homologação, a partir da branch develop
#   ./deploy.sh prod    # produção, a partir da branch main
#
# Pode ser rodado quantas vezes quiser. O outro ambiente não é tocado.
set -euo pipefail

cd "$(dirname "$0")"

ENVIRONMENT="${1:-}"
case "$ENVIRONMENT" in
  hml)  BRANCH=develop ;;
  prod) BRANCH=main ;;
  *) echo "Uso: ./deploy.sh hml|prod" >&2; exit 1 ;;
esac

# A atualização vem antes de tudo que possa falhar. Depois da validação, um
# defeito nas linhas de cima travaria a publicação para sempre: o script
# quebrado nunca alcança o `git pull` que traria a própria correção, e só um
# acesso manual à máquina destrava.
if [ -z "${DEPLOY_SELF_UPDATED:-}" ]; then
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

  # `exec`, e não seguir em frente: o bash lê o script incrementalmente, então
  # continuar executando o arquivo que o `pull` acabou de reescrever é
  # imprevisível. A guarda impede que a cópia nova atualize outra vez.
  DEPLOY_SELF_UPDATED=1 exec "$0" "$@"
fi

ENV_FILE=".env.$ENVIRONMENT"
PROJECT="fateconnect-$ENVIRONMENT"
WEB_ROOT="/var/www/fateconnect/$ENVIRONMENT"

if [ ! -f "$ENV_FILE" ]; then
  echo "ERRO: falta o arquivo deploy/$ENV_FILE." >&2
  echo "  cp .env.example $ENV_FILE && nano $ENV_FILE" >&2
  exit 1
fi

# shellcheck disable=SC1090
set -a; . "./$ENV_FILE"; set +a

missing=''
for name in DOMAIN PUBLIC_URL API_PORT POSTGRES_DB POSTGRES_USER POSTGRES_PASSWORD JWT_SECRET; do
  eval "value=\${$name:-}"
  if [ -z "$value" ]; then
    missing="$missing $name"
  fi
done

if [ -n "$missing" ]; then
  echo "ERRO: variáveis sem valor em deploy/$ENV_FILE:$missing" >&2
  exit 1
fi

if [ ! -f "$WEB_ROOT/index.html" ]; then
  echo "ERRO: falta o front em $WEB_ROOT." >&2
  echo "Pela pipeline ele é enviado pelo runner. Publicando à mão, gere antes:" >&2
  echo "  ./build-front.sh $ENVIRONMENT" >&2
  exit 1
fi

echo "==> Construindo as APIs de $ENVIRONMENT ($PUBLIC_URL)"
docker compose -p "$PROJECT" --env-file "$ENV_FILE" build

echo "==> Subindo as APIs de $ENVIRONMENT"
docker compose -p "$PROJECT" --env-file "$ENV_FILE" up -d --remove-orphans

echo
docker compose -p "$PROJECT" --env-file "$ENV_FILE" ps
echo
echo "Memória da máquina depois da subida:"
free -h | sed 's/^/  /'
echo
echo "Pronto. $ENVIRONMENT responde em $PUBLIC_URL"
echo "Se algo não subiu:  docker compose -p $PROJECT logs -f"
