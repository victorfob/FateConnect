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
- ⛔ **Linha de largura cheia com um controle pequeno na ponta: o alvo é a linha inteira.** O interruptor ou o ícone sozinho é um alvo estreito no meio de uma faixa vazia, e o resto da linha parece clicável sem ser. A saída mantém **um** controle, sem `aria` improvisado: `FormControlLabel` com o rótulo ocupando a sobra e o controle no fim — o clique em qualquer ponto aciona o mesmo elemento, e o leitor de tela continua anunciando um `switch` com o estado. Cobrado em 04/09/2026, na linha de tema que o menu lateral chegou a ter.
- ⛔ **Controle do topo que a gaveta já repete não coexiste com ela.** Abaixo do limite de desktop aparece o botão de menu, e o que o painel dele duplica sai do topo: o gatilho do menu da conta esconde-se na **mesma** consulta em que o botão de menu aparece, porque perfil, preferências e saída já estão dentro da gaveta. Os dois nunca convivem e nunca somem juntos — meça nos dois pixels da fronteira, não só numa largura de celular. ⚠️ Não vale para o que a gaveta **não** repete: a campainha continua visível em qualquer largura, porque o contador dela não tem equivalente na lista.
- **Subcomponente interno vai numa pasta dentro do pai**, com o seu `index` (`ConfirmDialog/DialogMessage/`). Se ele faz sentido para quem consome, expor por composição — `ConfirmDialog.Message` — em vez de repassar props do filho pelo pai.

## Diálogo: existe **um** esqueleto

- Toda a aplicação usa o `Dialog` do design system, com conteúdo por composição — `Dialog.Body` para o miolo, `Dialog.Footer` para as ações. **Quem precisa de diálogo monta os slots; não escreve outro.** Foi assim que a confirmação de exclusão e o contato da carona passaram a dividir o mesmo cromo.
- O `Dialog`, o `DialogActions` e o `DialogContent` do MUI **não** estão no barrel: o diálogo da aplicação é o nosso, e o da biblioteca fica atrás da fronteira.
- ⛔ **No desktop o diálogo não tem botão de fechar, e isso é decisão de produto.** `Esc` e clique fora já dispensam. Não adicionar um X ali achando que é melhoria de acessibilidade.
- ⚠️ **No estreito a decisão foi revista**, em 31/08/2026: a 409px o diálogo ocupa 345px e sobram **32px** de faixa clicável de cada lado, alvo pequeno demais para o toque — e alargar a faixa estreitaria o diálogo. O X entra só abaixo do breakpoint de mobile, **dividindo a linha do título**, e é o **desenho** dele que cai na borda dos campos.
- **Título centralizado no desktop e à esquerda no estreito**, revisado em 01/09/2026. No mobile ele divide a linha com o botão de fechar, e centralizá-lo ali obrigaria a reservar a largura do botão dos **dois** lados só para o texto não sair do centro — recuo que existiria para compensar um botão que está de um lado só.
- **Conteúdo com um consumidor só não é design system.** Antes de criar componente aqui, conte os consumidores: um só ⇒ ele mora na pasta da tela que o usa. Slot ou token sem consumidor real é o mesmo cheiro.
- **E a conta se refaz quando alguém sai.** Componente do barrel que fica com um consumidor único **dentro do próprio design system** desce para dentro dele, em `components/`, e sai do barrel — foi o caso do `ListCardSkeleton` quando o `CardsList` passou a ser o único a usá-lo. Exportar o que só um vizinho consome convida a aplicação a montar à mão o que o vizinho já monta.
- **E o caso simétrico tira o componente daqui.** Consumidor único **na aplicação** ⇒ ele sai do design system e vai para a pasta de quem o usa. O `ThemeToggleButton` ficou com um consumidor quando a preferência de tema passou a morar numa tela própria, e desceu para dentro do `GuestLayout`. ⚠️ Efeito colateral a prever: teste do design system que usava aquele componente como sonda perde o alvo, e daqui não se importa de `@app`. A sonda passa a ser outro componente do próprio design system — e **quando não sobrar nenhum, ela nasce dentro do próprio arquivo de teste**: saindo o botão de tema e o interruptor, ninguém mais lia o modo aqui dentro, e o `ThemeProvider.test.tsx` passou a declarar a sua.

## Tokens — proibições

- **Nunca cor literal** (hex, rgb, rgba, hsl, nome de cor) em componente. Só token de `@design-system`.
- **Nunca estilizar tipografia à mão** — sem `fontSize`, `fontWeight`, `lineHeight` ou `fontFamily` soltos. Use a variante de tipografia do tema.
- ⛔ **Componente do MUI que desenha texto por conta precisa *receber* a variante.** `ListItemText`, `MenuItem`, `Chip` e `Alert` aplicam a escala **deles** quando ninguém diz nada — não estilizar à mão não basta, porque o padrão que entra não é o nosso. No menu da conta o `ListItemText` saiu em `body1` sem ninguém escolher, e o texto ficou no corpo do cromo dentro de um painel de 146px. A variante entra por `slotProps` — `slotProps={{ primary: { variant: 'caption' } }}` —, nunca por `fontSize`.
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
- ⛔ **E pior que o véu é o valor cravado, que não consulta o tema em modo nenhum.** O véu ao menos deriva da paleta e erra visivelmente; um literal na folha da biblioteca é invisível aos dois temas ao mesmo tempo, e só um deles paga a conta. O mostrador do `TimeClock` sai com `rgba(0, 0, 0, .07)` escrito na fonte: sobre o branco é um disco discreto a 1,17:1 do papel, e sobre `#1E1E1E` é **1,02:1** — ali os números flutuam sem disco nenhum. Trazendo componente novo de biblioteca para dentro do produto, leia a folha dele procurando `rgb`, `rgba` e `#`; achando, a saída é a de sempre para cor que varia entre os temas — chave na paleta, valor nas duas, e o componente lendo `theme.palette`.
- ⛔ **`styleOverrides` só alcança o que a biblioteca monta como slot; elemento que ela desenha cru não tem gancho, e a sobrescrita vai para o `styles.ts` de quem consome.** O título do painel de data e hora é um `Typography` escrito à mão dentro do componente: a chave `MuiPickersToolbar.styleOverrides.title` compila, o `tsc` aceita, e **nenhuma regra chega ao elemento**. Escrever de novo com mais especificidade não adianta — não é disputa de cascata, é ausência de ponto de injeção.

  ⚠️ **O tell é o computado ignorar a sobrescrita sem nada reclamar.** Antes de brigar por especificidade, liste as regras que **de fato** casam com o elemento — percorrer `document.styleSheets` testando `elemento.matches(regra.selectorText)`, como a `web-styling.md` já descreve. Nenhuma regra sua na lista quer dizer que o caminho está errado, não que ele é fraco.
- **Cor de conteúdo serve a um papel, não a um componente.** `secondary.main` é fundo de botão e `brandText` é a marca como texto — são dois tons porque as faixas de luminância dos dois papéis não se tocam. Usar o de fundo como texto dá 3.24:1.
