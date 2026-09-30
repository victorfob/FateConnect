---
name: write-commit
description: "Mensagem de commit do FateConnect (Conventional Commits, inglês, imperativo) e agrupamento em commits: uma mudança lógica por commit. Use quando o usuário pedir para commitar, escrever ou revisar mensagem de commit, dividir alterações em commits, ou dividir ou reescrever a história da branch."
---

# Commit

## Paradas

1. ⛔ **Antes de qualquer comando git** (`add`, `commit`, `--amend`, `rebase`): mostre o que entra, a mensagem e o comando exato, e espere o sim, mesmo com execução liberada. A autorização de um fluxo ("segue até abrir o PR") cobre o fluxo que ela nomeia; volta ao usuário só a decisão nova (ver `.claude/CLAUDE.md`, "Fluxo de trabalho").
2. ⛔ **Nunca um commit com tudo:** cada commit é uma mudança lógica, que se reverte ou se aplica sozinha sem quebrar a branch.

## Formato

`prefix: message`, em inglês, imperativo, minúsculo depois dos dois-pontos, sem o número da issue (ele está no nome da branch, que segue o `.claude/CLAUDE.md`).

| Prefix     | Use                                                           |
| ---------- | ------------------------------------------------------------- |
| `feat`     | New feature                                                   |
| `fix`      | Bug fix                                                       |
| `chore`    | Changes that do not affect production code (scripts, configs) |
| `ci`       | Pipeline and workflow under `.github/`                        |
| `refactor` | Code changes that do not alter external behavior              |
| `test`     | Adding or updating tests                                      |
| `docs`     | Documentation changes                                         |
| `style`    | Formatting only (spaces, indentation, etc.)                   |

⚠️ **`ci` e `chore` se cortam pelo arquivo:** mexeu em `.github/`, é `ci`; outro script ou configuração é `chore`.

Exemplos: `feat: add submit button`, `fix: correct email field validation`, `docs: update setup README`.

## Uma mudança lógica por commit

- Proponha ou execute **um** commit por vez para a unidade lógica atual, e sugira o próximo para o que sobrou.
- **Agrupar é metade da regra.** Dividir demais é tão errado quanto juntar tudo. O teste: as duas mudanças descrevem o mesmo assunto para quem lê o histórico? Então é **um** commit (filtro, recorte e remoção de job no CI são "ajustar o CI"). Sinal de divisão excessiva: dois commits seguidos no mesmo arquivo pelo mesmo motivo. Hook e CI são assuntos diferentes.
- Pequena correção no último commit ainda local vai por `--amend`; nada de commit `fix typo`.

⛔ **Branch com mais de um commit, reescrita da história, ou commit que mexe em índice (barrel, rotas) ou alarga interface:** leia `references/splitting-and-rewriting.md` antes de propor os commits. Nenhum gate confere que cada commit compila sozinho.
