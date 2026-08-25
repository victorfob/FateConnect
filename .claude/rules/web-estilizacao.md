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
import { Box, spacing, spacingScale, styled } from '@design-system';

const { md } = spacingScale;

export const StyledBox = styled(Box)({
  padding: spacing(md),
});
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
import { Box, spacing, spacingScale, styled, useTheme } from '@design-system';

const { md } = spacingScale;

export const Container = styled(Box)(({ theme }) => ({
  padding: spacing(md),
  zIndex: theme.zIndex.drawer,
}));
```

⛔ **`gap`, `padding` e `margin` são sempre `spacing()`.** Não existe px cru nessas três propriedades, nem herdado de código antigo: o painel de filtros carregava um `gap: '3px'` e o cartão de achados e perdidos um `gap: '5vw'`, os dois copiados de caronas na migração. Valor fora da escala vira o token mais próximo. Px literal continua valendo para o que **não é espaçamento** — largura de miniatura, altura de botão, raio.

> ⚠️ **Espaçamento não passa por `theme.spacing()`.** O `theme.spacing` pertence ao MUI e é usado internamente pelos componentes dele; sobrescrevê-lo encolheu as gutters do `Toolbar` de 24px para 3px. Nossos tokens em px passam pelo helper `spacing()` do design system. As demais escalas do tema — `zIndex`, `transitions`, `breakpoints`, `shadows` — **são** consumidas pelo `theme`, porque essas o MUI não distorce.

### 4. CSS puro / classe solta

```tsx
// ❌ Evitar
<div className="container">

// ✅ Recomendado
<S.Container>
```

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

Uso de API marcada como `@deprecated` é **erro** (`@typescript-eslint/no-deprecated`, com informação de tipo via `projectService`). Ao ligar, ela já pegou o `.email()` do zod nos dois schemas — trocado por `.pipe(z.email(...))`, que preserva a ordem "obrigatório antes de inválido".

Número solto é **erro** (`@typescript-eslint/no-magic-numbers`): valor numérico com significado vira constante nomeada. Ficam de fora `0`, `1` e `-1` — que aparecem em comprimento, índice e contador sem esconder intenção —, os testes, e valores dentro de objeto (é o que permite tabelas de token como `spacingScale`).

`console` solto é **erro** (`no-console`) — em qualquer arquivo, inclusive teste. Depuração não vai para produção, e o rastro de erro é responsabilidade de quem trata o erro, não de um `console.error` esquecido no componente. `vi.spyOn(console, 'error')` continua valendo em teste: a regra reprova o acesso a `console.<método>`, não passar `console` como argumento.

Estas quatro proibições são regra de ESLint (`no-restricted-imports`), não convenção:

| Import proibido | Onde | Saída |
| --------------- | ---- | ----- |
| `@mui/*` | fora do design system | importar pelo barrel `@design-system` |
| `@design-system/*` (caminho interno) | em qualquer lugar | importar do barrel |
| `@emotion/*` | fora do design system | `styled`, `css` e `keyframes` vêm do barrel |
| `colorTokens`, `colorVariants`, `darkColorTokens` | fora de `theme/` | ler `theme.palette` |
| `@testing-library/react` | fora dos testes e do test-utils | usar o `render` de `@app/test/testing-library` |
