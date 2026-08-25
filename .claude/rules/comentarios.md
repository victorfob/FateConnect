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

⛔ **Cobrança repetida do Victor**, a última em 2026-08-24 com os três PRs de achados e perdidos abertos: *"já falei um milhão de vezes, só colocar comentários quando for estritamente essencial… se o código precisa ser explicado é pq ele está mal escrito"*. A varredura tirou **90 linhas líquidas de comentário de 25 arquivos** nos três PRs, e nenhum teste caiu — nenhuma delas estava segurando nada.
