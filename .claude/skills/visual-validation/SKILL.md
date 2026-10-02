---
name: visual-validation
description: "Valida no app rodando uma mudança visual do front antes de dizer que está pronta. Use depois de mudar layout, estilo, componente, tema ou texto de interface; ao aceitar componente entregue por um agente; ao medir alinhamento, vão, cor, contraste ou largura de texto no navegador; e quando alguém disser que algo não está alinhado, está colado ou está diferente sobre o que você já mediu."
---

# Validação visual

## Paradas

1. ⛔ **Antes de dizer "pronto" sobre mudança visual, renderize a tela e compare o elemento com o vizinho.** ESLint, `tsc`, a suíte e o teste de contraste passam sobre componente que se desenha errado — nenhum deles o renderiza com o CSS do MUI competindo. Sozinho, o elemento novo quase sempre parece bem.
2. ⛔ **Fiação temporária montada para o usuário capturar evidência vive até ele dizer que acabou.** Mesmo com o pedido de commitar ou de abrir o PR: o commit fecha o seu trabalho, o andaime fecha o dele. Desmonte só depois do aviso e confira que ele não entrou em commit. Motivo: desmontar antes tira dele a ferramenta de coletar a evidência.

## Como validar

1. **Ligue o componente numa tela real** — fiação temporária, fora de commit. A fiação vai no cromo de verdade (os `actions` do `Header`), nunca numa barra própria com `zIndex` acima do Modal do MUI (1300): ali o backdrop não intercepta nada e aparecem defeitos que não existem. Baixar para o `zIndex` do `AppBar` (1100) empata e os cliques deixam de chegar.
2. **Olhe primeiro, meça depois.** `getComputedStyle` responde a pergunta que você faz; sem estranhar nada, você não pergunta nada. A comparação lado a lado com o vizinho é o que enxerga (o vão de 4px contra 8px de um rótulo, o link sem nada que o distinga do texto).
3. **Meça em duas larguras, no mínimo** — a base de 375px e o desktop. ⛔ Largura é dimensão de varredura: cada limite declarado e um pixel de cada lado dele, mais a largura em que cada contêiner elástico para de crescer. Elemento que divide a linha com outro não tem a largura da janela: meça a do contêiner junto.
4. **Confira os estados de interação** que a mudança alcança: hover, foco, selecionado, desabilitado, tema claro e escuro.
5. **Desconfie das medições que mentem** antes de relatar um número: leia `references/measurement-pitfalls.md`. Relato de quem olha a tela contra a sua medição quase sempre é o instrumento medindo a caixa em vez do desenho.
6. **Copy nova:** meça a largura do texto no contêiner mais apertado que vai recebê-lo (método na mesma referência) e leve o número às candidatas da skill `ux-writing`.

Com dois servidores de dev no ar, toda medição leva a porta lida da página (skill `parallel-work`).

## Evidência

⛔ **As capturas da validação são a evidência do PR, e a entrega é sua, sem pedido.** Tire em resolução cheia, salve numa pasta da issue com nome numerado na ordem do envio, por tela, largura e tema (`01-perfil-375-claro.png`), e, ao abrir o PR, mande o conjunto inteiro na ordem do PR (`SendUserFile`) e abra a pasta. Commit novo depois de as capturas estarem no PR: na pasta e no envio ficam só as que mudaram, dizendo qual substitui qual.

- A evidência mostra o estado atual do PR: a captura de antes da correção só sai a pedido.
- Estado que o painel não mostra (hover forçado, largura trocada sem recarregar) sai de um Chrome headless pelo protocolo de depuração, com `Page.captureScreenshot` (`references/measurement-pitfalls.md`).

⛔ Validado contra stub, a entrega ao dono é o servidor da porta padrão falando com homologação, sem `VITE_API_URL` na linha de comando e com o stub derrubado: é ali que ele captura as evidências. O stub só volta a pedido.

⛔ Decisão que depende de como a tela fica (fonte, escala, densidade) vai ao dono junto com a porta padrão de pé, já com a mudança: ele decide vendo o app, e a captura ou a tabela de larguras só acompanham.
