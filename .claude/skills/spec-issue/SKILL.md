---
name: spec-issue
description: >-
  Escreve ou especifica uma issue do GitHub por sabatina — perguntas em blocos até fechar as
  ambiguidades entre o que se quer e o que o código mostra, decisões registradas no corpo da issue e
  divisão em sub-issues de um PR cada. Use quando o usuário pedir para **criar** ou **abrir** uma
  issue, e também para especificar, detalhar, refinar, planejar ou quebrar uma que já existe.
---

# Especificar uma issue

A issue diz o que se quer; o código diz o que existe. A especificação fecha a distância entre os dois — e quem fecha é o usuário, respondendo perguntas, não eu escolhendo em silêncio.

⛔ **Não crie issue, branch ou label sem o usuário pedir.** Pedida a issue, ela nasce ao fim da sabatina — nunca antes, porque é a sabatina que decide o que vai no corpo. Sub-issue só depois de listar todas e receber o sim.

## 1. Ler antes de perguntar

Pergunta feita sem ler é pergunta que o repositório já respondia. Antes do primeiro bloco:

- A issue e as que ela cita — `gh issue view <n> --json title,body,comments,milestone,assignees`
- **Quando a issue ainda não existe**, não há o que abrir: leia no lugar as issues que ela vai
  encostar — a que ela destrava, a que vai desfazer parte do que ela monta — e confira com
  `gh issue list --state all --search` se alguém já abriu a mesma coisa
- O **protótipo anexado**, quando houver: o corpo traz um `<img src="https://github.com/user-attachments/...">` e `curl -sL` baixa. Export de tela inteira vem alto demais para uma leitura só — fatiar com `sips` e ler banda a banda
- A tela ou o módulo mais parecido que já existe — é dele que saem as opções fundamentadas
- Os arquivos que a mudança vai tocar, com `Grep` e `Read`

Separar o que foi **encontrado** do que é **suposição**. A suposição vai para o corpo da issue com esse nome.

### A premissa do pedido também se mede

⛔ **O pedido carrega afirmações sobre o código, e elas podem estar erradas.** Confira cada uma antes da sabatina: é leitura barata e decide o desenho inteiro da issue.

Aconteceu na #226. O pedido dizia *"o login continua retornando `fullName` mas o front já não usa pra nada"*. Metade certa — o nome do topo vem mesmo do token, mas o aviso de boas-vindas do login ainda lia a resposta. Sem a conferência a issue teria nascido como deleção pura e quebrado o aviso na implementação; com ela, o aviso virou a primeira pergunta, e a resposta — *"esse aviso nem faz sentido"* — mudou o escopo antes de existir código.

**O tell é o verbo no presente sobre o código:** "já não usa", "ninguém chama", "isso é só", "não tem mais". Cada um é um `Grep` que você ainda não fez.

### Issue de "todos os X" começa pelo inventário medido

⛔ **Requisito exaustivo — todo texto, todo endpoint, todo componente — exige um número medido no corpo.** Sem ele ninguém sabe se acabou, e "TODOS" vira opinião.

Na #227 o inventário foi a espinha: **295 strings visíveis em 51 arquivos**. Ele só ficou confiável na terceira tentativa — as duas primeiras varreram com `sed` e `find` e devolveram listas mutiladas sem erro nenhum. O que funcionou foi um script que lista, classifica e conta.

⚠️ **Filtro que devolve pouco é suspeito, não alívio.** Antes de tratar "nenhum achado" como resultado, rode o filtro contra um caso que você sabe que existe.

## 2. A sabatina

Blocos de **no máximo quatro perguntas** via `AskUserQuestion` — quatro é o teto do formulário, não uma preferência. Repetir blocos até fechar.

Cada pergunta tem:

- **Opção A** — a recomendação, ancorada em código que você leu, com `caminho/arquivo.tsx:linha`
- **Opção B** — a alternativa concreta, com o custo dela dito de verdade
- **"Não sei"** — vira suposição registrada, e você segue com a A

Priorize o que trava decisão adiante: contrato e modelo de dados primeiro, depois navegação e estrutura, por último texto e cor.

⛔ **Não pergunte o que o código responde.** "Qual o limite do campo?" é leitura, não sabatina. Pergunte o que só o usuário sabe: produto, prioridade, e o que o protótipo não mostra.

