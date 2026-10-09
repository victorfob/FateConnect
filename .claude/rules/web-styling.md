---
description: Estilo no front — Stack e Box polimórficos, espaço e limites de tela, e as armadilhas do MUI e do Emotion que nenhum gate pega
paths:
  - "FateConnect/Web/**/styles.ts"
  - "FateConnect/Web/**/*.styles.ts"
  - "FateConnect/Web/design-system/theme/**"
  - "FateConnect/Web/design-system/tokens/**"
  - "FateConnect/Web/design-system/**/GlobalStyles.tsx"
---

# Estilo

O `yarn lint` reprova `sx`, tag HTML crua, cor literal, `theme.spacing`, número ou medida crua em `gap`/`padding`/`margin`, breakpoint que não seja `md`/`header`, `@media` à mão, `vw`/`vh` e os imports fora do barrel. O que segue é o que ele não vê. Depois de mudar algo visual: skill `visual-validation`.

## Componentes de layout

- `styled` nunca no arquivo que o usa: mora no `styles.ts` da pasta.
- ⛔ `Stack` é flex em **coluna** por padrão: ao converter `display: flex`, declare `flexDirection`.
- Semântica pela prop `component` no uso (`<S.Container component="footer">`), com o alvo `PolymorphicStack`/`PolymorphicBox`. Alvo que não recebe `component` fica no cru.
- ⛔ Não estenda os alvos pré-tipados a componente que não aceita `component` (`AccordionDetails`): compila, e a prop chega ao DOM como atributo cru. Outro componente do MUI que aceita declara no genérico: `styled(Divider)<{ component?: 'li' }>`. Props próprias do alvo também vão no genérico (`<Pick<NavLinkProps, 'to' | 'end'>>`), não em cast.
- `huge` e `giant` da `spacingScale` são de página (goteira, respiro de seção); componente não chega neles.

## Espaço e limites de tela

- ⛔ Antes de acrescentar margem "para respirar", leia o pai: `Stack` com `gap`, `Dialog.Body`, `PageShell` e `CardsList` já espaçam. A palavra "respiro" no seu raciocínio é o sinal.
- Campo na primeira linha de contêiner com `overflow` precisa de `padding-top` `sm`: o rótulo encolhido do MUI sobe 9px acima da caixa e o contêiner o corta.
- Critério de aceite com largura escreve 375px, a base do produto; abaixo é limite conhecido.
- Duas visões: `md` para tela, cartão, diálogo e rodapé; `header` só para quem troca junto com a nav do topo. Em JS, `useMediaQuery(theme.breakpoints.up('md'))`, nunca `window.innerWidth`. Os valores e a derivação moram em `design-system/tokens/breakpoints.ts`.
- ⛔ Texto que a pessoa digita (título, descrição, e-mail) quebra em qualquer ponto: uma palavra sem espaço passa da borda e alarga a página no celular. O `ListCard` herda `overflow-wrap: anywhere` do corpo; contêiner novo com texto da pessoa declara o seu.
- ⛔ Botão que divide a linha com texto que quebra leva `flexShrink: 0`: o flex o espreme abaixo do conteúdo e corta ícone e seta nas bordas (o seletor de tema das Preferências a 375px).
- ⛔ Antes de mover um limite, encolha o conteúdo, remeça e só então mova para o que sobrou: ele desloca a fronteira de toda tela. O limite é o primeiro valor limpo mais a barra de rolagem, medido de 1 em 1, não o último com defeito.

## O que compila e não pinta

- ⛔ Seletor de componente do Emotion (`` `${OutroStyled}:hover &` ``) compila e não casa nada: o `@emotion/babel-plugin` não está ligado. O seletor casa no próprio elemento (`'&:hover, &:focus-within'`) ou numa classe ou atributo de dado.
- ⛔ `:has()` que depende do pai, escrito no estilo do filho, prende o `&` ao próprio filho e não casa. A regra mora no estilo do pai, alcançando o filho por atributo de dado (`'&:has(form) [data-close-footer]'` na `DialogSurface`).
- ⛔ Sobrescrita de `:hover` exclui o desabilitado (`&:hover:not(.Mui-disabled)`): no toque o hover fica preso ao botão depois do clique, e com a mesma especificidade a regra vence a do MUI e pinta o desabilitado.
- ⛔ O Emotion recusa `:first-child` (aviso no console, que reprova o teste), e `:first-of-type` casa por tag, pegando o vizinho de outra função. Para achar uma parte de slot, marque-a com atributo de dado e use `:not([atributo])`.
- ⛔ Estado do MUI se sobrescreve repetindo a classe do componente: `& .MuiPaginationItem-root.Mui-selected`, não `& .Mui-selected`. O sintoma é parcial — só as propriedades que o MUI também declara voltam ao valor dele.
- ⛔ Animação ou transição que nós declaramos leva `@media (prefers-reduced-motion: reduce)` ao lado, zerando o movimento. Não vale para a transição de dentro de um componente da biblioteca.
- ⛔ Ícone ou texto sobre foto do usuário carrega o próprio fundo (disco sólido com um par da paleta já coberto pelo teste de contraste), em vez de véu sobre a imagem.
