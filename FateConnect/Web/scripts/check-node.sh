#!/bin/sh
# Recusa rodar o gate num Node diferente do `.nvmrc`. O Yarn 4 não cobra o
# `engines`, e o gate rodado na versão errada responde verde sem medir nada.
set -eu

cd "$(dirname "$0")/.."

wanted="$(tr -d '[:space:]' < .nvmrc)"
active="$(node -p 'process.versions.node')"

IFS=. read -r wanted_major wanted_minor wanted_patch <<EOF
$wanted
EOF
IFS=. read -r active_major active_minor active_patch <<EOF
$active
EOF

if [ "$active_major" -eq "$wanted_major" ] &&
  [ $((active_minor * 1000 + active_patch)) -ge $((wanted_minor * 1000 + wanted_patch)) ]; then
  exit 0
fi

echo "Node $active ativo, e o projeto pede o $wanted do .nvmrc: rode 'nvm use' em FateConnect/Web." >&2
exit 1
