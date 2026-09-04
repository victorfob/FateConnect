---
name: write-commit
description: >-
  Formato de mensagem de commit do FateConnect (Conventional Commits, mensagem em inglês imperativa),
  nomenclatura de branch e regra de um commit por mudança lógica. Use quando o usuário pedir para
  commitar, escrever ou revisar mensagem de commit, ou dividir alterações em commits.
---

# Commit format

Follow [Conventional Commits](https://www.conventionalcommits.org/). Message in **English**, imperative. Applied whenever the user asks to commit changes.

## Prefixes

| Prefix     | Use                                                           |
| ---------- | ------------------------------------------------------------- |
| `feat`     | New feature                                                   |
| `fix`      | Bug fix                                                       |
| `chore`    | Changes that do not affect production code (scripts, configs) |
| `refactor` | Code changes that do not alter external behavior              |
| `test`     | Adding or updating tests                                      |
| `docs`     | Documentation changes                                         |
| `style`    | Formatting only (spaces, indentation, etc.)                   |

## Format

- `prefix: message`
- Imperative, lowercase after the colon. Do not add the issue code (e.g. Github Issue ID) in the message; it is already in the branch name.

### Examples

- `feat: add submit button`
- `fix: correct email field validation`
- `chore: update dependencies`
- `docs: update setup README`

> **Idioma:** commit, nome de branch e **título** de PR em inglês. A **descrição** do PR é o único texto do fluxo git em pt-BR.

## Branch naming

Branches: `<type>/<issue-code>` — e.g. `feature/123`, `fix/123`, `chore/123`, `refactor/123`, `hotfix/123`.

## Local commits

- Prefer `git commit --amend` for small fixes or additions to the last commit.
- Use `git rebase -i` to group or reorder commits before opening the PR.
- Avoid unnecessary commits (e.g. `fix typo`, `add console.log`). Keep history clean for review.
- Use `--amend` and `rebase` with care.

## User confirmation (mandatory)

**Always ask for user review and confirmation before running any git command** (e.g. `git commit`, `git commit --amend`, `git add`, `git rebase -i`). This applies even when command execution is allowed. Show: (1) what will be committed or staged, (2) the proposed commit message, (3) the exact command to run. Only execute after the user explicitly confirms.

## One logical change per commit (mandatory)

**You MUST NOT** stage and commit all changes in a single commit. **Before suggesting or running any commit:**

1. **Split the work:** Each commit MUST contain exactly one logical change (e.g. one feature, one refactor, one fix, or one docs update). If the current diff mixes multiple concerns (e.g. new API + new component + styles), you MUST split into separate commits.
2. **Verify scope:** Ask yourself: "Could someone revert or cherry-pick this commit alone without breaking the branch?" If no, split further.
3. **One commit per step:** Treat each commit as a standalone unit (readable message, minimal diff, safe to revert).

When the user asks for a commit, propose or execute **one** commit at a time for the current logical unit; then suggest the next commit for the remaining changes. **Do not batch unrelated changes into one commit.**

### Agrupar é metade da regra

A regra é **uma mudança lógica por commit** — não um commit por arquivo, nem um commit por edição. Dividir demais é tão errado quanto juntar tudo: quem revisa passa a ler três diffs que só fazem sentido lidos juntos, e reverter exige achar os três.

**Teste antes de dividir:** as duas mudanças descrevem o mesmo assunto para quem lê o histórico? Se a resposta é sim, é **um** commit.

⛔ Aconteceu na `chore/57`: saíram três commits — filtro de caminho no CI, remoção de um job e recorte dos testes — quando os três eram *"ajustar o CI"*. Correção do Victor: *"são todos relacionados à CI, a ideia é agrupar mudanças lógicas em commits, não fazer só 1 pra tudo e não fazer commits atômicos tbm"*. Pior: uma das fatias não funcionava sozinha (chamava o script sem o `fetch-depth: 0` que a fatia seguinte adicionava), o que viola o próprio critério de "dá para reverter ou cherry-pick isolado".

Sinal de divisão excessiva: dois commits seguidos tocando **o mesmo arquivo** pelo **mesmo motivo**. Hook e CI são assuntos diferentes (um roda na máquina, outro no servidor) — filtro e recorte *dentro* do CI, não.

### Reescrever a história: os blocos saem do diff final, não dos commits antigos

⛔ **Ao refazer a história de uma branch, derive os commits do diff contra a base — nunca da lista de commits que existia.** Os limites antigos guardam a **ordem em que o trabalho aconteceu**, incluindo o vaivém do review que a reescrita existe justamente para apagar. Reaproveitá-los reproduz a divisão errada com mensagens novas.

Aconteceu em 04/09/2026, na #296. A branch tinha 7 commits e eu propus 8 — um por bloco antigo, mais o novo. O Victor perguntou *"não tem como reduzir a quantidade de commits?"*, e a releitura mostrou que **quatro** contavam o mesmo assunto: expor o `ListItem`, montar as seções, criar o `Sair` e ligar tudo na casca não se revertem um sem o outro. Viraram um, e a branch fechou em 4.

**O sinal é a contagem não cair.** Reescrita que sai com tantos commits quantos entraram não reagrupou nada — só renomeou.

### Quando as mudanças se sobrepõem nos mesmos arquivos

Lote de mudanças mecânicas (rename, `Readonly`, namespace de import) costuma tocar os **mesmos arquivos**. Reconstruir "como o arquivo estava depois do commit 3" à mão é lento e erra em silêncio. Em vez disso, **replay**:

1. Snapshot do estado final (`cp -r src <tmp>`), conferindo a contagem de arquivos.
2. Voltar ao HEAD: `git checkout -- .` e `git clean -fd`.
3. Reaplicar **uma transformação por vez**, commitando cada uma.
4. No fim, `diff -r <tmp>/src src` — **zero diferenças** prova que o histórico dividido chega no mesmo estado que já passou nos gates.

⚠️ **Reaplique o script da transformação; não copie o arquivo pronto do snapshot** — o arquivo pronto traz junto as outras transformações. Aconteceu no PR #77: o commit da navegação levou o rename de enum e teve que ser refeito reconstruindo o trecho a partir de `git show HEAD:<arquivo>`.

⚠️ **Antes do primeiro commit, conferir que o índice está limpo** (`git diff --cached --stat` vazio). Índice sujo faz o primeiro commit engolir o lote inteiro — aconteceu no PR #76.

### O commit do meio não exibe palavra que não é nem a antiga nem a final

⛔ **Ao dividir um rename em dois commits, confira o que cada um mostra na tela.** Quem revisa lê commit a commit, e um estado intermediário que não é o produto de antes nem o de depois se lê como sobra.

Na #310 o corte foi "contrato para inglês" e depois "rename da copy", nessa ordem, para que nenhum commit escrevesse inglês na barra de endereço. O efeito colateral: no primeiro, o `STATUS_SLUG` dizia `cancelado` enquanto o PR inteiro era sobre `excluido`. O Victor apontou **duas vezes** achando que era resíduo.

**A ordem que evita isso põe o visível primeiro:** o commit da copy já mostra a palavra final, e o do contrato, depois dele, não toca em rótulo nem em URL. Escolhendo a outra ordem, diga no corpo do PR o que o commit do meio exibe — e conte com a pergunta assim mesmo.
