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

AMBIENTE="${1:-}"
case "$AMBIENTE" in
  hml|prod) ;;
  *) echo "Uso: sudo ./install-site.sh hml|prod" >&2; exit 1 ;;
esac

ARQUIVO_ENV=".env.$AMBIENTE"
if [ ! -f "$ARQUIVO_ENV" ]; then
  echo "ERRO: falta deploy/$ARQUIVO_ENV." >&2
  exit 1
fi

# shellcheck disable=SC1090
set -a; . "./$ARQUIVO_ENV"; set +a

for nome in DOMINIO PORTA_CONTA PORTA_CARONA; do
  eval "valor=\${$nome:-}"
  if [ -z "$valor" ]; then
    echo "ERRO: $nome não está preenchido em deploy/$ARQUIVO_ENV." >&2
    exit 1
  fi
done

DESTINO="/var/www/fateconnect/$AMBIENTE"
CONF="/etc/nginx/sites-available/fateconnect-$AMBIENTE"

echo "==> Pasta do front: $DESTINO"
mkdir -p "$DESTINO"
# Quem escreve ali é o deploy, rodando como o usuário comum.
chown -R "${SUDO_USER:-root}":"${SUDO_USER:-root}" /var/www/fateconnect

echo "==> Configuração do nginx: $CONF"
sed -e "s|__DOMINIO__|$DOMINIO|g" \
    -e "s|__AMBIENTE__|$AMBIENTE|g" \
    -e "s|__PORTA_CONTA__|$PORTA_CONTA|g" \
    -e "s|__PORTA_CARONA__|$PORTA_CARONA|g" \
    nginx/site.conf.template > "$CONF"
ln -sf "$CONF" "/etc/nginx/sites-enabled/fateconnect-$AMBIENTE"

echo "==> Conferindo a configuração antes de recarregar"
nginx -t
systemctl reload nginx

echo
echo "Pronto: $DOMINIO servido a partir de $DESTINO"
echo "Para ligar o HTTPS depois que o domínio estiver respondendo:"
echo "  sudo certbot --nginx -d $DOMINIO"
