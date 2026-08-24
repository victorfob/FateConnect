---
description: Consumo do design system no front React — barrel, styled, tokens e proibições
paths:
  - "FateConnect/Web/**"
---

# Design system — consumo

## Barrel é a única porta

- **Dois barrels públicos:** `@design-system` para componentes, estilo e tokens; `@design-system/icons` só para ícones (`import { AddIcon } from '@design-system/icons'`). Qualquer outro caminho interno do design system é proibido — o lint reprova.
- **No barrel só entra o que a aplicação pode usar direto.** Matéria-prima do tema — paleta de cores, tipografia, fábrica do tema, larguras cruas de breakpoint — fica interna: exportar o que ninguém pode consumir convida ao uso errado.
- A aplicação importa UI **somente** de `@design-system`. **Nenhum arquivo fora de `src/design-system/` importa de `@mui/material` ou `@mui/icons-material`.** É o que permite envolver, restringir ou substituir um componente sem varrer o app.
- Componente de UI que a aplicação precisa e o barrel ainda não expõe: **adicionar ao barrel**, não importar direto.
- `styled`, `css` e `keyframes` também vêm do barrel — e são os do **Emotion**, não os do MUI. O tipo `Theme` do Emotion está aumentado para o tema da aplicação, então `theme` no callback vem tipado.
- Dentro de `src/design-system/` o import direto do MUI é o esperado: ali é a fronteira.
- **Tipo público do design system é união de literais, não `enum`.** `tone?: 'neutral' | 'success' | 'warning'` — o consumidor escreve `tone="success"` sem importar nada. A regra do sufixo `Enum` vale para os enums **da aplicação** (`RideTypeEnum`, `RoutePathEnum`); as duas convivem porque valem de lados opostos da fronteira.

## Componentes compartilhados vivem no design system

- Cromo e UI reutilizável — cabeçalho, rodapé, menu lateral, diálogos — ficam em `src/design-system/components/`.
- Esses componentes são **prop-driven**: recebem conteúdo por propriedade ou slot e **não importam nada de `@app/*`**. O domínio (rotas, hooks, textos) é fornecido por quem os compõe.
- Composição de domínio (um botão que conhece uma seção da landing, por exemplo) fica em `src/components/`, não no design system.
- **A prop fala em termos visuais, não em termos do domínio.** A etiqueta de estado recebe `tone="success"`, não `tipo="filantropica"`: quem traduz o domínio para o tom é a tela. Foi o que permitiu o mesmo `StatusTag` servir caronas sem o design system saber o que é uma carona.
- **Ação secundária usa `variant="soft"`**, a variante de contorno neutro declarada no tema. ⛔ Não componha uma aparência nova no ponto de uso — `variant="outlined" color="inherit"` apareceu em dois PRs no mesmo dia, escolhido duas vezes sem ninguém combinar. Falta variante para o que você precisa: **declare no tema**, como se faz com token.
- **Subcomponente interno vai numa pasta dentro do pai**, com o seu `index` (`ConfirmDialog/DialogMessage/`). Se ele faz sentido para quem consome, expor por composição — `ConfirmDialog.Message` — em vez de repassar props do filho pelo pai.

## Diálogo: existe **um** esqueleto

- Toda a aplicação usa o `Dialog` do design system, com conteúdo por composição — `Dialog.Body` para o miolo, `Dialog.Footer` para as ações. **Quem precisa de diálogo monta os slots; não escreve outro.** Foi assim que a confirmação de exclusão e o contato da carona passaram a dividir o mesmo cromo.
- O `Dialog`, o `DialogActions` e o `DialogContent` do MUI **não** estão no barrel: o diálogo da aplicação é o nosso, e o da biblioteca fica atrás da fronteira.
- ⛔ **O diálogo não tem botão de fechar, e isso é decisão de produto.** `Esc` e clique fora já dispensam, inclusive em toque. Não adicionar um X achando que é melhoria de acessibilidade.
- ⛔ **Título sempre centralizado**, em qualquer largura.
- **Conteúdo com um consumidor só não é design system.** Antes de criar componente aqui, conte os consumidores: um só ⇒ ele mora na pasta da tela que o usa. Slot ou token sem consumidor real é o mesmo cheiro.

## Tokens — proibições

- **Nunca cor literal** (hex, rgb, rgba, hsl, nome de cor) em componente. Só token de `@design-system`.
- **Nunca estilizar tipografia à mão** — sem `fontSize`, `fontWeight`, `lineHeight` ou `fontFamily` soltos. Use a variante de tipografia do tema.
- **Nunca `palette.text.*` como cor de fundo**, nem `contrastText` como fundo — são cores de texto.
- Espaçamento e raio sempre por token, via os helpers `spacing()` e `radius()` do design system — **não** via `theme.spacing()`, que pertence ao MUI e não deve ser sobrescrito. Sem px solto quando existe token equivalente.
- Falta token para o que você precisa: **estenda os tokens**, alinhado ao que já existe, em vez de contornar com valor literal.

## Estilo

- Um `styles.ts` por componente, ao lado do `index.tsx`. Nunca `sx` inline; nunca definir `styled` no arquivo que o usa.
- Nome do styled descreve o que ele renderiza (`FooterDivider`, `DesktopNav`), nunca genérico.

## Cor: paleta é a fonte única

- `tokens/` guarda os valores brutos e **alimenta a paleta** em `theme/palettes.ts`. Componente lê `theme.palette.*` — nunca o token direto. O lint reprova.
- Dois temas: claro (paridade com o produto) e escuro (sistema de cor do Material Design — superfície `#121212`, marca dessaturada, "on colors" por ênfase).
- Cromo da aplicação (topo, rodapé, menu lateral) usa `chromeSurface(theme)` e `onChromeSurface(theme)`: cor de marca no claro, superfície elevada no escuro.
- **Par de cor tem o mesmo contrato nos dois temas.** Na etiqueta de estado, `light` é sempre o fundo e `main` sempre o texto; no tema escuro o par inverte de claridade, não de papel. Declarar só `main` deixa o MUI derivar o outro — foi assim que as etiquetas saíram verde-claro sobre verde-claro no escuro.
- **Contraste é verificado por teste** (`contrast.test.ts`), com mínimo AA (4.5:1) em todo par de conteúdo e fundo, nos dois temas. Cor nova entra com o par correspondente no teste.
