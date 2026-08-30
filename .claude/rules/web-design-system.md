---
description: Consumo do design system no front React — barrel, styled, tokens e proibições
paths:
  - "FateConnect/Web/**"
---

# Design system — consumo

## Barrel é a única porta

- **Dois barrels públicos:** `@design-system` para componentes, estilo e tokens; `@design-system/icons` só para ícones (`import { AddIcon } from '@design-system/icons'`). Qualquer outro caminho interno do design system é proibido — o lint reprova.
- **No barrel só entra o que a aplicação pode usar direto.** Matéria-prima do tema — paleta de cores, tipografia, fábrica do tema, larguras cruas de breakpoint — fica interna: exportar o que ninguém pode consumir convida ao uso errado.
- A aplicação importa UI **somente** de `@design-system`. **Nenhum arquivo fora de `design-system/` importa de `@mui/material` ou `@mui/icons-material`.** É o que permite envolver, restringir ou substituir um componente sem varrer o app.
- Componente de UI que a aplicação precisa e o barrel ainda não expõe: **adicionar ao barrel**, não importar direto.
- `styled`, `css` e `keyframes` também vêm do barrel — e são os do **Emotion**, não os do MUI. O tipo `Theme` do Emotion está aumentado para o tema da aplicação, então `theme` no callback vem tipado.
- Dentro de `design-system/` o import direto do MUI é o esperado: ali é a fronteira.
- **Tipo público do design system é união de literais, não `enum`.** `tone?: 'neutral' | 'success' | 'warning'` — o consumidor escreve `tone="success"` sem importar nada. A regra do sufixo `Enum` vale para os enums **da aplicação** (`RideTypeEnum`, `RoutePathEnum`); as duas convivem porque valem de lados opostos da fronteira.

## Componentes compartilhados vivem no design system

- Cromo e UI reutilizável — cabeçalho, rodapé, menu lateral, diálogos — ficam em `design-system/components/`.
- **Esconder visualmente sem tirar da acessibilidade é o `HiddenField`.** Serve ao texto que só o leitor de tela ouve e ao campo que só um botão aciona, pela prop `component`. ⛔ Não reescreva o bloco `position: absolute` + `clip` — ele existia duplicado em dois arquivos, byte a byte, até virar componente.
- Esses componentes são **prop-driven**: recebem conteúdo por propriedade ou slot e **não importam nada de `@app/*`**. O domínio (rotas, hooks, textos) é fornecido por quem os compõe.
- Composição de domínio (um botão que conhece uma seção da landing, por exemplo) fica em `src/components/`, não no design system.
- **A prop fala em termos visuais, não em termos do domínio.** A etiqueta de estado recebe `tone="success"`, não `tipo="solidaria"`: quem traduz o domínio para o tom é a tela. Foi o que permitiu o mesmo `StatusTag` servir caronas sem o design system saber o que é uma carona.
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
- **A escala tipográfica é única.** Tela nova reutiliza a variante que a tela parecida já usa; a escala só muda por decisão explícita, nunca para acertar um valor visto fora do código.
- **Nunca `palette.text.*` como cor de fundo**, nem `contrastText` como fundo — são cores de texto.
- Espaçamento e raio sempre por token, via `theme.space()` e `theme.radius()` — chaves **nossas** no tema. ⛔ **Não** via `theme.spacing()`, que é do MUI e não se sobrescreve. Os helpers livres não saem do barrel: a aplicação não consegue importá-los, e o lint barra quem tentar pelo caminho interno. Sem px solto quando existe token — e `0` é o token `none`.
- Falta token para o que você precisa: **estenda os tokens**, alinhado ao que já existe, em vez de contornar com valor literal.

## Estilo

- Um `styles.ts` por componente, ao lado do `index.tsx`. Nunca `sx` inline; nunca definir `styled` no arquivo que o usa.
- Nome do styled descreve o que ele renderiza (`FooterDivider`, `DesktopNav`), nunca genérico.

## Cor: paleta é a fonte única

- `tokens/` guarda os valores brutos e **alimenta a paleta** em `theme/palettes.ts`. Componente lê `theme.palette.*` — nunca o token direto. O lint reprova.
- Dois temas: claro (paridade com o produto) e escuro (sistema de cor do Material Design — superfície `#121212`, marca dessaturada, "on colors" por ênfase).
- ⛔ **Cor que varia entre os temas é chave da paleta, nunca função que ramifica no modo.** Falta slot no MUI para o que você precisa: declare o tipo em `theme/types.ts`, aumente `Palette` e `PaletteOptions` no `declare module` de `createAppTheme.ts`, e dê o valor nas duas paletas. As nove ramificações `if (palette.mode === 'dark')` que existiam nasceram assim — o caso seguinte copiou o anterior.
- **Cor parametrizada por tom ou variante vira grupo indexado**, não valor solto: `theme.palette.statusTag[tone].surface`, `theme.palette.notification[variant].content`.
- Cromo da aplicação (topo, rodapé, menu lateral, botão de voltar) lê `theme.palette.chrome`: cor de marca no claro, superfície elevada no escuro. O divisor e o realce são chaves próprias do cromo — `palette.divider` e `palette.action.hover` são de superfície neutra e somem sobre a cor de marca.
- ⛔ **A cor de ação é `secondary`, e só ela.** Na prop `color` sobram três valores: `inherit`, `primary` e `secondary`. `error`, `success`, `info` e `warning` são **estados**, não ações, e o lint reprova. O `error` fica reservado ao erro de verdade — a validação de campo, que o `Input` liga sozinho, e a mensagem de erro. Sete botões pediam `error` só por ser vermelho, e a aplicação passou a ter dois vermelhos convivendo na mesma tela.
- **Estado colorido não passa pela prop `color`**: etiqueta lê `palette.statusTag[tone]` e aviso lê `palette.notification[variant]`.
- **Par de cor tem o mesmo contrato nos dois temas.** Na etiqueta de estado, `light` é sempre o fundo e `main` sempre o texto; no tema escuro o par inverte de claridade, não de papel. Declarar só `main` deixa o MUI derivar o outro — foi assim que as etiquetas saíram verde-claro sobre verde-claro no escuro.
- **Contraste é verificado por teste** (`contrast.test.ts`), e ele **gera** os pares: cada cor de conteúdo é medida contra **todas** as superfícies, nos dois temas. Cor nova entra na lista `contentColours` — nunca como um par escrito à mão, que é como o buraco nasce.
- ⛔ **Não-texto tem limite próprio: 3:1**, pela WCAG 1.4.11 — borda de campo e fundo de botão entram em `nonTextColours`, não na lista de texto. Medi-los com os 4.5:1 do texto reprova cor que está correta; medi-los com nada deixa passar borda a 1.65:1, que foi o que aconteceu.
- ⛔ **A biblioteca pode pintar uma superfície que a paleta não declarou.** O `Paper` do MUI no tema escuro sobrepõe um véu proporcional à elevação: no diálogo ele clareava `#1E1E1E` até `#434343`, e o teste media um token que a tela não desenhava — texto secundário caía de 6.77:1 para 4.02:1 sem nada acusar. O véu está desligado em `components.ts`; ao adicionar componente de superfície, confira que o que a tela pinta é o que a paleta diz.
- **Cor de conteúdo serve a um papel, não a um componente.** `secondary.main` é fundo de botão e `brandText` é a marca como texto — são dois tons porque as faixas de luminância dos dois papéis não se tocam. Usar o de fundo como texto dá 3.24:1.
