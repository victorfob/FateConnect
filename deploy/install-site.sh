#!/usr/bin/env bash
# Instala no nginx do host a configuração de um ambiente, e prepara a pasta que
# vai receber o front. Roda com sudo, uma vez por ambiente:
#
#   sudo ./install-site.sh hml
set -euo pipefail

cd "$(dirname "$0")"

if [ "$(id -u)" -ne 0 ]; then
  echo "Rode com sudo: sudo ./install-site.sh hml|prod" >&2
  exit 1
fi

ENVIRONMENT="${1:-}"
case "$ENVIRONMENT" in
  hml|prod) ;;
  *) echo "Uso: sudo ./install-site.sh hml|prod" >&2; exit 1 ;;
esac

ENV_FILE=".env.$ENVIRONMENT"
if [ ! -f "$ENV_FILE" ]; then
  echo "ERRO: falta deploy/$ENV_FILE." >&2
  exit 1
fi

# shellcheck disable=SC1090
set -a; . "./$ENV_FILE"; set +a

for name in DOMAIN API_PORT; do
  eval "value=\${$name:-}"
  if [ -z "$value" ]; then
    echo "ERRO: $name não está preenchido em deploy/$ENV_FILE." >&2
    exit 1
  fi
done

TARGET="/var/www/fateconnect/$ENVIRONMENT"
CONF="/etc/nginx/sites-available/fateconnect-$ENVIRONMENT"

echo "==> Pasta do front: $TARGET"
mkdir -p "$TARGET"
# Quem escreve ali é o deploy, rodando como o usuário comum.
chown -R "${SUDO_USER:-root}":"${SUDO_USER:-root}" /var/www/fateconnect

echo "==> Configuração do nginx: $CONF"
sed -e "s|__DOMAIN__|$DOMAIN|g" \
    -e "s|__ENVIRONMENT__|$ENVIRONMENT|g" \
    -e "s|__API_PORT__|$API_PORT|g" \
    nginx/site.conf.template > "$CONF"
ln -sf "$CONF" "/etc/nginx/sites-enabled/fateconnect-$ENVIRONMENT"

echo "==> Conferindo a configuração antes de recarregar"
nginx -t
systemctl reload nginx

# O passo acima sobrescreve o arquivo inteiro, e o template só descreve a porta
# 80 — então o bloco 443 que o certbot escreveu some a cada execução. Reaplicar
# não reemite certificado: só devolve o TLS ao arquivo recém-gerado.
if [ -d "/etc/letsencrypt/live/$DOMAIN" ]; then
  echo "==> Devolvendo o HTTPS à configuração recém-gerada"
  certbot install --nginx --cert-name "$DOMAIN"
  nginx -t
  systemctl reload nginx
fi

echo
echo "Pronto: $DOMAIN servido a partir de $TARGET"
if [ ! -d "/etc/letsencrypt/live/$DOMAIN" ]; then
  echo "Para ligar o HTTPS depois que o domínio estiver respondendo:"
  echo "  sudo certbot --nginx -d $DOMAIN"
fi
