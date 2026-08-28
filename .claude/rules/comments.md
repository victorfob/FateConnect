---
description: Quando comentar — zero no back-end .NET, e no front só o estritamente essencial, cujo teste é impedir uma mudança errada
---

# Comentário

## No back-end .NET, zero

⛔ **Nenhum comentário em C#** — nem `//`, nem `///`, nem XML doc, em código de produção ou de teste. Não há exceção a pesar caso a caso: a regra é a ausência.

Decidido pelo Victor em 2026-08-28, durante a reescrita da `fix/176`: *"vamos ajustar a regra de comentários, zero comentários no backend"*. Saíram 20 linhas de 4 arquivos na mesma rodada — a política de fallback, a guarda de migration, os XML docs da fábrica de teste e a explicação do segredo acentuado —, e nenhum teste caiu.

**Onde a explicação passa a morar:** no nome do símbolo, no corpo do PR, ou na issue. Se um trecho de C# só se entende com texto ao lado, é o trecho que precisa mudar.

⚠️ **A regra é do código, não do repositório.** YAML de workflow, script de shell, Markdown e o front seguem pela seção abaixo — lá o comentário existe, só é raro.

⛔ **Comentário só quando for estritamente essencial:** trecho não óbvio, que não se explica sozinho. **Se o código precisa ser explicado, o problema é o código** — renomeie, extraia, simplifique, e o comentário deixa de ser necessário.

**O teste, antes de escrever qualquer um:** este comentário impede alguém de fazer uma mudança errada? Se sim, fica. Se ele só conta o que o código já diz, sai.

Fica: `Concluido` viaja sem acento **porque o backend serializa assim** (sem isso alguém "corrige" o typo). O `Array.isArray` **porque sem endereço de API o dev server responde HTML com 200** (sem isso alguém apaga a guarda como código morto).

Sai, sempre:

- JSDoc que repete a assinatura ou o nome do símbolo — `/** A fileira de ações do cartão. */` sobre `LostItemActions`.
- Narração do passo seguinte: `// monta os filtros`, `// abre o diálogo`.
- Parágrafo de contexto que pertence ao corpo do PR ou à issue — por que a API ainda não guarda o arquivo, o que a #106 vai implementar.
- Comentário que repete a constante declarada logo acima.

## Forma: JSDoc acima de declaração, `//` dentro de corpo

O comentário que passou no teste acima ainda escolhe a forma errada. Acima de uma **declaração** — `const`, `function`, `type`, `enum`, componente `styled` — é `/** … */`, como `LOST_ITEM_OWNER`, `ErrorScreen` e `CardRoot` estão escritos. **Dentro** de um corpo — propriedade de objeto, ramo de `if`, passo de um teste — é `//`.

⛔ Cobrado no PR #141: `// Instrumentado para a transação…` acima do `const router`, no `main.tsx`. *"Deveria ser jsDoc"*. O mesmo comentário, com o mesmo texto, estava certo — errada estava a forma.

## Comentário que descreve o vizinho envelhece com ele

O comentário que passou nos dois testes acima ainda mente com o tempo: ele foi escrito quando a regra nasceu, e a **regra ao lado mudou depois**. Ninguém releu.

⛔ **Ao adicionar regra, seletor, ramo — ou outro comentário — perto de um comentário existente, releia o comentário vizinho.** É barato e é o único momento em que a divergência é visível.

**Comentário ao lado de comentário é o caso mais fácil de pular**, porque o gesto não parece uma mudança de código: você está justamente escrevendo a explicação, então parece que a explicação já está sendo cuidada. Aconteceu em 2026-08-27 no `sonar-main.yml`: escrevi um bloco novo explicando por que a análise precisa declarar a versão, encostado num bloco que dizia que o run só fica vermelho *"quando algo escapou do gate do PR"* — a frase que acabara de se mostrar falsa, e a razão de eu ter procurado um culpado inexistente. Passei por cima dela para escrever ao lado. Quem apontou foi o Victor.

Aconteceu três vezes no mesmo arquivo, em 2026-08-25, no `eslint.config.js` — e quem achou a primeira foi o Victor:

- *"Valor em `vw`/`vh` e constante nomeada seguem passando"* — duas regras adicionadas depois passaram a pegar exatamente isso.
- *"quem fala com eles é o tema, que está **fora deste recorte**"* — falso: a regra ficou valendo em todo lugar, e a exceção virou um `eslint-disable-next-line` no único ponto.
- *"o `0` cru entrava em `theme.space(0, xs)`"* — verdadeiro mas incompleto: omitia o helper livre, que foi por onde dois escaparam.

**O sinal de risco é a frase que descreve o que *não* é coberto** — "segue passando", "fica de fora", "não alcança". Ela é a primeira a envelhecer, porque descreve a ausência de uma regra que alguém vai acrescentar. Prefira descrever o que o código **faz** e por quê; quando precisar mesmo falar do que fica de fora, nomeie o lugar onde a exceção vive, para que ela apareça na busca.

⛔ **Cobrança repetida do Victor**, a última em 2026-08-24 com os três PRs de achados e perdidos abertos: *"já falei um milhão de vezes, só colocar comentários quando for estritamente essencial… se o código precisa ser explicado é pq ele está mal escrito"*. A varredura tirou **90 linhas líquidas de comentário de 25 arquivos** nos três PRs, e nenhum teste caiu — nenhuma delas estava segurando nada.

## Comentário órfão: a declaração some e ele fica

Caso irmão do anterior e mais difícil de ver: o comentário não passou a descrever o vizinho errado por desatenção — **a declaração que ele documentava foi deletada**. O JSDoc sobrevive, pula a linha em branco e se cola ao próximo símbolo, que ele nunca descreveu.

⛔ **Ao deletar uma declaração, delete o JSDoc de cima junto.** É o mesmo gesto, e é o único momento em que a órfã é visível — nada a acusa depois. Comentário órfão é sintaticamente perfeito: `tsc`, ESLint e Prettier ficam verdes.

**Na varredura, o sinal é JSDoc seguido de linha em branco.** JSDoc encosta na declaração que documenta; havendo um vazio entre os dois, ou ele perdeu o dono ou já está descrevendo o vizinho errado.

Aconteceu em 2026-08-25, no `Header/styles.ts`: `/** Espaço horizontal entre os itens do topo… */` pairando sobre `HeaderBar`, porque a constante de vão que ele documentava saiu na normalização de espaçamento. Na mesma varredura, `PageShell/styles.ts` e `Menu/styles.ts` ainda diziam "recuo em unidades de viewport" sobre código que já lia `theme.space()` — os três mentiam por causa de trabalho da própria branch. Foram 688 comentários lidos e **63 linhas tiradas de 45 arquivos**, sem tocar em uma linha de código.