### A primeira pergunta é o artefato, não onde ele mora

⛔ **Antes de perguntar sobre implementação, pergunte o que a pessoa recebe.** O formato da entrega — página, arquivo, PDF, e-mail —, se é definitivo ou provisório, e o que ele precisa conter: isso é produto, e só o usuário decide. Onde a rota mora, como o link abre e qual componente monta a tela vem depois, e boa parte disso o código já responde sozinho.

**O sinal de que a ordem inverteu:** a spec já descreve arquivo, rota e componente, e ninguém disse ainda em que forma a coisa chega a quem usa.

⛔ Aconteceu na #163. A sabatina perguntou onde a rota morava, como os links abriam e se o rodapé linkava — implementação, toda ela — e **fechou calada as duas decisões que eram de produto**: que o texto seria renderizado como página React, e que entraria como rascunho. As duas foram para o corpo da issue escritas como decisão, sem nunca terem sido oferecidas como opção. As duas foram derrubadas durante a implementação, uma em cada mensagem — *"não ter texto na página, a ideia é que os links abram o PDF numa nova guia"* —, e o que já estava construído foi jogado fora. A cobrança foi exatamente esta: *"vc tomou uma decisão de renderizar o texto na página sem nem abordar outras opções e nem me perguntar"*.

### A resposta em texto livre é a que muda o desenho

A opção que o usuário digita vale mais que as que você ofereceu — e costuma contradizer algo já decidido. **Antes do bloco seguinte, reconcilie.**

Na #29 o usuário aceitou "item cancelado não aparece na lista" e, na mesma resposta, definiu que cancelado tem a ação **Reabrir**. O que não aparece não dá para reabrir. Nomear a contradição custou uma pergunta; escolher em silêncio teria custado a tela.

Mesma regra quando a resposta cresce o escopo para fora da issue: **diga em qual issue isso cai** e proponha editá-la. O upload de foto da #29 não cabia na #29 — cabia na #106.

### Reconcilie contra o código, não só contra as respostas anteriores

A decisão nova também colide com o que já está escrito, e essa colisão é invisível na conversa.

Na #227, "o estado passa a se chamar **cancelar**" deixaria o diálogo de confirmação com **dois botões escritos `Cancelar`** — um dispensando, o outro destruindo —, porque o rótulo de dispensar já era essa palavra. Nada na sabatina apontaria isso; só abrir o componente aponta. Fechada uma decisão de glossário, vá ler onde o termo novo já aparece.

## 3. Onde a especificação mora

No **corpo da issue**, que passa a ser o guarda-chuva. Nada de documento à parte: o que não está na issue não é lido por quem implementa.

O corpo carrega, nessa ordem: as decisões em tabela, o modelo de dados ou contrato em bloco de código, as suposições com esse nome, e a referência ao protótipo.

⛔ **Escolha que ninguém te deu vai para "suposições", nunca para "decisões".** A tabela de decisões registra o que o usuário decidiu; tudo que você fechou para conseguir seguir escrevendo é suposição, por mais óbvia que pareça.

**O tell é a voz.** Se você escreve uma escolha sua com a mesma frase com que escreve um achado do código — *"duas rotas novas, cada uma renderizando o texto versionado"* —, ela vira decisão aos olhos de quem lê, e ninguém volta a discuti-la. Na #163 duas escolhas de produto entraram assim e as duas foram derrubadas depois, com o trabalho já feito.

Na dúvida entre as duas seções, é suposição: a decisão errada custa uma pergunta, a suposição errada custa a implementação.

### Antes de registrar a suposição, ofereça a decisão

⛔ **Suposição é para o que não dá para perguntar agora** — usuário ausente, resposta que depende de terceiro, detalhe que só a implementação revela. Com ele presente, parquear uma escolha na tabela de suposições é adiar trabalho que sairia por uma pergunta.

O custo real de uma suposição não é ela estar errada: é **alguém ter que voltar nela**. Cada linha da tabela é uma conversa marcada para depois, e "depois" costuma ser no meio da implementação, com código já escrito em cima.

