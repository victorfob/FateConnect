#!/usr/bin/env bash
# Renova os certificados que estiverem perto de expirar e recarrega a borda.
# Seguro rodar toda semana: o certbot não faz nada quando ainda falta muito tempo.
set -euo pipefail

cd "$(dirname "$0")/edge"

docker compose --profile certbot run --rm certbot renew --webroot -w /var/www/certbot
docker compose exec -T proxy nginx -s reload
