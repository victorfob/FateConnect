---
name: spec-issue
description: >-
  Especifica uma issue do GitHub por sabatina — perguntas em blocos até fechar as ambiguidades entre
  o que a issue diz e o que o código mostra, decisões registradas no corpo da issue e divisão em
  sub-issues de um PR cada. Use quando o usuário pedir para especificar, detalhar, refinar, planejar
  ou quebrar uma issue.
---

# Especificar uma issue

A issue diz o que se quer; o código diz o que existe. A especificação fecha a distância entre os dois — e quem fecha é o usuário, respondendo perguntas, não eu escolhendo em silêncio.

⛔ **Não crie issue, branch ou label sem o usuário pedir.** Esta skill só cria sub-issues depois de listar todas e receber o sim.

## 1. Ler antes de perguntar

Pergunta feita sem ler é pergunta que o repositório já respondia. Antes do primeiro bloco:

- A issue e as que ela cita — `gh issue view <n> --json title,body,comments,milestone,assignees`
- O **protótipo anexado**, quando houver: o corpo traz um `<img src="https://github.com/user-attachments/...">` e `curl -sL` baixa. Export de tela inteira vem alto demais para uma leitura só — fatiar com `sips` e ler banda a banda
- A tela ou o módulo mais parecido que já existe — é dele que saem as opções fundamentadas
- Os arquivos que a mudança vai tocar, com `Grep` e `Read`

Separar o que foi **encontrado** do que é **suposição**. A suposição vai para o corpo da issue com esse nome.

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

## 3. Onde a especificação mora

No **corpo da issue**, que passa a ser o guarda-chuva. Nada de documento à parte: o que não está na issue não é lido por quem implementa.

O corpo carrega, nessa ordem: as decisões em tabela, o modelo de dados ou contrato em bloco de código, as suposições com esse nome, e a referência ao protótipo.

⛔ **Escolha que ninguém te deu vai para "suposições", nunca para "decisões".** A tabela de decisões registra o que o usuário decidiu; tudo que você fechou para conseguir seguir escrevendo é suposição, por mais óbvia que pareça.

**O tell é a voz.** Se você escreve uma escolha sua com a mesma frase com que escreve um achado do código — *"duas rotas novas, cada uma renderizando o texto versionado"* —, ela vira decisão aos olhos de quem lê, e ninguém volta a discuti-la. Na #163 duas escolhas de produto entraram assim e as duas foram derrubadas depois, com o trabalho já feito.

Na dúvida entre as duas seções, é suposição: a decisão errada custa uma pergunta, a suposição errada custa a implementação.

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

Os `id` saem de `gh api graphql -f query='{repository(owner:"...",name:"..."){issue(number:N){id}}}'`. O board adota a issue nova sozinho, em `Todo` — conferir com `gh project item-list 1 --owner <owner> --format json`, não supor.

## 6. Varredura de fechamento

Antes de dizer que acabou, cruzar **cada** coisa conversada contra o que entrou. Cada item termina em um de três estados ditos em voz alta: **coberto** (por qual sub-issue), **fora de escopo por decisão** (com o motivo), ou **aberto** (com quem destrava). Item conversado que evapora é o defeito clássico desta skill.

## 7. Fechar o pai é manual, e ninguém avisa

⛔ **Nada fecha sozinho aqui.** Duas mecânicas somadas deixam a árvore aberta com tudo entregue:

- `Closes #N` só dispara quando o PR merge na **branch padrão**, e os nossos miram a `develop` — a skill `pr-creator` já registra isso para a issue do PR;
- o relacionamento de **sub-issue** do GitHub **não propaga** o fechamento: fechar a última filha não toca no pai.

Então, ao fechar a última sub-issue, faça as duas coisas no pai:

```bash
gh issue close <pai> --comment "As sub-issues foram entregues: #a, #b, #c."
gh project item-edit --project-id <projeto> --id <card> --field-id <status> --single-select-option-id <Done>
```

⚠️ **O card do pai é o que mais escapa**, porque ele nunca se moveu: o trabalho acontece nas filhas, então o guarda-chuva fica em `Todo` do nascimento ao fim. A #136 ficou dias fechada de fato e aberta no GitHub, com o card ainda em `Todo`, e só apareceu porque o Victor perguntou.

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
