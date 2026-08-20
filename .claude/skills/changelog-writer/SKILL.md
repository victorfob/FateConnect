---
name: changelog-writer
description: >-
  Escreve a entrada do CHANGELOG para a mudança da branch atual, no formato do Keep a Changelog.
  Use quando o usuário pedir para escrever, preencher ou revisar changelog, ou ao fechar uma tarefa
  cujo efeito o usuário final percebe. Cobre inferir a mudança pelo diff, escolher a seção, escrever
  no imperativo e fechar com o número do PR.
---

# Escrever a entrada do changelog

O formato está em `.claude/rules/changelog-format.md` — esta skill é o procedimento. Entradas vão direto em `## [Unreleased]` no `CHANGELOG.md` da raiz.

## 1. Descobrir o que mudou

```bash
git diff origin/develop...HEAD --stat
git log origin/develop..HEAD --oneline
```

O diff e os commits dizem **o que** foi tocado. A entrada precisa dizer **o efeito para quem usa** — e isso o diff quase nunca entrega sozinho. Se não estiver claro qual é o efeito, **pergunte**; não deduza a partir de nomes de arquivo.

## 2. Decidir se a mudança entra

Entra quando alguém que usa a aplicação percebe: tela nova, comportamento diferente, correção visível, remoção de funcionalidade.

**Não entra:** refactor sem efeito externo, remoção de código morto, ajuste de teste, mudança de configuração de lint ou de CI. Isso vive no histórico de commit.

Na dúvida, a pergunta é: *alguém que não leu o PR se importaria?*

## 3. Escolher a seção

| Seção | Quando |
| ----- | ------ |
| `Added` | funcionalidade que não existia |
| `Changed` | comportamento existente que passou a funcionar diferente |
| `Fixed` | defeito corrigido |
| `Removed` | funcionalidade que saiu |
| `Deprecated` | ainda existe, mas vai sair |
| `Security` | correção com impacto de segurança |

Reescrever algo por dentro sem mudar o que o usuário vê é `Changed`, não `Added`: para quem usa, nada foi adicionado.

## 4. Escrever

Uma entrada principal, imperativo, linha curta, terminando no número do PR:

```bash
gh pr view --json number --jq .number
```

Se o PR ainda não foi aberto, escreva `(#?)` e **avise na resposta** que precisa ser trocado antes do merge.

## 5. Reler antes de entregar

Confira linha por linha — é o que a review pega:

- [ ] começa com verbo no imperativo (`Adiciona`, `Corrige`, `Remove`, `Reescreve`)
- [ ] descreve o **efeito**, não a implementação: sem nome de arquivo, de componente ou de camada
- [ ] termina com `(#<número do PR>)` — o PR, nunca a issue
- [ ] a seção existe e tem mudança de verdade; seção vazia não fica no arquivo
- [ ] é **uma** entrada para a tarefa, não uma por commit

## Armadilha

Se a tarefa rendeu vários commits e você escreveu vários bullets, provavelmente descreveu o `git log` em vez da mudança. Agrupe: seis commits e uma frase é o resultado esperado.
