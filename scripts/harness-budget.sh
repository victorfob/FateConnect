#!/usr/bin/env bash
# Quanto do harness carrega numa tarefa: o que vai em toda sessão, mais as rules
# cujo `paths` casa com os arquivos passados. Rode antes e depois de mexer em
# `.claude/` e ponha os dois números no PR. Tokens ≈ caracteres / 4.
#
# Uso: ./scripts/harness-budget.sh [arquivo ...]

set -euo pipefail

cd "$(dirname "$0")/.."

export LC_ALL=en_US.UTF-8
chars_per_token=4

frontmatter() {
  local file="$1"
  awk 'NR == 1 && $0 == "---" { inside = 1; next } inside && $0 == "---" { exit } inside' "$file"
}

paths_of() {
  local rule_file="$1"
  frontmatter "$rule_file" | awk '
    /^paths:/ { listing = 1; next }
    listing && /^[[:space:]]*-/ { sub(/^[[:space:]]*-[[:space:]]*/, ""); gsub(/"/, ""); print; next }
    listing { exit }'
}

# O `**` vira marcador antes do `*` simples, senão a troca de um desfaz a do outro.
glob_to_regex() {
  local glob="$1"
  printf '%s' "$glob" | sed -E \
    -e 's/[.+?()|^$]/\\&/g' \
    -e 's#\*\*/#@ANYDIRS@#g' \
    -e 's#\*\*#@ANYTHING@#g' \
    -e 's#\*#[^/]*#g' \
    -e 's#@ANYDIRS@#(.*/)?#g' \
    -e 's#@ANYTHING@#.*#g' \
    -e 's#\{([^}]*)\}#(\1)#g' \
    -e 's#,#|#g'
}

matches_any_file() {
  local regex
  regex="^$(glob_to_regex "$1")$"
  for file in "${opened[@]}"; do
    [[ $file =~ $regex ]] && return 0
  done
  return 1
}

opened=("$@")
total=0

report() {
  printf '%7d  %s\n' "$1" "$2"
  total=$((total + $1))
}

report "$(wc -m < .claude/CLAUDE.md)" "CLAUDE.md"

descriptions=0
for skill in .claude/skills/*/SKILL.md; do
  descriptions=$((descriptions + $(frontmatter "$skill" | wc -m)))
done
report "$descriptions" "descriptions das skills"

for rule in .claude/rules/*.md; do
  globs=$(paths_of "$rule")
  if [[ -z $globs ]]; then
    report "$(wc -m < "$rule")" "$(basename "$rule") (sempre)"
    continue
  fi
  while IFS= read -r glob; do
    if [[ ${#opened[@]} -gt 0 ]] && matches_any_file "$glob"; then
      report "$(wc -m < "$rule")" "$(basename "$rule")"
      break
    fi
  done <<< "$globs"
done

printf '%7d  total (~%d tokens)\n' "$total" "$((total / chars_per_token))"
