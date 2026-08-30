# Reaproveitar antes de criar

⛔ **Nunca duplicar código.** Antes de escrever componente, hook, util, helper, serviço ou constante, procurar na base o que já faz aquilo. Existindo, reaproveita-se o que existe. Parecido mas não igual, a saída é **propor unificar** — nunca uma segunda cópia.

## Procurar pelo comportamento, não pelo nome

É aqui que a busca falha. O `LostItemOwnerContact` nasceu cópia linha a linha do `RideDriverContact`: nomes diferentes, corpos idênticos, até as strings iguais. Procurar por "ContactButton" não acharia nada — procurar pelo que aquele comportamento **obriga a chamar** (`copyToClipboard`, `whatsappConversationUrl`, `getInitials`) achava o gêmeo no primeiro `Grep`.

Com `Grep` e `Glob`, buscar três coisas antes de criar arquivo:

- os utils e hooks que o código novo vai chamar;
- o componente do design system que ele vai montar (`Dialog`, `ContactDetails`);
- o texto de interface que ele vai exibir — rótulo repetido é duplicação anunciada.

## Antes de deduzir um fato, veja quem já o responde

⛔ **Mecanismo que deduz localmente algo que uma autoridade já sabe é duplicação também** — de conhecimento, não de código. Antes de construir, pergunte: existe alguém que responde isso direto?

⛔ Aconteceu na #231. Para saber se a sessão ainda valia, escrevi a leitura do `exp` do token; para o `exp` não depender do relógio da máquina, uma rota de hora no servidor; para não pedir a hora toda vez, calibração pelo cabeçalho `Date` de cada resposta. Três peças, um decodificador de JWT e a pergunta de em qual relógio confiar.

A API já respondia isso com um `401`.

**O que decidiu foi o custo comparado, não a elegância:** os dois desenhos gastavam **uma** requisição na abertura. Um a gastava perguntando as horas para depois julgar sozinho; o outro, perguntando a quem sabe. Sem vantagem de latência, e com muito menos peça — quem viu foi o Victor, perguntando *"a gente precisa mesmo olhar pro header Date?"*.

**O sinal de risco é a cadeia de suporte:** quando a peça B só existe para a peça A funcionar, e a C só para a B, pare e procure a fonte que dispensa as três. Deduzir também erra sozinho; perguntar, não.

## Antes de substituir o que a biblioteca faz, ponha o caminho barato na mesa

⛔ **Reescrever o comportamento de um componente de terceiro é decisão de quem revisa, não sua** — mesmo quando a reescrita é pequena e você já a mediu. Traga as alternativas com o **custo de cada uma**, e espere.

⛔ Aconteceu na #242. O controle de páginas do MUI quebrava em duas fileiras no celular, e eu passei direto a computar a janela de páginas por conta própria. Funcionou e estava medido — mas o Victor perguntou *"pq a abordagem foi reescrever completamente o componente do MUI?"*, e a pergunta era justa: existia um caminho sem código nenhum, encolher o item, que eu não tinha mencionado.

O que fechou a conversa foi a tabela que eu devia ter apresentado antes:

| Caminho | Custo |
| --- | --- |
| computar a janela | 15 linhas nossas para manter |
| encolher o item de 44px para 38px | zero código, mas alvo de toque abaixo do mínimo de acessibilidade |

**O sinal de risco é você já ter medido que a biblioteca não resolve.** É exatamente aí que a reescrita parece inevitável — e é aí que o caminho barato precisa ser dito em voz alta, com o custo, para o outro lado escolher.

## Encontrou duplicação: propor e perguntar

Vale também para duplicação **fora da tarefa**. Se eu vi, eu proponho na hora, sem esperar ser cobrado — a sugestão é obrigação, não favor. Trazer três coisas: o que está repetido, o que fica no lugar dos dois, e **onde** passa a morar. E **esperar o sim**.

⛔ **O destino nunca se decide sozinho.** As opções deste repo: `design-system/` (dois consumidores ou mais, e nada de `@app`), `src/components/` (compartilhado da aplicação, pode usar `@app`), `src/hooks/`, `src/utils/`, ou a pasta de quem usa quando o consumidor é **um só**. O critério está em `web-design-system.md` e `fateconnect-web-react.md` — e ele se reavalia quando o número de consumidores muda: unificar dois consumidores em um tira o componente do design system.
