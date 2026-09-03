---
description: Boas práticas de estilização no front React — centralização, componentes do MUI e proibição de valor literal
paths:
  - "FateConnect/Web/**"
---

# Estilização — boas práticas

Complementa `.claude/rules/web-design-system.md` (barrel, tokens, proibições).

## ✅ Recomendado

### 1. Centralizar estilos

- Todo estilo vive em `styles.ts`, ao lado do `index.tsx` do componente.
- Importar como namespace: `import * as S from './styles'`.
- Nunca estilizar inline.

### 2. `Stack` quando for flex, `Box` no resto — nunca tag crua

```ts
// ❌ Evitar
export const Row = styled('div')({ display: 'flex', gap: '1rem' });

// ✅ Recomendado — Stack já é flex
import { Stack, styled } from '@design-system';

export const Row = styled(Stack)({ flexDirection: 'row', gap: '1rem' });
```

⚠️ **O `Stack` é flex em COLUNA por padrão**, enquanto `display: flex` cru é linha. Ao converter, declare `flexDirection` explicitamente na base — senão metade do layout vira coluna em silêncio.

Para o que não é flex, use `Box`.

Quando o elemento tiver **semântica** (`footer`, `section`, `article`, `nav`, `ul`), manter a semântica pela prop `component` no ponto de uso — `<S.Container component="footer">` — em vez de voltar para a tag crua. Acessibilidade e paridade dependem disso.

Para receber `component`, o alvo é `PolymorphicStack` ou `PolymorphicBox`, não `Stack`/`Box` crus:

```ts
import { PolymorphicStack, styled } from '@design-system';

export const Container = styled(PolymorphicStack)({ flexDirection: 'row' });
// <S.Container component="footer">
```

O `styled` do Emotion resolve as props do `Box` e do `Stack` pela última assinatura de chamada deles, onde `component` não aparece — e a prop some da tipagem. Os dois alvos pré-tipados declaram o que já é verdade. Alvo que **não** vai receber `component` continua sendo o cru: anotar tudo era o vício antigo, e 79 das 113 anotações nunca recebiam a prop.

⛔ **Não estenda a lista de alvos pré-tipados para componente que não aceita `component`.** Foi medido: `AccordionDetails` é função simples, sem a prop, e o repo faz `styled(AccordionDetails)`. Prometê-la ali compila, mas em runtime o `component` chega ao DOM como atributo cru e a semântica se perde calada. Por isso a injeção **não** vive no `styled` — se vivesse, valeria para todo alvo.

Se o alvo tem props próprias — um `NavLink` com `to`, um `button` com `type` —, declare-as no genérico em vez de forçar cast:

```ts
export const Tab = styled(PolymorphicBox)<Pick<NavLinkProps, 'to' | 'end'>>({ ... });
```

## ❌ Evitar

### 1. Estilização inline

```tsx
// ❌ Evitar
<Box sx={{ padding: '16px' }}>

// ✅ Recomendado
import { Box, spacingScale, styled } from '@design-system';

const { md } = spacingScale;

export const StyledBox = styled(Box)(({ theme }) => ({
  padding: theme.space(md),
}));
```

### 2. Cor literal ou token de cor no componente

```ts
// ❌ Evitar
color: '#43545C';
color: colorTokens.primary;

// ✅ Recomendado
color: theme.palette.text.primary;
```

Os tokens **alimentam a paleta** em `theme/`; componente lê `theme.palette`. Falta um slot? Declare na paleta, não importe o token. **O lint reprova** o import de `colorTokens` fora do tema.

### 3. Valores literais

```ts
// ❌ Evitar
padding: '16px';
zIndex: 1200;

// ✅ Recomendado
import { Box, spacingScale, styled } from '@design-system';

const { md } = spacingScale;

export const Container = styled(Box)(({ theme }) => ({
  padding: theme.space(md),
  zIndex: theme.zIndex.drawer,
}));
```

⛔ **`gap`, `padding` e `margin` são sempre `theme.space()`.** Não existe px cru nessas três propriedades, nem herdado de código antigo: o painel de filtros carregava um `gap: '3px'` e o cartão de achados e perdidos um `gap: '5vw'`, os dois copiados de caronas na migração. Valor fora da escala vira o token mais próximo. Px literal continua valendo para o que **não é espaçamento** — largura de miniatura, altura de botão, raio.

### Espaçamento e raio saem do tema, mas **não** de `theme.spacing`

`theme.space(token)` e `theme.radius(token)` são chaves **nossas**, adicionadas ao tema por augmentation. O valor continua vindo de `spacingScale`/`radiusScale`, que se importa e desestrutura como sempre — muda só quem faz a conversão para `rem`.

A escala vai de `none` (0) a `giant` (112). Os dois últimos degraus — `huge` (80) e `giant` (112) — são de **página**: goteira e respiro de seção. Componente não chega neles.

