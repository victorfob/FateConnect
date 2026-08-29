---
description: Copy de interface — voz, aviso de sucesso sem redundância, uma palavra por conceito, padrão de botão, erro, estado vazio, tooltip e formatação de data e número
paths:
  - "FateConnect/Web/**"
---

# Copy de produto

O texto da interface é produto, não decoração. Vale para rótulo, botão, aviso, título de diálogo, estado vazio, placeholder e mensagem de erro.

## A voz

| Atributo | Na prática |
| --- | --- |
| **Direta** | O mais importante primeiro, na menor frase que resolve |
| **Transparente** | Diz o porquê de recusa, limite e bloqueio, em vez de escondê-lo |
| **Prática** | Orienta a saída, não descreve o problema em abstrato |
| **Ponderada** | Trata quem lê como adulto, sobretudo quando algo falha |

## Aviso de sucesso nomeia o que aconteceu

⛔ **Sem "com sucesso".** O aviso já **é** a confirmação. Particípio e ponto final:

| ❌ | ✅ |
| --- | --- |
| Item concluído com sucesso. | Item resolvido. |
| Carona ofertada com sucesso. | Carona ofertada. |

Mesma régua para "por favor", "aguarde um momento" e "parabéns".

## Um conceito, uma palavra

O mesmo objeto ou estado se chama igual em **toda** a tela — etiqueta, botão, título de diálogo e aviso. Varra o artefato inteiro antes de fechar, não elemento a elemento.

⛔ Aconteceu em achados e perdidos: etiqueta "Concluído", diálogo "Confirmar Conclusão", botão "Concluir" e aviso "Item resolvido" — dois nomes para um estado. Ficou **Resolvido** em todos, inclusive no valor que o contrato serializa.

### O valor que o contrato serializa não é o rótulo

⛔ **Antes de escrever um valor de enum em texto que alguém lê — copy, URL, corpo de issue —, confira o mapa de rótulo.** Os dois nem sempre coincidem: `Solidarity` aparece na tela como **Solidária**, e `Egalitarian` como **Igualitária** — o valor é inglês, o rótulo é português com acento. O mapa mora ao lado da tela, em `src/pages/Rides/helpers/rideType.ts`.

Aconteceu ao especificar a paginação: escrevi `?tipo=filantropica` chamando aquilo de "o termo em pt-BR do produto". Não era — era a serialização do backend, e a palavra que a interface usa é outra. Eu tinha lido o `types.ts`; o valor estava certo e o **papel** dele, errado.

Coincidir é o caso feliz, não a regra: em achados e perdidos `lostItemKind.ts` diz que "o valor canônico já é o rótulo", e é por isso que lá não há armadilha.

## Erro: o problema e a saída

Diz o que aconteceu e o que fazer: `Erro ao carregar os itens. Tente novamente.`

- ⛔ Sem código nem jargão de servidor — nada de "Erro 500", "Internal Server Error".
- ⛔ **A falha nunca é de quem lê.** "Dados incompletos. Confira os campos destacados", não "Você preencheu errado".
- ⛔ Sem "!": em aviso de sistema ele soa como pânico.
- Se "Tentar novamente" não resolve, a saída é outra — e o texto diz qual.

## Botão

- Imperativo, **verbo primeiro**, até três palavras: "Marcar como encontrado", "Salvar alterações".
- Sem ponto final, sem emoji, sem caixa alta.
- **O verbo do botão é o verbo do título** do diálogo que ele confirma. Ícone, quando houver, à esquerda.

## Caixa: sentence case

Rótulo de botão, aba e título de diálogo levam maiúscula **só na primeira palavra** — "Cadastrar item", "Confirmar exclusão". Nome próprio e sigla mantêm a caixa.

⚠️ **Dívida conhecida:** caronas e cadastro ainda usam Title Case ("Ofertar Carona", "Salvar Alterações"), herdado do protótipo. Achados e perdidos já está em sentence case; a conversão do resto acontece quando alguém tocar em cada tela.

## Tooltip

Complementa, não repete. A exceção é o **botão só de ícone**: ali o tooltip é o nome do botão e repete o rótulo acessível de propósito — sem ele, o ícone não diz nada. Primeira letra maiúscula, no máximo duas linhas.

## Estado vazio

Três partes: **status** ("Nenhum item encontrado"), **o que apareceria ali**, e a **saída** — nunca só a frase seca, nunca "Ops" nem "Nada aqui". Não pode parecer erro.

## Verbos e palavras

| ❌ | ✅ | Por quê |
| --- | --- | --- |
| Clique, toque | Acesse, Selecione | Serve mouse, toque e leitor de tela |
| Digite | Insira | Mesma razão |
| Veja, ver | Confira, Consulte | |
| Clique aqui | o verbo do destino | Âncora tem que dizer para onde vai |

## Neutro e acessível

- Linguagem neutra de gênero: "a pessoa responsável", não "o responsável". Nunca `x` ou `@`.
- O texto precisa funcionar **só ouvido**: quem usa leitor de tela entende onde está e o que vem a seguir?
- Sem jargão, sem metáfora, sem palavra rebuscada.

## Sem "você" em mensagem transacional

Voltada ao fato: "Item excluído", não "Você excluiu o item". O `você` continua valendo quando a ação é de quem lê — "Tem certeza que deseja excluir…".

## Número, data e hora

- Sempre dígito, nunca por extenso, com zero à esquerda: `05`, não `5`.
- Data em `dd/MM/yyyy`; hora em 24h com dois pontos: `07:30`.
- Intervalo com hífen espaçado: `07:00 - 09:00`.

## Idioma

Copy em **pt-BR**, identificador em inglês: a constante é `resolveSucceeded`, o texto dela é `Item resolvido.` — ver `.claude/rules/fateconnect-locale-code.md`.
