# Medições que mentem no navegador

Cada caso: o que o número responde, o que ele parece responder, e o controle.

## Caixa não é desenho

- **Ícone:** `getBoundingClientRect` devolve a caixa, e a arte quase nunca a preenche (14px de arte numa caixa de 24px). Meça o desenho com `path.getBBox()` no `svg`, convertido pela razão entre a largura renderizada e a do `viewBox`.
- **Texto:** a caixa do parágrafo inclui entrelinha; o que se vê é `Range.selectNodeContents` no elemento.
- **Vão até o vizinho:** meça da tinta do rótulo até a **faixa de fundo** do item abaixo, não de caixa a caixa nem de tinta a tinta. O sinal de que o instrumento mede a caixa é o número não se mover depois de uma correção que você sabe que aplicou (`padding` não muda a distância entre caixas).
- `32px` de um lado e `32px` do outro e ainda torto: o instrumento mediu a caixa.

## Cor se julga no contexto

- A sonda clona a **faixa inteira** com os vizinhos (`cloneNode(true)` do pai), não o elemento isolado sobre um retângulo: quem olha compara com o botão ao lado, não com o fundo.
- O contraste medido responde "dá para enxergar"; "combina com o resto da tela" não tem número e é de quem olha.
- Fundo transparente (`rgba(0, 0, 0, 0)`) entra na fórmula de contraste como preto: suba na árvore até o primeiro fundo com alfa diferente de zero.

## O computado congelado ou velho

- Com o painel do navegador oculto a página não compõe quadros e a transição não avança: `getComputedStyle` devolve o estado anterior. Desligue antes de ler: `elemento.style.transition = 'none'`, leia, restaure.
- O sinal é o computado discordar da folha. Liste as regras que de fato casam: percorra `document.styleSheets` testando `elemento.matches(regra.selectorText)`. Regra sua ausente da lista não perdeu a disputa, ela nunca entrou (seletor de componente do Emotion, `styleOverrides` sem slot).
- Depois de editar arquivo servido por HMR, só uma navegação de verdade garante a reavaliação (`location.reload()` não bastou). O valor lido tem de bater com o disco; discordando, a página está velha.

## Escala e painel oculto

- Com largura emulada maior que o painel, a página é reduzida por transformação e `getBoundingClientRect` devolve pixel visual. `offsetWidth`/`offsetHeight` são de layout e não sofrem a transformação; o fator é `el.getBoundingClientRect().width / el.offsetWidth`, medido no **próprio** elemento (o `scale` inicial de um popover em transição dá 0,75 enquanto o `body` dá 1).
- Painel oculto mede `window.innerWidth` 0 e geometria lixo. Emular o viewport com largura e altura explícitas devolve layout real; leia a largura junto de cada medição e devolva o preset `desktop` ao terminar.
- ⛔ **Painel oculto não entrega `ResizeObserver` nem `requestAnimationFrame`** (`document.visibilityState` é `hidden`): o que depende deles parece quebrado, inclusive um observador seu, que não recebe nem a chamada inicial. Meça num Chrome `--headless=new` com `--remote-debugging-port`, pelo `WebSocket` do Node: `Emulation.setDeviceMetricsOverride` troca a largura sem recarregar, e o controle é o mesmo script com o mecanismo tirado do código.
- Mover ou renomear pasta de módulo com o Vite de pé deixa todo servidor que lê a árvore com o grafo velho, inclusive o da porta padrão: a página sai em branco e o log diz `Failed to load url`. Reinicie os servidores depois do `mv`.

## Limite de tela

- Varrer a faixa procurando só elemento saindo da janela mede metade: some sobreposição de vizinhos, link ou botão quebrando linha e texto com uma palavra por linha.
- O limite é o primeiro valor limpo mais a barra de rolagem, varrido de 1 em 1.

## Rótulo cortado

O rótulo encolhido do campo do MUI fica 9px acima da caixa (`translate(14px, -9px)`), e ancestral com `overflow` o corta. No jsdom a geometria é zero e nada aparece; meça o retângulo do rótulo contra o do contêiner que rola. Antes de inventar a correção, meça o vizinho que não sofre do problema.

## Largura de texto

- Largura útil = `getBoundingClientRect` do contêiner menos o `padding` computado. Texto por `measureText` num `canvas` com a fonte real, depois de `document.fonts.ready`.
- Meça no contêiner mais apertado que vai receber o texto, a 375px.
- A largura só decide quando separa as candidatas: se todas cabem ou nenhuma cabe, a escolha volta a ser por precisão.
- Estourar custa diferente por lugar: título e `helperText` quebram linha (barato); o rodapé de diálogo empilha as ações e a fileira de informações do cartão desce um item (caro).
