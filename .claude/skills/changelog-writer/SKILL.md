---
name: changelog-writer
description: "Escreve a entrada do CHANGELOG da branch atual no formato Keep a Changelog. Use quando o usuário pedir para escrever, preencher ou revisar changelog, ou ao fechar uma tarefa que muda comportamento (inclusive correção sem efeito visível). Cobre decidir se entra, escolher a seção, o teto de 300 caracteres, o número do PR e o marcador de lado."
---

# Escrever a entrada do changelog

O `CHANGELOG.md` da raiz segue o [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) e cobre o repositório inteiro. Entradas entram direto em `## [Unreleased]`, sem diretório de fragmentos. Cabeçalhos de seção em inglês, conteúdo em pt-BR.

## 1. Descobrir o que mudou

```bash
git diff origin/develop...HEAD --stat
git log origin/develop..HEAD --oneline
```

O diff diz o que foi tocado; a entrada diz o **efeito para quem usa**. Se o efeito não estiver claro, pergunte, em vez de deduzir por nome de arquivo.

## 2. Decidir se entra

- **Entra** toda alteração de comportamento: tela nova, comportamento diferente, defeito corrigido, funcionalidade removida.
- **Correção entra mesmo que ninguém chegue nela hoje**: o changelog registra alteração, e o marcador de lado avisa o que precisa subir. Descreva o defeito como ele era, sem inventar vítima.
- ⛔ **Defeito que nasceu e morreu dentro do mesmo `Unreleased` não entra.** O corte é a release: atravessou uma versão publicada, entra; viveu entre dois merges da mesma seção, não.
- **Não entra** o que não muda comportamento: refactor sem efeito externo, código morto, teste, lint, CI.

Na dúvida: *o comportamento mudou?*, não *o usuário perceberia?*

## 3. Escolher a seção

| Seção | Quando |
| ----- | ------ |
| `Added` | funcionalidade que não existia |
| `Changed` | comportamento existente que passou a funcionar diferente (reescrita por dentro sem mudar o que se vê é `Changed`) |
| `Fixed` | defeito corrigido |
| `Removed` | funcionalidade que saiu |
| `Deprecated` | ainda existe, mas vai sair |
| `Security` | correção com impacto de segurança |

Só aparecem as seções com mudança; seção vazia não fica no arquivo.

⛔ **Antes de escrever, procure a entrada irmã**, de mudança da mesma natureza: ela diz o que cabe dentro da frase (ex.: a remoção de um campo do cadastro diz se a requisição antiga segue aceita e o que se perde ao subir).

```bash
grep -n -i "<o conceito, ou a natureza da mudança>" CHANGELOG.md
```

## 4. Escrever

- **Imperativo:** `Adiciona`, `Corrige`, `Remove`, `Reescreve`; nunca `Adicionado`, `Foi adicionado`.
- **Uma entrada por capacidade que quem usa ganha.** Seis commits que entregam uma coisa são uma entrada; quatro coisas que se usam separadamente são quatro. Um bullet por commit é o sintoma de changelog escrito no automático.
- ⛔ **Teto de 300 caracteres.** Estourou: a entrada descreve mais de uma capacidade. Divida, não encurte; o teste é listar o que ela promete e separar o que alguém usaria em momentos diferentes.
- **Efeito, não implementação:** sem nome de arquivo, componente ou camada. Rótulo de tela ou nome de campo da API só quando a troca de nome **é** a mudança: a copy e o contrato ainda se movem no review, e fora da tela o rótulo perde quem o qualifica.
- **Termina no número do PR**, `(#84)`, nunca a issue. Sem PR aberto, `(#?)`, e avise na resposta que precisa ser trocado antes do merge:

  ```bash
  gh pr view --json number --jq .number
  ```

- **Fecha com o lado que mudou**, depois do PR: `[Frontend]`, `[Backend]`, ou os dois nessa ordem quando a mudança exige os dois lados. Cada lado com efeito diferente é uma entrada própria.

```markdown
- Adiciona a tela de menu da área logada (#81) [Frontend]
- Corrige a recusa de carona marcada para as próximas horas (#99) [Backend]
- Remove o prefixo das rotas, que o front nunca enviou (#99) [Frontend] [Backend]
```

```markdown
- Adiciona o componente `PageMessage` no design system (#79)     <- implementação, não efeito
- Corrigido bug no hover                                          <- não é imperativo
- Adiciona a tela de menu (#78)                                   <- é a issue, não o PR
- Adiciona a tela de menu [Frontend] (#81)                        <- o marcador vem depois do PR
- Corrige a perda de descrição sofrida por quem editava carona    <- defeito que ninguém alcançou; não invente a vítima
```

⛔ **Entrada de release publicada não se reescreve**, nem para caber no teto: ela registra o que foi dito naquela versão.

## 5. O commit do changelog é o último da branch

⛔ Deixe o changelog no último commit, depois de todos os outros: é o que permite trocar o `(#?)` pelo número com `git commit --amend` assim que o PR abrir, sem um commit só para isso.

## 6. Reler antes de entregar

- [ ] imperativo, efeito, até 300 caracteres
- [ ] `(#<PR>)` e depois `[Frontend]`/`[Backend]`
- [ ] seção certa, sem seção vazia
- [ ] uma entrada por capacidade, não por commit
