#!/usr/bin/env bash
# Publica um ambiente do FateConnect. Uso:
#   ./deploy.sh hml     # homologação, a partir da branch develop
#   ./deploy.sh prod    # produção, a partir da branch main
#
# Pode ser rodado quantas vezes quiser: reconstrói o que mudou e deixa o resto
# de pé. O outro ambiente não é tocado.
set -euo pipefail

cd "$(dirname "$0")"

AMBIENTE="${1:-}"
case "$AMBIENTE" in
  hml)  BRANCH=develop ;;
  prod) BRANCH=main ;;
  *)
    echo "Uso: ./deploy.sh hml|prod" >&2
    exit 1
    ;;
esac

ARQUIVO_ENV=".env.$AMBIENTE"
PROJETO="fateconnect-$AMBIENTE"

if [ ! -f "$ARQUIVO_ENV" ]; then
  echo "ERRO: falta o arquivo deploy/$ARQUIVO_ENV." >&2
  echo "Crie a partir do modelo e preencha:" >&2
  echo "  cp .env.example $ARQUIVO_ENV && nano $ARQUIVO_ENV" >&2
  exit 1
fi

if [ ! -f edge/.env ]; then
  echo "ERRO: falta o arquivo deploy/edge/.env (configuração da borda)." >&2
  echo "  cp edge/.env.example edge/.env && nano edge/.env" >&2
  exit 1
fi

# shellcheck disable=SC1090
set -a; . "./$ARQUIVO_ENV"; set +a

faltando=''
for nome in PUBLIC_URL POSTGRES_DB POSTGRES_USER POSTGRES_PASSWORD JWT_SECRET; do
  eval "valor=\${$nome:-}"
  if [ -z "$valor" ]; then
    faltando="$faltando $nome"
  fi
done

if [ -n "$faltando" ]; then
  echo "ERRO: variáveis sem valor em deploy/$ARQUIVO_ENV:$faltando" >&2
  exit 1
fi

# Usado pelo compose para o apelido de rede que a borda procura.
export ENVIRONMENT="$AMBIENTE"

echo "==> Atualizando o código a partir da branch $BRANCH"
# Avisar e seguir não adianta: o `git checkout` abaixo aborta sozinho e a
# mensagem dele não diz o que fazer. Melhor parar aqui, explicando.
if [ -n "$(git -C .. status --porcelain)" ]; then
  echo "ERRO: há alterações não commitadas nesta cópia do repositório." >&2
  echo "O deploy troca de branch e não pode passar por cima delas. Veja o que é:" >&2
  echo "  git -C '$(cd .. && pwd)' status" >&2
  echo "E descarte com 'git checkout -- .' se não houver nada a salvar." >&2
  exit 1
fi
git -C .. fetch --prune
git -C .. checkout "$BRANCH"
git -C .. pull --ff-only

echo "==> Garantindo a rede compartilhada com a borda"
docker network inspect fateconnect-edge >/dev/null 2>&1 \
  || docker network create fateconnect-edge

echo "==> Subindo a borda"
(cd edge && docker compose up -d)

if [ ! -f "dist/$AMBIENTE/index.html" ]; then
  echo "ERRO: falta o front construído em deploy/dist/$AMBIENTE." >&2
  echo "Pela pipeline ele é enviado pelo runner. Publicando à mão, gere antes:" >&2
  echo "  ./build-front.sh $AMBIENTE" >&2
  exit 1
fi

echo "==> Construindo as APIs de $AMBIENTE ($PUBLIC_URL)"
docker compose -p "$PROJETO" --env-file "$ARQUIVO_ENV" build

echo "==> Subindo o ambiente $AMBIENTE"
docker compose -p "$PROJETO" --env-file "$ARQUIVO_ENV" up -d --remove-orphans

echo "==> Recarregando a borda para enxergar o ambiente"
docker compose -f edge/docker-compose.yml exec -T proxy nginx -s reload 2>/dev/null || true

echo
echo "==> Estado do ambiente $AMBIENTE"
docker compose -p "$PROJETO" --env-file "$ARQUIVO_ENV" ps

echo
echo "Pronto. $AMBIENTE responde em $PUBLIC_URL"
echo "Se algo não subiu:  docker compose -p $PROJETO logs -f"