⛔ **`theme.spacing` é do MUI e não se toca.** Os componentes dele chamam `theme.spacing(1..3)` esperando o multiplicador de 8px; trocar a transformação encolheu as gutters do `Toolbar` de 24px para 3px. Por isso a nossa chave se chama `space`, e **o lint reprova `theme.spacing(`** — quem errar por três letras descobre na hora.

Os helpers **não são exportados** pelo barrel: não há como importá-los na aplicação, e é de propósito. O acesso é sempre pelo tema, o que também elimina dois imports por `styles.ts`. As demais escalas — `zIndex`, `transitions`, `shadows` — já vinham do `theme`, porque essas o MUI não distorce.

### Duas visões, um limite

O produto tem **mobile e desktop**, e nada entre os dois:

```ts
[theme.breakpoints.down('md')]: { flexDirection: 'column' }   // mobile
[theme.breakpoints.up('md')]: { gridColumn: 'span 2' }        // desktop
```

O `md` está sobrescrito em **769px**, e é o único que mexemos: `Toolbar` e `Dialog` leem o `sm` por dentro, então esse fica nos valores do MUI. ⛔ Não declare consulta de media à mão nem crie um terceiro limite — havia quatro constantes para três valores, e a quarta sobrepunha as outras: em exatos 768px o cabeçalho ficava mobile enquanto a grade do cadastro ficava desktop. As consultas do MUI não se sobrepõem, porque o `down` para meio centésimo antes do `up`.

Para decidir em JS, `useMediaQuery(theme.breakpoints.up('md'))` — não meça `window.innerWidth`.

### 4. CSS puro / classe solta

```tsx
// ❌ Evitar
<div className="container">

// ✅ Recomendado
<S.Container>
```

## Alinhe o desenho, não a caixa

⛔ **`getBoundingClientRect` de um ícone devolve a caixa dele, e a arte quase nunca a preenche.** Alinhar caixa com caixa deixa o desenho fora da linha, e a medição confirma um alinhamento que o olho recusa.

Medido em 01/09/2026, no X do diálogo: a arte ocupa **14px numa caixa de 24px** — 5px de margem própria de cada lado. Somados aos 8px de recuo do botão, o desenho caía a **37px** da borda do papel, enquanto os campos estavam a 32px. A caixa estava exatamente onde eu a tinha posicionado; o X, não.

**Como medir o desenho:** `path.getBBox()` no `svg`, convertido para a escala da tela pela razão entre a largura renderizada e a do `viewBox`. Para texto, `Range.selectNodeContents` no elemento — a caixa do parágrafo inclui entrelinha que o olho não vê.

### Vão entre elementos: da tinta até a **faixa de fundo** do vizinho

⛔ **Vão entre um rótulo e o item abaixo dele não se mede de caixa a caixa nem de tinta a tinta.** O item de lista tem 48px de altura e a tinta dele fica no meio; o que o olho vê começar é o **fundo**. A medida que corresponde ao que se enxerga é da tinta do rótulo até a borda da faixa do item.

Medido de três jeitos na #291, e os dois primeiros levaram a conclusões erradas:

| Instrumento | Respondeu | O que produziu |
| --- | --- | --- |
| caixa → caixa | **0px**, antes e depois da correção | quase concluí que a correção não pegou |
| tinta → tinta | 20px | pareceu folgado, e a devolução foi *"ainda ta mto colado"* |
| tinta → **faixa de fundo** | **6px** | era o número |

⚠️ **O sinal é o número que não se move.** `padding` acrescentado a um elemento para afastá-lo do vizinho **não altera** a distância entre as caixas — só `margin` alteraria. Se a medida é a mesma depois de uma correção que você sabe que aplicou, o instrumento está medindo a caixa.

⚠️ **Quem reclama é sempre a pessoa que olha a tela**, porque o número mente com confiança: eu tinha `32px` de um lado e `32px` do outro, e mesmo assim estava torto. Ao receber "não está alinhado" sobre algo que você mediu, desconfie do **que** foi medido antes de duvidar do relato.

## Sobrescrever estado do MUI: repita a classe do componente

⛔ **`& .Mui-selected` empata com o seletor da biblioteca e perde no desempate por ordem de fonte.** Use `& .MuiPaginationItem-root.Mui-selected` — a classe do componente mais a do estado —, que sobe a especificidade acima da do MUI. Vale para `.Mui-selected`, `.Mui-disabled`, `.Mui-focused`, `.Mui-checked` e companhia.

**O sintoma é traiçoeiro porque é parcial:** só as propriedades que o MUI também declara voltam ao valor dele. Na #171 o `color` aplicava e o `backgroundColor` não, e o número da página selecionada saía **branco sobre o cinza da biblioteca** — quase ilegível. Um seletor que "quase funciona" é mais difícil de ver do que um que não funciona.

