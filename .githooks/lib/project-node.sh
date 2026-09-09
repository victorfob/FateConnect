#!/usr/bin/env bash
# Ativa, para o gate do front, a versão de Node que o `.nvmrc` declara.
#
# Os hooks herdam o Node do shell, e o do shell não é o do projeto: gate rodado
# na versão errada responde verde sobre um mundo que ninguém vai mergear. Em
# 08/09/2026 o `pre-push` aprovou um push cujos testes reprovavam na versão
# declarada, porque `File` do jsdom deixou de passar na checagem do undici.
#
# A comparação é exata, não piso: "maior ou igual" volta a aceitar a versão que
# produziu o falso verde.
use_project_node() {
  local web="$1" wanted active nvm_sh

  wanted="v$(tr -d '[:space:]' < "$web/.nvmrc")"
  nvm_sh="${NVM_DIR:-$HOME/.nvm}/nvm.sh"

  if [[ -s "$nvm_sh" ]]; then
    # `nvm.sh` não sobrevive a `set -eu`.
    set +eu
    # shellcheck source=/dev/null
    . "$nvm_sh"
    nvm use "$wanted" >/dev/null 2>&1
    set -eu
  fi

  active="$(node -v 2>/dev/null || true)"

  if [[ "$active" != "$wanted" ]]; then
    echo "hook: o gate do front precisa do Node $wanted, e o ativo é ${active:-nenhum} — rode 'nvm install' em FateConnect/Web" >&2
    return 1
  fi
}
