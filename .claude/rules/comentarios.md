---
description: Quando comentar — só o estritamente essencial, e o teste é se o comentário impede uma mudança errada
---

# Comentário

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

⛔ **Ao adicionar regra, seletor ou ramo perto de um comentário existente, releia o comentário vizinho.** É barato e é o único momento em que a divergência é visível.

Aconteceu três vezes no mesmo arquivo, em 2026-08-25, no `eslint.config.js` — e quem achou a primeira foi o Victor:

- *"Valor em `vw`/`vh` e constante nomeada seguem passando"* — duas regras adicionadas depois passaram a pegar exatamente isso.
- *"quem fala com eles é o tema, que está **fora deste recorte**"* — falso: a regra ficou valendo em todo lugar, e a exceção virou um `eslint-disable-next-line` no único ponto.
- *"o `0` cru entrava em `theme.space(0, xs)`"* — verdadeiro mas incompleto: omitia o helper livre, que foi por onde dois escaparam.

**O sinal de risco é a frase que descreve o que *não* é coberto** — "segue passando", "fica de fora", "não alcança". Ela é a primeira a envelhecer, porque descreve a ausência de uma regra que alguém vai acrescentar. Prefira descrever o que o código **faz** e por quê; quando precisar mesmo falar do que fica de fora, nomeie o lugar onde a exceção vive, para que ela apareça na busca.

⛔ **Cobrança repetida do Victor**, a última em 2026-08-24 com os três PRs de achados e perdidos abertos: *"já falei um milhão de vezes, só colocar comentários quando for estritamente essencial… se o código precisa ser explicado é pq ele está mal escrito"*. A varredura tirou **90 linhas líquidas de comentário de 25 arquivos** nos três PRs, e nenhum teste caiu — nenhuma delas estava segurando nada.