⚠️ **Nenhum gate pega isso.** ESLint, `tsc`, a suíte e o teste de contraste passam: nenhum deles renderiza o componente com o CSS do MUI competindo. A conferência é rodar na aplicação — ver `.claude/rules/parallelism-and-worktrees.md`.

## 📚 Referências

- [Palette](https://mui.com/material-ui/customization/palette/)
- [Typography](https://mui.com/material-ui/customization/typography/)
- [Spacing](https://mui.com/material-ui/customization/spacing/)
- [Breakpoints](https://mui.com/material-ui/customization/breakpoints/)
- [Container Queries](https://mui.com/material-ui/customization/container-queries/)
- [Density](https://mui.com/material-ui/customization/density/)
- [z-index](https://mui.com/material-ui/customization/z-index/)
- [Transitions](https://mui.com/material-ui/customization/transitions/)

## Aplicado pelo lint

Uso de API marcada como `@deprecated` é **erro** (`@typescript-eslint/no-deprecated`, com informação de tipo via `projectService`). O recorte cobre `**/*.{js,ts,tsx}`, o que inclui o **próprio `eslint.config.js`** — e ele precisa de `projectService: { allowDefaultProject: ['eslint.config.js'] }`, porque é `.js` e fica fora do `include` do `tsconfig`. Sem isso o parser reprova com *"was not found by the project service"*; sem o `.js` no recorte, uma API deprecada dentro do próprio config passa despercebida — foi o que aconteceu com o `tseslint.config()`. Ao ligar, ela já pegou o `.email()` do zod nos dois schemas — trocado por `.pipe(z.email(...))`, que preserva a ordem "obrigatório antes de inválido".

Número solto é **erro** (`@typescript-eslint/no-magic-numbers`): valor numérico com significado vira constante cujo nome diz o **significado**, não o valor — `JANUARY` e `SINGLE_PAGE`, nunca `ZERO`. **Não há exceção para `0`, `1` e `-1`**: eram justamente eles que passavam. Ficam de fora os testes e valores dentro de objeto (é o que permite tabelas de token como `spacingScale`).

`console` solto é **erro** (`no-console`) — em qualquer arquivo, inclusive teste. Depuração não vai para produção, e o rastro de erro é responsabilidade de quem trata o erro, não de um `console.error` esquecido no componente. `vi.spyOn(console, 'error')` continua valendo em teste: a regra reprova o acesso a `console.<método>`, não passar `console` como argumento.

Estas proibições de **sintaxe** guardam as decisões de escala — todas com sonda que prova que pegam:

| Proibido | Saída |
| -------- | ----- |
| número cru em `theme.space()`, `theme.radius()` e no helper livre | token de `spacingScale`/`radiusScale`, `none` para zero |
| número cru em `gap`, `padding`, `margin` e variantes | idem — constante nomeada satisfaz o `no-magic-numbers` e ainda assim não é o token |
| `theme.spacing(...)` | `theme.space()` |
| chave de breakpoint que não seja `md` | `down('md')` e `up('md')`; só o tema fala `sm`, para desfazer o do MUI |
| `@media` de largura escrito à mão | as duas consultas do tema |
| `vw`/`vh` em medida (menos `100vh`) | token, com override em `down('md')` se mobile e desktop diferirem |
| tag HTML crua em `styled(...)` | `styled(PolymorphicBox)` com a semântica em `component` |
| `sx` inline | `styles.ts` com `styled(...)` |

⚠️ **Literal se esconde em constante nomeada.** `const PAGE_PADDING = '3vw 7vw'` não aparece numa varredura de `propriedade: valor` — o literal está na declaração, longe do uso. Foi assim que quatro goteiras em `vw` sobreviveram a duas varreduras minhas. Quem garante agora é o lint, que casa o literal em qualquer posição sintática.

⚠️ **`no-restricted-syntax` substitui a lista inteira, não soma.** Foi assim que essas proibições ficaram desligadas dentro dos `styles.ts` — justamente onde `styled(` se escreve. Os seletores vivem em constantes nomeadas no topo do config e cada bloco espalha as que valem ali.

Estas proibições de **import** são regra de ESLint (`no-restricted-imports`), não convenção:

| Import proibido | Onde | Saída |
| --------------- | ---- | ----- |
| `@mui/*` | fora do design system | importar pelo barrel `@design-system` |
| `@design-system/*` (caminho interno) | em qualquer lugar | importar do barrel |
| `@emotion/*` | fora do design system | `styled`, `css` e `keyframes` vêm do barrel |
| `colorTokens`, `colorVariants`, `darkColorTokens` | fora de `theme/` | ler `theme.palette` |
| `**/theme/helpers/*` | fora de `design-system/theme/` | `theme.space()` e `theme.radius()` |
| `@testing-library/react` | fora dos testes e do test-utils | usar o `render` de `@app/test/testing-library` |
