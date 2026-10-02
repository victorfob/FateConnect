---
name: pr-creator
description: "Abre e atualiza Pull Requests do FateConnect: título em inglês derivado do diff e da branch, corpo em pt-BR com Objetivo, Alterações, Issue e Evidências. Use quando o usuário pedir para criar, abrir ou atualizar um PR ou a descrição dele, inclusive PR empilhado sobre outro PR."
---

# PR creator

Para mensagem de commit, use a skill `write-commit`. Depois do merge (fechar a issue, o pai, reler as irmãs), a skill `spec-issue` tem o procedimento.

## Paradas

1. ⛔ **Atualizando um PR já aberto, o corpo novo parte do publicado, nunca do rascunho local.** O `--body-file` substitui o corpo inteiro, e o que o usuário pôs depois (evidências, capturas) some sem aviso; entre duas edições suas cabe uma dele.

   ```bash
   gh pr view <n> --json body -q .body > /tmp/corpo.md   # e edite ESTE arquivo
   ```

   O corpo editado no site vem com `\r\n`: edite em bytes e confira que o `diff` contra o publicado mostra só a sua linha.

   Apagou mesmo assim? `userContentEdits` guarda cada versão inteira (o campo `diff` é o corpo completo, do mais novo para o mais antigo). Recupere **comparando linha a linha** contra o atual, não colando o que você lembra.

   ```bash
   gh api graphql -f query='{repository(owner:"<dono>",name:"<repo>"){pullRequest(number:<n>){
     userContentEdits(last:10){nodes{editedAt editor{login} diff}}}}}'
   ```

2. ⛔ **PR que toca `.claude/`:** antes de criar, rode a varredura de fechamento da skill `harness-evolution` (cada correção do usuário na conversa, coberta ou descartada). Com o PR aberto, o item esquecido custa outro PR.
3. ⛔ **PR com issue → leia o corpo inteiro dela, sem `grep`, e cruze escopo e critério de aceite item por item** numa tabela no corpo do PR: cada item com o arquivo, teste ou medição que o prova. Item sem prova é pendência dita, nunca "coberto"; o filtro perde a seção que não casa o padrão.

## Contexto

- Base padrão: `develop`. Outra base só em hotfix ou a pedido.
- O diff é a fonte: `git diff <base>...HEAD` (e `git log <base>..HEAD --oneline`). Nada no título ou no corpo que o diff não mostre.

## Título

`<tipo>(<issue>): short description`

- `<tipo>` e `<issue>` saem da branch, que segue o `.claude/CLAUDE.md` (`feat/118` → `feat(118)`). Sem número de issue na branch, omita os parênteses ou pergunte qual issue ligar.
- Descrição em **inglês**, imperativa, minúscula, derivada do diff.

## Corpo (pt-BR)

- `## Objetivo`: o propósito da branch.
- `## Alterações`: as mudanças concretas do diff.
- `## Issue`: `- #<n>` e, na linha seguinte, `Closes #<n>` (documenta a intenção; aqui ele não fecha, porque o PR mira a `develop`). Omita a seção só se a branch não tiver número.
- `## Evidências`: reservada para as capturas do usuário.
- ⛔ Depois de `## Evidências`, o corpo termina com a linha de atribuição, **uma vez só** (atualizando, ela já vem no publicado):

```
🤖 Generated with [Claude Code](https://claude.com/claude-code)
```

## Abrir ou atualizar

1. Push: `git push -u origin $(git branch --show-current)` na primeira vez, `git push` depois.
2. Criar: `gh pr create --base <base> --title "<title>" --body "<body>" --assignee @me`. O `--assignee @me` é obrigatório; PR já aberto sem assignee se corrige com `gh pr edit <n> --add-assignee @me`.
3. Ao abrir, mova o card da issue para `In Review` (o bot do board só reage a criar e a fechar issue).
4. Sem GitHub CLI, pare e avise; não invente outro caminho.

⛔ **PR que aponta para a branch de outro PR, sem pilha nativa:** leia `references/stacked-pr.md` antes do primeiro rebase. Quando a base é mergeada por squash, `git rebase origin/develop` não resolve.

## Checklist

- Título `<tipo>(<issue>): …` derivado do diff; corpo em pt-BR com Objetivo, Alterações, Issue (se houver número) e Evidências.
- PR com `--assignee @me`; atribuição no fim, uma vez.
- ⛔ Esperar o CI nomeia o check que o PR exige (o `name:` do job em `.github/workflows/`), nunca `all(pending)` nem `length >= N`; o relato lê a lista inteira e nomeia cada bucket. Receita: `.claude/skills/prove-the-mechanism/references/ci-e-checks.md`.