⛔ Aconteceu na #184. Escrevi três suposições — projeto único no Sonar, análise dentro do job existente, chave do projeto sem nome — e o Victor respondeu *"não quero que fique suposições, vamos transformar elas em decisões"*. As três viraram um bloco de `AskUserQuestion` e foram decididas em uma rodada, com o motivo de cada uma registrado na tabela de decisões. A tabela de suposições sumiu do corpo.

**A regra prática:** montou a lista de suposições, releia procurando as que **cabem numa pergunta com duas opções concretas**. Essas não são suposições — são perguntas que você não fez.

### Antes de criar, releia o corpo caçando as suas próprias escolhas

⛔ **O rascunho pronto é o último ponto em que uma escolha sua ainda custa uma pergunta.** Criada a issue, ela custa uma implementação — e ninguém volta a discuti-la, porque no corpo ela está escrita com a mesma voz das decisões de verdade.

**A varredura:** percorra a tabela de decisões linha a linha e aponte, para cada uma, a mensagem em que o usuário decidiu aquilo. Linha sem mensagem correspondente é sua — vira pergunta, não decisão.

⛔ Aconteceu na #227. O corpo já estava escrito quando o Victor perguntou *"antes de escrever, mais alguma dúvida? Tire todas pra não restar suposições"*. A releitura achou **quatro** escolhas minhas passando por decisão, e ele inverteu **três**: caronas também mudava de verbo, os títulos da landing não eram nome de funcionalidade, e o placeholder ia para a forma que eu tinha descartado.

#### A resposta responde o que foi perguntado, não o vizinho parecido

Das quatro, a pior foi a generalização: perguntei o glossário **de achados e perdidos**, ele respondeu, e eu estendi sozinho para **caronas** — escrevendo "caronas segue com `excluir`" na tabela de decisões, com a voz de quem registra o que foi decidido.

**O tell é a frase que estica o alcance da resposta**: "e portanto", "seguindo o mesmo critério", "por consistência". Área vizinha, objeto parecido e tela irmã são perguntas separadas, e costumam ter respostas separadas — esta teve.

## 4. Dividir em sub-issues

**Uma sub-issue é um PR.** O teste: dá para revisar e reverter sozinha?

- Listar todas antes de criar, com a dependência de cada uma, e pedir confirmação
- **Copiar, não referenciar** — o contrato vai literal no corpo de cada sub-issue; quem implementa não deveria precisar abrir a pai
- Mudança de outra camada (um tom novo no design system, um contrato) pode ser sub-issue própria mesmo sem consumidor ainda; recorte de tela, não
- Sem dependência primeiro; o resto em ordem

Dividir demais é tão errado quanto juntar tudo — mesmo critério da skill `write-commit`.

## 5. Criar

```bash
gh issue create --title "<pt-BR>" --body-file <arquivo> --assignee <login> --label <label> --milestone "<título>"
```

`--milestone` casa pelo **título**, não pelo número. Depois, pendurar cada uma na pai:

```bash
gh api graphql -f query='mutation { addSubIssue(input: {issueId: "<id-pai>", subIssueId: "<id-filha>"}) { subIssue { number } } }'
```

Os `id` saem de `gh api graphql -f query='{repository(owner:"...",name:"..."){issue(number:N){id}}}'`. O board adota a issue nova sozinho, em `Todo` — conferir, não supor:

```bash
gh project item-list 1 --owner <owner> --format json --limit 300
```

⛔ **O `--limit` é obrigatório.** O padrão é **30**, e a resposta truncada não vem com aviso nenhum. Na #226 uma consulta com `--limit 100` num board de 112 itens não achou o card recém-criado; reportei que o board não tinha adotado a issue e o Victor moveu à mão o que já estava lá. Antes de concluir ausência, compare o total que voltou com o tamanho do board.

## 6. Varredura de fechamento

Antes de dizer que acabou, cruzar **cada** coisa conversada contra o que entrou. Cada item termina em um de três estados ditos em voz alta: **coberto** (por qual sub-issue), **fora de escopo por decisão** (com o motivo), ou **aberto** (com quem destrava). Item conversado que evapora é o defeito clássico desta skill.

## 7. Cada merge envelhece as irmãs

⛔ **Ao mergear uma sub-issue, releia as que sobraram.** Uma árvore de sub-issues é escrita de uma vez, com o repositório de um instante — e cada PR que entra invalida um pedaço do que as outras dizem. Nada avisa: o texto continua sintaticamente perfeito.

