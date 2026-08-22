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

### A resposta em texto livre é a que muda o desenho

A opção que o usuário digita vale mais que as que você ofereceu — e costuma contradizer algo já decidido. **Antes do bloco seguinte, reconcilie.**

Na #29 o usuário aceitou "item cancelado não aparece na lista" e, na mesma resposta, definiu que cancelado tem a ação **Reabrir**. O que não aparece não dá para reabrir. Nomear a contradição custou uma pergunta; escolher em silêncio teria custado a tela.

Mesma regra quando a resposta cresce o escopo para fora da issue: **diga em qual issue isso cai** e proponha editá-la. O upload de foto da #29 não cabia na #29 — cabia na #106.

## 3. Onde a especificação mora

No **corpo da issue**, que passa a ser o guarda-chuva. Nada de documento à parte: o que não está na issue não é lido por quem implementa.

O corpo carrega, nessa ordem: as decisões em tabela, o modelo de dados ou contrato em bloco de código, as suposições com esse nome, e a referência ao protótipo.

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

## Armadilhas já pagas

| Sintoma | Causa |
| --- | --- |
| A pergunta parece boa e a resposta é "isso está no código" | A sabatina começou antes da leitura |
| Um bloco contradiz a decisão do bloco anterior | Resposta em texto livre não foi reconciliada |
| A sub-issue não dá para implementar sem abrir a pai | O contrato foi referenciado em vez de copiado |
| A issue pai cresce e nunca fecha | Virou guarda-chuva e continuou recebendo código |
| O escopo que nasceu na conversa some | Caiu em outra issue e ninguém editou aquela issue |
