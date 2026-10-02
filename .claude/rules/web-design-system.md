---
description: Edição do design system local — o que entra no barrel, componente prop-driven, quando um componente entra ou sai do DS, tema, paleta e contraste
paths:
  - "FateConnect/Web/design-system/**"
---

# Design system — edição

O consumo pela aplicação está em `fateconnect-web-react.md`; o lint guarda as fronteiras de import (barrel na aplicação, sem `@app/*` no DS).

## Barrel e API pública

- No barrel só entra o que a aplicação pode usar direto. Matéria-prima do tema (paleta, tipografia, fábrica do tema, largura crua de breakpoint) fica interna.
- Tipo público do DS é união de literais, não `enum`: o consumidor escreve `tone="success"` sem importar nada.
- A prop fala em termos visuais (`tone="success"`), não do domínio: quem traduz o domínio é a tela.

## Quem mora aqui

- Conte os consumidores nos dois sentidos antes de criar ou mover. Consumidor só na aplicação ⇒ o componente mora nela, na pasta do consumidor ou em `src/components` se forem vários (o menu de tema, `ThemeMenu`, das Preferências e da landing). Um consumidor dentro do DS ⇒ desce para o `components/` dele e sai do barrel (`ListCardSkeleton` dentro do `CardsList`).
- Teste do DS que usava como sonda o componente que saiu não pode importar de `@app`: a sonda vira outro componente do DS, ou nasce dentro do próprio teste.
- ⛔ Estilo que sobe de uma tela para o tema: liste o que aquela tela dava por slot, ícone ou filho — isso não sobe junto, e o segundo consumidor nasce sem (o polegar do `MuiSwitch` saiu cinza porque o branco vinha da prop de ícone). O par de cor que nasce disso entra no teste de contraste.
- Controle do topo que a gaveta repete some na mesma consulta em que o botão de menu aparece (o menu da conta); o que ela não repete (a campainha) fica em qualquer largura.
- ⛔ Mudança que vale para toda uma família (todo botão, todo campo) começa pelo inventário do app rodando: `button`, `a[href]` e `[role]` em todas as telas, estados e menus, agrupados pelo papel. Pela classe (`.MuiButton-root`) escapam o link desenhado como botão e o botão de ícone.

## Tipografia

- A fonte vai junto com o app (`design-system/fonts/`, *FateConnect Heros*, 400 e 700): a instalada muda de aparelho para aparelho. Fonte nova só de licença livre; comercial (a Helvetica Neue) não entra num repositório público, e a obra derivada vai renomeada, com a licença ao lado.
- Trocar fonte ou peso muda largura: meça a 375px as larguras decididas por tamanho (e-mail e telefone lado a lado no rodapé), com `document.fonts` mostrando a fonte carregada.
- ⛔ Mudar o valor de um token pode deixá-lo igual a outro (o `subtitle` virou o `body` quando o 500 foi a 400): compare a família inteira depois da troca e dobre o par num nome só, com os consumidores.

## Cor

- ⛔ Cor que varia entre os temas é chave da paleta, nunca `if (palette.mode === 'dark')`: tipo em `theme/types.ts`, augmentation de `Palette`/`PaletteOptions` em `createAppTheme.ts`, valor nas duas paletas de `theme/palettes.ts`.
- Cor por tom ou variante é grupo indexado (`palette.statusTag[tone].surface`, `palette.notification[variant].content`). O cromo (topo, rodapé, gaveta, voltar) lê `palette.chrome`, com divisor e realce próprios.
- Par de cor tem o mesmo contrato nos dois temas: na etiqueta, `light` é fundo e `main` é texto. Declarar só `main` deixa o MUI derivar o outro.
- Cor serve a um papel: `secondary.main` é fundo de botão, `brandText` é a marca como texto.
- ⛔ Contraste é o `theme/contrast.test.ts`. Cor de conteúdo nova entra em `contentColours` (medida contra todas as superfícies, nos dois temas); não-texto (borda de campo, fundo de botão) em `nonTextColours`, a 3:1; `contrastText` novo exige o par à mão em `boundPairs`. Logotipo é isento e fica fora.
- ⛔ Há par que a paleta não declara e o teste não alcança: sobrescrita de CSS que pinta `color` sobre filhos amplos (`& .MuiButton-root`) e casa o que traz o próprio fundo; e véu ou literal da biblioteca (`Paper` com elevação, desligado em `theme/components.ts`; o `rgba` cravado do `TimeClock`). Ao trazer componente de biblioteca, leia a folha dele procurando `rgb`, `rgba` e `#`; achando, vira chave na paleta.
- Contraste é luminância: antes de aceitar uma cor lavada, varra a matiz mantendo a luminância.
- `styleOverrides` só alcança o que a biblioteca monta como slot. Elemento que ela desenha cru (o título do `MuiPickersToolbar`) se sobrescreve no `styles.ts` do consumidor.