Quatro vezes na árvore da #207:

| O que ficou falso | Depois de |
| --- | --- |
| a #210 mandava renomear serviços e interfaces | a #209 já os ter renomeado no review |
| a #211 mandava renomear `GerarHashDaSenha`, que deixou de existir | a #209 remover o wrapper |
| a #212 tinha um checkbox aberto para uma decisão já tomada | o #221 unificar os `.editorconfig` |
| a #213 escrevia a rota em minúscula e não citava um JSDoc já falso | o #222 publicar `/Users/signup` |

⚠️ **A terceira foi o Victor quem pegou**, perguntando *"editorconfig já foi arrumado, tá lá ainda?"* — depois de eu ter editado aquela seção **antes** do merge e não ter voltado nela.

**O gatilho é o merge, não o fim da árvore.** Ao fechar uma sub-issue, abra as irmãs abertas e procure: escopo que outro PR já entregou, símbolo que deixou de existir, e decisão que mudou. Item entregue vira `[x]` com a nota de onde saiu; item morto sai.

## 8. Fechar o pai é manual, e ninguém avisa

⛔ **Nada fecha sozinho aqui.** Duas mecânicas somadas deixam a árvore aberta com tudo entregue:

- `Closes #N` só dispara quando o PR merge na **branch padrão**, e os nossos miram a `develop` — a skill `pr-creator` já registra isso para a issue do PR;
- o relacionamento de **sub-issue** do GitHub **não propaga** o fechamento: fechar a última filha não toca no pai.

Então, ao fechar a última sub-issue, feche o pai — e é só isso:

```bash
gh issue close <pai> --comment "As sub-issues foram entregues: #a, #b, #c."
```

**O card vai para `Done` sozinho**, e não há `gh project item-edit` a rodar aqui. Quem move é o `github-project-automation[bot]`, que reage ao fechamento: na #213 e na #207 o `project_v2_item_status_changed` dele saiu **um segundo** depois do `closed`. O mesmo bot adiciona a issue nova ao board e define o status inicial.

⚠️ **Não generalize para as outras colunas:** `In Progress` e `In Review` continuam manuais. O bot só reage a criar e a fechar.

⛔ **O que escapa é fechar o pai, não mover o card.** O trabalho acontece nas filhas, então ninguém volta ao guarda-chuva. A #136 ficou dias entregue de fato e **aberta** no GitHub — e, estando aberta, o card seguia corretamente em `Todo`. Só apareceu porque o Victor perguntou.

⚠️ **Card em `Done` não prova que o bot o moveu.** Quem responde "quem moveu" é a linha do tempo, não a contagem de cards:

```bash
gh api repos/<dono>/<repo>/issues/<n>/timeline --paginate \
  --jq '.[] | select(.event | test("closed|project_v2")) | "\(.event) | \(.actor.login) | \(.created_at)"'
```

**A varredura que acha os esquecidos**, quando a suspeita surgir:

```bash
gh api graphql -f query='{repository(owner:"<dono>",name:"<repo>"){issues(first:100,states:OPEN){nodes{number title subIssues(first:30){nodes{state}}}}}}' \
  --jq '.data.repository.issues.nodes[] | select((.subIssues.nodes|length)>0 and ([.subIssues.nodes[]|select(.state=="OPEN")]|length)==0) | "#\(.number) \(.title)"'
```

⚠️ Issue aberta com PR mergeado **não** é sinal de esquecimento: no nosso caso as três que apareceram eram de backend, citadas por PRs de front que só dependiam delas. Confirme o que a issue pede antes de fechar.

## Armadilhas já pagas

| Sintoma | Causa |
| --- | --- |
| A pergunta parece boa e a resposta é "isso está no código" | A sabatina começou antes da leitura |
| Um bloco contradiz a decisão do bloco anterior | Resposta em texto livre não foi reconciliada |
| A sub-issue não dá para implementar sem abrir a pai | O contrato foi referenciado em vez de copiado |
| A issue pai cresce e nunca fecha | Virou guarda-chuva e continuou recebendo código |
| O escopo que nasceu na conversa some | Caiu em outra issue e ninguém editou aquela issue |
