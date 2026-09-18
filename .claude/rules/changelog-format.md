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

### Teto: 300 caracteres por entrada

⛔ **Entrada passou de 300 caracteres? Ela está descrevendo mais de uma capacidade — divida, não encurte.** "Linha curta" sem número nunca mordeu: foi assim que nasceu uma entrada de **802 caracteres**, a maior do arquivo, contando lista, foto, mudança de situação e filtro numa frase só. Quem viu foi o Victor, pelo tamanho do bloco no diff.

**O estado do arquivo hoje, 152 entradas:**

| Até | Entradas | Acumulado |
| --- | --- | --- |
| 150 caracteres | 54 | 35% |
| 200 | 88 | 57% |
| **300** | **132** | **86%** |
| 400 | 145 | 95% |
| acima de 400 | 7 | 100% |

⚠️ **O teto é barato porque 86% já o cumprem.** Ele não corta o que existe — impede a entrada gigante de nascer.

⛔ **Dividir NÃO contradiz "uma entrada principal por tarefa".** Aquela regra existe contra **um bullet por commit**, que repete o `git log`. Esta existe contra **um bullet por tarefa inteira**, que empilha capacidades independentes numa frase. O corte é o mesmo nos dois casos: **uma entrada por capacidade que quem usa ganha** — quatro coisas que se usam separadamente são quatro entradas, seis commits que entregam uma coisa são uma.

**O teste, quando estourar:** liste o que a entrada promete. Itens que alguém usaria em momentos diferentes viram entradas próprias; detalhe que só existe por causa de outro fica junto dele.

⚠️ **As 19 que hoje passam do teto ficam.** Entrada de release publicada é registro do que foi dito naquela versão, e reescrevê-la depois muda o histórico sem que ninguém ganhe nada. O teto vale para o que ainda vai ser escrito.
- **Termina no número do PR**, entre parênteses: `(#84)`. **Sempre o PR, nunca a issue** — o link precisa cair no diff e no review, não no planejamento. Se o PR ainda não existe, use `(#?)` e troque antes do merge.
- **Fecha com o lado que mudou:** `[Frontend]` ou `[Backend]`, **depois** do número do PR. O repositório guarda o front e a API .NET, e quem lê a release precisa saber o que precisa subir. Mudança que só funciona com os dois lados leva os dois marcadores, nessa ordem — e se cada lado produzir um efeito diferente, são duas entradas, não uma com dois marcadores.
- **Correção entra mesmo sem efeito visível hoje.** O changelog é registro de alteração, não nota de divulgação: defeito corrigido em serviço publicado entra ainda que nenhum cliente atual chegue nele — e o marcador de lado é o que avisa quem precisa subir. Descreva o defeito **como ele era**, sem sugerir que alguém o sofreu quando ninguém sofreu.
- **Item que não muda comportamento não entra.** Remoção de helper morto, refactor sem efeito externo, ajuste de teste, configuração de lint ou de CI: isso vive no histórico de commit, não no changelog.

### Citar o rótulo só quando o rename é a mudança

⛔ **A entrada cita o texto da tela entre crases quando a troca de palavra **é** o que mudou** — foi o caso de `Excluir` virando `Arquivar`, em que a frase não se escreve sem as duas palavras. Fora disso, descreva o **efeito** e deixe o rótulo fora.

Dois motivos, e o segundo é o que morde:

- **A copy ainda se move.** O rótulo citado é o estado de um dia; o review mexe nele, e a entrada passa a citar texto que a tela não tem. Em 14/09/2026 a entrada da tela de denúncia citou um rótulo que mudou **duas vezes** durante o review.
- ⛔ **Fora da tela, o rótulo perde quem o qualifica.** Ali a palavra era `Anônimo`, e o que a corrige é uma frase que só aparece ao ligar a opção. Sozinha numa nota de release, ela promete anonimato que o sistema não entrega — a entrada passou a dizer o efeito: *"pode enviar sem que os seus dados cheguem a quem analisa"*.

⚠️ **O teste:** apague o rótulo da frase. Se a entrada continua dizendo o que mudou, ele não precisava estar lá.

### E o mesmo vale para nome de contrato

⛔ **Citar o nome de um campo de API amarra a entrada a um contrato que o review ainda pode mudar.** Em 14/09/2026 a entrada do #410 citava o campo `onlyMine` da consulta; o campo foi **removido no mesmo PR**, e a entrada teve de ser reescrita do zero — o que ela dizia deixou de existir.

**Cite quando o nome é a mudança** — foi o caso de `onlyMyItems` virando `onlyMine`, que não se escreve sem os dois. Fora disso, descreva o efeito: *"o recorte vem do perfil de quem pede, sem campo na consulta"* sobrevive a qualquer renomeação.

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
- Corrige a perda de descrição sofrida por quem editava carona    <- defeito que ninguém alcançou; não invente a vítima
```

## Um bullet por commit é o sintoma

Changelog com uma linha por commit é changelog escrito no automático: ele repete o `git log` e não responde o que mudou para quem usa. Se a tarefa rendeu seis commits e uma frase, é uma entrada.
