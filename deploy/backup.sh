#!/usr/bin/env bash
# Backup de produção: o banco e as fotos, cifrados e enviados ao bucket. Uso:
#   sudo ./backup.sh
#
# O agendamento que o vps-setup.sh instala o roda nos dias 1 e 16, às 03:00.
set -Eeuo pipefail

cd "$(dirname "$0")"

ENV_FILE=.env.prod
UPLOADS_VOLUME=fateconnect-prod_api_uploads
KEEP=6
MONITOR_SLUG=fateconnect-backup
NAME_PATTERN='^fateconnect-prod-[0-9]{4}-[0-9]{2}-[0-9]{2}\.tar\.age$'

if [[ "$(id -u)" -ne 0 ]]; then
  echo "Rode com sudo: sudo ./backup.sh" >&2
  exit 1
fi

if [[ ! -f "$ENV_FILE" ]]; then
  echo "ERRO: falta o arquivo deploy/$ENV_FILE." >&2
  exit 1
fi

set -a
# shellcheck disable=SC1090
. "./$ENV_FILE"
set +a

missing=''
for name in POSTGRES_DB BACKUP_AGE_RECIPIENT BACKUP_B2_KEY_ID BACKUP_B2_APPLICATION_KEY \
  BACKUP_B2_BUCKET SENTRY_DSN; do
  eval "value=\${$name:-}"
  if [[ -z "$value" ]]; then
    missing="$missing $name"
  fi
done

if [[ -n "$missing" ]]; then
  echo "ERRO: variáveis sem valor em deploy/$ENV_FILE:$missing" >&2
  exit 1
fi

# O monitor mora no projeto da API, e o endereço de check-in por HTTP sai do DSN
# dela: <esquema>://<host>/api/<projeto>/cron/<monitor>/<chave pública>/.
dsn_key=${SENTRY_DSN#*://}
dsn_key=${dsn_key%%@*}
dsn_rest=${SENTRY_DSN#*@}
MONITOR_URL="${SENTRY_DSN%%://*}://${dsn_rest%%/*}/api/${dsn_rest##*/}/cron/$MONITOR_SLUG/$dsn_key/"

# O aviso não derruba o backup: uma cópia que chegou ao bucket vale mais que o
# registro de que ela chegou.
checkin() {
  local status=$1
  curl -fsS -m 10 -o /dev/null "$MONITOR_URL?status=$status" \
    || echo "aviso: o Sentry não recebeu o status $status" >&2
}

WORK_DIR=$(mktemp -d)
trap 'rm -rf "$WORK_DIR"' EXIT
trap 'checkin error' ERR

: "${RCLONE_CONFIG_BACKUP_TYPE:=b2}"
export RCLONE_CONFIG_BACKUP_TYPE
export RCLONE_CONFIG_BACKUP_ACCOUNT="$BACKUP_B2_KEY_ID"
export RCLONE_CONFIG_BACKUP_KEY="$BACKUP_B2_APPLICATION_KEY"
# Sem isto o B2 só esconde o arquivo apagado, e as cópias antigas seguem ocupando a cota.
export RCLONE_CONFIG_BACKUP_HARD_DELETE=true

BACKUP_NAME="fateconnect-prod-$(date +%F).tar.age"

checkin in_progress

echo "==> Banco $POSTGRES_DB"
runuser -u postgres -- pg_dump -Fc "$POSTGRES_DB" > "$WORK_DIR/database.dump"

echo "==> Fotos do volume $UPLOADS_VOLUME"
docker run --rm -v "$UPLOADS_VOLUME:/uploads:ro" alpine:3.20 tar -C /uploads -cf - . \
  > "$WORK_DIR/uploads.tar"

# Os dois arquivos abertos só existem na pasta temporária, que só o root lê e
# que o `trap` apaga na saída, com sucesso ou com falha.
echo "==> Cifrando"
tar -C "$WORK_DIR" -cf - database.dump uploads.tar \
  | age -r "$BACKUP_AGE_RECIPIENT" -o "$WORK_DIR/$BACKUP_NAME"
echo "    $BACKUP_NAME, $(du -h "$WORK_DIR/$BACKUP_NAME" | cut -f1)"

echo "==> Enviando ao bucket $BACKUP_B2_BUCKET"
rclone -q copyto "$WORK_DIR/$BACKUP_NAME" "backup:$BACKUP_B2_BUCKET/$BACKUP_NAME"

echo "==> Mantendo as $KEEP cópias mais recentes"
mapfile -t backups < <(rclone -q lsf --files-only "backup:$BACKUP_B2_BUCKET" | grep -E "$NAME_PATTERN" | sort)
for ((i = 0; i < ${#backups[@]} - KEEP; i++)); do
  rclone -q deletefile "backup:$BACKUP_B2_BUCKET/${backups[i]}"
  echo "    apagada ${backups[i]}"
done

checkin ok
echo "Pronto: $BACKUP_NAME no bucket $BACKUP_B2_BUCKET."
