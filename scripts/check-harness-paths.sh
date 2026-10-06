#!/usr/bin/env bash
# Encontra caminho do repositório citado em .claude/ que não existe mais.
#
# Rule e skill citam código por nome, e nada as avisa quando o código sai: o
# texto continua sintaticamente perfeito descrevendo algo que não existe. Este
# check é o que avisa.
#
# Só considera caminho ancorado numa entrada real da raiz do repositório —
# `Header/styles.ts` no meio de uma frase é exemplo, não referência.

set -euo pipefail

cd "$(dirname "$0")/.."

# Pastas documentadas de propósito que o git não rastreia.
ignorados=(
  ".claude/worktrees"                                                    # worktree de agente, fora do versionamento
)

raizes=$(git ls-files | cut -d/ -f1 | sort -u | sed 's/\./\\./' | tr '\n' '|' | sed 's/|$//')

# As rules do front citam a partir de `src/` ou de dentro dele (`pages/Profile/...`).
bases_do_front=("FateConnect/Web/src" "FateConnect/Web")
relativas=$(
  for base in "${bases_do_front[@]}"; do
    git ls-files "$base" | sed "s|^$base/||" | grep / | cut -d/ -f1
  done | sort -u | tr '\n' '|' | sed 's/|$//'
)

conhecidos=$(mktemp)
# Todos os ancestrais, e não só o pai imediato: um texto pode citar
# `FateConnect/Web/src/pages`, que é diretório sem arquivo próprio.
{
  git ls-files
  git ls-files | awk -F/ '{ caminho = $1; print caminho; for (i = 2; i < NF; i++) { caminho = caminho "/" $i; print caminho } }'
  printf '%s\n' "${ignorados[@]}"
} | sort -u > "$conhecidos"

encontrados=0

while IFS=: read -r arquivo linha citado; do
  [[ -z "${citado:-}" ]] && continue
  citado="${citado%/}"
  grep -qxF "$citado" "$conhecidos" && continue
  existe_no_front=false
  for base in "${bases_do_front[@]}"; do
    grep -qxF "$base/$citado" "$conhecidos" && existe_no_front=true
  done
  $existe_no_front && continue
  echo "  $arquivo:$linha  →  $citado"
  encontrados=$((encontrados + 1))
done < <(
  # ⛔ `worktrees/` fora da varredura: lá dentro mora uma cópia do repositório
  # noutra branch, e o que ela cita é problema daquela branch. A lista de
  # `ignorados` acima não resolve isto — ela diz quais caminhos CITADOS podem
  # faltar, e não onde parar de procurar.
  {
    grep -rnoE --include="*.md" --exclude-dir="worktrees" "($raizes)/[A-Za-z0-9_./-]+" .claude/
    # Só o início de caminho: o meio de um caminho já entrou acima, e depois de `@` é alias de import.
    grep -rnoE --include="*.md" --exclude-dir="worktrees" "(^|[^A-Za-z0-9_./@-])($relativas)/[A-Za-z0-9_./-]+" .claude/ |
      sed -E 's/^([^:]+:[0-9]+:)[^A-Za-z0-9_.]/\1/'
  } | sed -E 's/[.,;:)]+$//' | sort -u
)

rm -f "$conhecidos"

if [[ "$encontrados" -gt 0 ]]; then
  echo
  echo "$encontrados caminho(s) citado(s) em .claude/ não existem no repositório."
  echo "Atualize o texto — ou, se o caminho é de propósito, acrescente-o a 'ignorados'."
  exit 1
fi

echo "Nenhum caminho órfão em .claude/."
