---
description: Idioma no front — o que a pessoa lê e a URL em pt-BR, inclusive a query string; código, pastas, tokens e nomes de teste em inglês; o domínio carona é `Ride`
paths:
  - "FateConnect/Web/**"
---

# Idioma no front

## pt-BR

- Copy de produto: tela, notificação, diálogo, placeholder, `aria-label` que é mensagem, e o erro de bootstrap do `main.tsx`.
- Segmento de rota e âncora: os valores estão em `src/routes/paths.ts` (`RoutePathEnum`, `LandingSectionEnum`). ⛔ Trocar um quebra link salvo: só com decisão de produto.
- ⛔ **Query string também, o nome e o valor:** `?meus=true` é errado como `/lost-and-found` seria. Booleano é `sim`/`nao`; conjunto fechado usa o rótulo da interface em minúscula e sem acento (`?tipo=solidaria`), nunca o valor que a API serializa. A leitura tolera maiúscula, e valor irreconhecível cai no padrão.
- `index.html` com `lang="pt-BR"`; comentário e JSDoc em pt-BR, citando nome de API em inglês quando precisar.

## Inglês

- Tipo, enum, função, prop, hook, variável, pasta e arquivo; `id` e seletor que só o código usa; tokens do design system (`primary`, `textMuted`).
- ⛔ **Carona no código é `Ride`** (`RideFilter`, `listRides`, `pages/Rides/`), nunca *Carona*.
- Teste: `describe`/`it` em inglês no formato `should …`; a copy dentro da asserção continua em pt-BR, porque é o texto real da tela.
