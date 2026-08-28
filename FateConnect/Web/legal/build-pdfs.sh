#!/usr/bin/env bash
# Gera os PDFs dos documentos legais a partir do HTML versionado ao lado.
# O HTML é a fonte: é ele que o review lê. O PDF é o que a aplicação serve.
set -euo pipefail

CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
LEGAL_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
OUT_DIR="$LEGAL_DIR/../public"

if [ ! -x "$CHROME" ]; then
  echo "Chrome não encontrado em $CHROME" >&2
  exit 1
fi

for nome in termos privacidade; do
  "$CHROME" --headless --disable-gpu --no-pdf-header-footer \
    --print-to-pdf="$OUT_DIR/$nome.pdf" \
    "file://$LEGAL_DIR/$nome.html" 2>/dev/null
  echo "$nome.pdf gerado"
done
