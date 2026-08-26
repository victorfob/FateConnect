#!/usr/bin/env bash
# Emite os certificados dos DOIS ambientes e passa a borda para HTTPS.
# Rode UMA vez, depois que:
#   1. os dois domínios apontarem para o IP desta VPS;
#   2. ./deploy.sh hml e ./deploy.sh prod já tiverem rodado.
set -euo pipefail

cd "$(dirname "$0")"

if [ ! -f edge/.env ]; then
  echo "ERRO: falta o arquivo deploy/edge/.env." >&2
  exit 1
fi

# shellcheck disable=SC1091
set -a; . ./edge/.env; set +a

for nome in DOMAIN_PROD DOMAIN_HML CERTBOT_EMAIL; do
  eval "valor=\${$nome:-}"
  if [ -z "$valor" ]; then
    echo "ERRO: $nome não está preenchido em deploy/edge/.env." >&2
    exit 1
  fi
done

echo "==> Conferindo que os dois domínios chegam nesta máquina"
for dominio in "$DOMAIN_PROD" "$DOMAIN_HML"; do
  codigo=$(curl -sS -m 20 -o /dev/null -w '%{http_code}' "http://$dominio/" || echo 000)
  if [ "$codigo" = "000" ]; then
    echo "ERRO: $dominio não respondeu por HTTP." >&2
    echo "Confirme que o registro A dele aponta para o IP desta VPS e que o deploy.sh já rodou." >&2
    exit 1
  fi
  echo "    $dominio -> HTTP $codigo"
done

echo "==> Pedindo os certificados ao Let's Encrypt"
for dominio in "$DOMAIN_PROD" "$DOMAIN_HML"; do
  echo "    emitindo para $dominio"
  (cd edge && docker compose --profile certbot run --rm certbot certonly \
    --webroot -w /var/www/certbot \
    -d "$dominio" \
    --email "$CERTBOT_EMAIL" \
    --agree-tos --no-eff-email --non-interactive)
done

echo "==> Passando a borda para HTTPS"
sed -i.bak 's|^EDGE_CONF=.*|EDGE_CONF=https.conf|' edge/.env
rm -f edge/.env.bak
(cd edge && docker compose up -d --force-recreate)

echo "==> Apontando os ambientes para https://"
for par in "prod:$DOMAIN_PROD" "hml:$DOMAIN_HML"; do
  ambiente="${par%%:*}"
  dominio="${par#*:}"
  arquivo=".env.$ambiente"
  if [ -f "$arquivo" ]; then
    sed -i.bak "s|^PUBLIC_URL=.*|PUBLIC_URL=https://$dominio|" "$arquivo"
    rm -f "$arquivo.bak"
    echo "    $arquivo -> https://$dominio"
  fi
done

echo
echo "==> Reconstruindo o front dos dois ambientes com o endereço novo"
echo "    (o endereço da API fica gravado dentro do bundle, por isso o rebuild)"
for ambiente in prod hml; do
  if [ -f ".env.$ambiente" ]; then
    ./build-front.sh "$ambiente"
    ./deploy.sh "$ambiente"
  fi
done

echo
echo "Publicando pela pipeline, basta redisparar o workflow depois disto:"
echo "o front é reconstruído lá com o endereço novo."

echo
echo "HTTPS ativo:"
echo "  produção     https://$DOMAIN_PROD"
echo "  homologação  https://$DOMAIN_HML"
echo
echo "Os certificados valem 90 dias. Agende a renovação:"
echo "  0 3 * * 1 cd $(pwd) && ./renew-https.sh >> /var/log/fateconnect-certbot.log 2>&1"
