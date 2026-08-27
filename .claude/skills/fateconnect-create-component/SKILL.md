---
name: fateconnect-create-component
description: >-
  Criar ou evoluir componentes React em FateConnect/Web — onde o componente mora, estrutura de pasta,
  Emotion em styles.ts, tokens do design system, tipagem de props e teste. Use quando o usuário pedir
  componente, tela, seção, UI compartilhada ou scaffold no front.
---

# Criar componente — FateConnect/Web (React)

O front do FateConnect é um só: React + Vite em `FateConnect/Web`.

## 1. Decidir onde o componente mora

A pergunta é uma só: **ele conhece o domínio?**

| Conhece rota, texto de produto, tipo do domínio? | Onde |
| --- | --- |
| Não — é visual puro e reutilizável | `design-system/components/<Nome>/` |
| Sim — e serve mais de uma tela | `src/components/<Nome>/` |
| Sim — e serve só uma tela | `src/pages/<Tela>/components/<Nome>/` |

- Componente do design system é **prop-driven**: recebe conteúdo por propriedade ou slot e **não importa nada de `@app/*`**. Quem compõe fornece rota, texto e domínio.
- A prop do design system fala em termos **visuais**, não de domínio: `tone="success"`, nunca `tipo="filantropica"`.
- Só entra no barrel o que a aplicação pode usar direto. Matéria-prima do tema (paleta, fábrica do tema, largura crua de breakpoint) fica interna.
- **Antes de criar, procure:** `Grep` pelo nome e por um componente parecido na mesma pasta. Copiar o vizinho é mais seguro que inventar estrutura.

## 2. Estrutura de pasta

Na raiz da pasta ficam **só três arquivos**: `index.tsx`, `<Nome>.test.tsx`, `styles.ts`. Todo o resto vai para pasta dedicada:

```
MeuComponente/
  index.tsx
  MeuComponente.test.tsx
  styles.ts
  @types/      constants/     helpers/     hooks/     components/
```

**Um componente por arquivo.** Subcomponente vai numa pasta dentro do pai, com o seu próprio `index` (`ConfirmDialog/DialogMessage/`). Se ele faz sentido para quem consome, exponha por **composição** — `ConfirmDialog.Message` via `Object.assign` — em vez de repassar props do filho pelo pai.

## 3. Imports

- UI vem **só** de `@design-system` (componentes, `styled`, `css`, tokens) e `@design-system/icons` (ícones). Fora de `design-system/`, importar `@mui/*` **reprova no lint**.
- Falta um componente no barrel? **Adicione ao barrel**, não importe por caminho interno.
- Alias em vez de `../../../`: `@design-system`, `@app`.
- Estilos como namespace (`import * as S from './styles'`). Constantes idem (`import * as C from './constants'`) **quando houver três ou mais**; abaixo disso, import nomeado.

## 4. Estilo

- Um `styles.ts` por componente. **Nunca** `sx` inline; **nunca** definir `styled` no arquivo que o usa.
- `styled(Stack)` quando for flex, `styled(Box)` no resto — nunca tag HTML crua. A semântica vem da prop `component`: `<S.CardRoot component="article">`.
- O nome do styled descreve **o que ele renderiza** (`FooterDivider`, `TilesRow`), nunca genérico (`Wrapper2`, `Hero`).
- Espaçamento e raio por `theme.space()` e `theme.radius()`, com o token vindo de `spacingScale`/`radiusScale`; cor por `theme.palette.*`. Os helpers não são exportados pelo barrel — o acesso é sempre pelo tema. **Nunca** hex, `rgb()` ou px solto quando existe token. Falta token? Estenda os tokens.
- Número com significado vira constante nomeada — `@typescript-eslint/no-magic-numbers` é **erro**.
- `Stack` é flex em **coluna** por padrão, diferente de `display: flex` cru. Declare `flexDirection`.

## 5. TypeScript

- Props: `type` (não `interface`) e envelopadas em `Readonly<{ ... }>`.
- Callback sem parâmetro é `VoidFunction`; com parâmetro, assinatura explícita.
- Conjunto finito na **aplicação** é `enum` com sufixo `Enum` (`RideTypeEnum`). No **design system** é união de literais (`tone?: 'neutral' | 'success' | 'warning'`), para o consumidor escrever `tone="success"` sem importar nada.
- Tipos em `@types/` ou `types.ts` — nunca dentro de `constants.ts`, que guarda só valores.
- Sem `as const`, sem cast `as X` no fim de expressão. Em teste, `as unknown as T` é liberado para fixture.
- `?? undefined`, nunca `|| undefined`.

## 6. JSX

- **Sem função de render inline** (`renderHeader()`): extraia um componente dedicado.
- `if` + early return em vez de ternário. A única exceção é expressão inline em JSX (`{cond ? <A /> : <B />}`). Nunca aninhe ternário.
- Valor derivado usa `useMemo` com corpo `if (...) return x; return y;`.
- Handler nomeado (`handleEdit`) com `useCallback`; sem callback anônimo no JSX quando ele fecha sobre argumento.

## 7. Teste

Arquivo `<Nome>.test.tsx` ao lado do `index.tsx`.

- `const DEFAULT_PROPS: ComponentProps<typeof X> = { ... }` e um helper `renderComponent(props = DEFAULT_PROPS)`.
- Sempre `screen.*` — nunca desestruturar o retorno do `render`, nunca `container`.
- Consulta por papel de acessibilidade; descrição em inglês no padrão `should …`.
- `render` vem de `@app/test/testing-library` (já monta tema, cache e notificação) — importar `@testing-library/react` direto reprova no lint.
- Componente que navega: `createMemoryRouter` + `RouterProvider`.
- Agrupe asserts do mesmo comportamento num `it` só.

## 8. Fechar

```bash
cd FateConnect/Web && yarn typecheck && npx eslint <arquivos> && yarn test:ci
```

**Erro** reprova; warning se ignora. Depois de renomear identificador, rode `prettier --write` e re-rode o ESLint — a linha pode ter estourado o `printWidth`.

Cor nova entra com o par correspondente no `contrast.test.ts` (mínimo AA, 4,5:1, nos dois temas) ou a suíte reprova.

## Confirmar API antes de implementar

Dúvida em MUI, Emotion, react-hook-form, zod, TanStack Query, React Router ou `@mui/x-date-pickers`: consultar o **MCP do Context7** (`resolve-library-id` + `query-docs`). Não inventar API nem assumir versão — as instaladas estão em `FateConnect/Web/package.json`.

## Checklist

- [ ] Pasta certa pela regra "conhece o domínio?"
- [ ] Raiz da pasta só com `index`, teste e `styles`
- [ ] Um componente por arquivo; subcomponente em pasta própria
- [ ] Import só de `@design-system` / `@design-system/icons`
- [ ] Sem `sx`, sem cor literal, sem número solto
- [ ] Props `Readonly<...>`; `VoidFunction` onde couber
- [ ] Teste com `screen.*`, papel de acessibilidade e `should …`
- [ ] Typecheck, ESLint e suíte passando
