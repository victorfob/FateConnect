---
description: Formato das entradas do CHANGELOG — Keep a Changelog, cabeçalho em inglês, conteúdo em pt-BR no imperativo, uma entrada principal por tarefa, terminando no número do PR
paths:
  - "CHANGELOG.md"
---

# Formato do changelog

O `CHANGELOG.md` da raiz segue o [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) e cobre o repositório inteiro.

**Entradas entram direto em `## [Unreleased]`.** Não há diretório de fragmentos: aquilo existe para evitar conflito quando várias frentes mergeiam em paralelo, e depende de automação de release para consolidar — nada disso existe aqui.

## Estrutura

Cabeçalhos **em inglês**, conteúdo **em pt-BR** — é o idioma do produto:

`### Added` · `### Changed` · `### Deprecated` · `### Removed` · `### Fixed` · `### Security`

Só as seções com mudança de verdade aparecem. Seção vazia não fica no arquivo.

## Como escrever a entrada

- **Imperativo.** "Adiciona", "Corrige", "Remove", "Reescreve" — nunca "Adicionado", "Foi adicionado", "Adicionando".
- **Uma entrada principal por tarefa.** A entrada descreve o **efeito para quem consome**, não a implementação. Agrupe as mudanças relacionadas numa linha concisa.
- **Uma linha curta por mudança.** Sem lista de arquivo, camada ou nome interno.
- **Termina no número do PR**, entre parênteses: `(#84)`. **Sempre o PR, nunca a issue** — o link precisa cair no diff e no review, não no planejamento. Se o PR ainda não existe, use `(#?)` e troque antes do merge.
- **Item puramente interno não entra.** Remoção de helper morto, refactor sem efeito externo, ajuste de teste: isso vive no histórico de commit, não no changelog.

### Faça

```markdown
- Adiciona a tela de menu da área logada (#81)
- Corrige o aviso que não aparecia sobre superfície clara (#84)
- Remove a tela de contato; o contato passa a ser seção da landing (#79)
```

### Não faça

```markdown
- Adiciona o componente `PageMessage` no design system (#79)     <- implementação, não efeito
- Adiciona `constants/index.ts` em `pages/Menu` (#81)            <- detalhe de arquivo
- Corrigido bug no hover                                          <- não é imperativo
- Foi adicionada a tela de menu                                   <- não é imperativo
- Adiciona a tela de menu                                         <- falta o PR
- Adiciona a tela de menu (#78)                                   <- é a issue, não o PR
```

## Um bullet por commit é o sintoma

Changelog com uma linha por commit é changelog escrito no automático: ele repete o `git log` e não responde o que mudou para quem usa. Se a tarefa rendeu seis commits e uma frase, é uma entrada.
