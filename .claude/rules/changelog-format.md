---
description: Formato das entradas do CHANGELOG — Keep a Changelog, cabeçalho em inglês, conteúdo em pt-BR no imperativo, uma entrada principal por tarefa, terminando no número do PR e no lado que mudou
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
- **Fecha com o lado que mudou:** `[Frontend]` ou `[Backend]`, **depois** do número do PR. O repositório guarda o front e dois serviços .NET, e quem lê a release precisa saber o que precisa subir. Mudança que só funciona com os dois lados leva os dois marcadores, nessa ordem — e se cada lado produzir um efeito diferente, são duas entradas, não uma com dois marcadores.
- **Item puramente interno não entra.** Remoção de helper morto, refactor sem efeito externo, ajuste de teste: isso vive no histórico de commit, não no changelog.

### Faça

```markdown
- Adiciona a tela de menu da área logada (#81) [Frontend]
- Corrige o aviso que não aparecia sobre superfície clara (#84) [Frontend]
- Corrige a recusa de carona marcada para as próximas horas (#99) [Backend]
- Remove o prefixo das rotas, que o front nunca enviou (#99) [Frontend] [Backend]
```

### Não faça

```markdown
- Adiciona o componente `PageMessage` no design system (#79)     <- implementação, não efeito
- Adiciona `constants/index.ts` em `pages/Menu` (#81)            <- detalhe de arquivo
- Corrigido bug no hover                                          <- não é imperativo
- Foi adicionada a tela de menu                                   <- não é imperativo
- Adiciona a tela de menu                                         <- falta o PR
- Adiciona a tela de menu (#78)                                   <- é a issue, não o PR
- Adiciona a tela de menu (#81)                                   <- falta o lado que mudou
- Adiciona a tela de menu [Frontend] (#81)                        <- o marcador vem depois do PR
```

## Um bullet por commit é o sintoma

Changelog com uma linha por commit é changelog escrito no automático: ele repete o `git log` e não responde o que mudou para quem usa. Se a tarefa rendeu seis commits e uma frase, é uma entrada.
