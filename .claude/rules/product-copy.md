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

## Landing: vender sem hipérbole

A voz acima descreve texto **transacional** — aviso, botão, erro. A landing tem outra função: convencer quem ainda não usa. O registro muda; a exigência de precisão, não.

⛔ **Persuadir é ser específico, não ser entusiasmado.** Linguagem promocional **derruba** a usabilidade: reescrever um mesmo site em estilo objetivo rendeu +27%, e +124% somado a concisão e escaneabilidade. O custo é de credibilidade — quem lê gasta atenção filtrando exagero e passa a duvidar do resto.

| ❌ | ✅ |
| --- | --- |
| Encontre seu objeto de volta de maneira fácil e rápida com a nossa plataforma! | Cadastre o que perdeu e receba o contato de quem achou |
| Economize dinheiro e faça novos amigos no caminho | Divida o trajeto e o custo com quem estuda com você |
| com total praticidade e segurança | (corte, ou diga o que garante a segurança) |

**O teste de cada frase: ela sobrevive à pergunta "como assim?".** `Divida o custo` sobrevive; `total praticidade` não.

- **Benefício, não recurso.** O recurso é o que o produto faz; o benefício é o que muda para quem lê.
- ⛔ **Sem autoelogio** — `nossa plataforma`, `total`, `completo`, `o melhor`.
- ⛔ **Sem "!"**, pela mesma razão do resto do app.
- **Frase curta**, porque a web é varrida e não lida palavra por palavra.
- **Chamada para ação com verbo primeiro** e o ganho junto, nunca `Saiba mais` solto.

### A exceção do escopo planejado

A landing **pode** anunciar funcionalidade que ainda não existe, enquanto ela estiver numa milestone aberta: este é um trabalho acadêmico de escopo público declarado, e a apresentação descreve o produto inteiro.

Hoje vale para o **Portal de denúncias**, na milestone 14/09. Entrando o módulo, esta exceção sai da regra.

⚠️ A exceção é do **que** se anuncia, não de **como**: o texto de uma funcionalidade futura segue a mesma régua acima.

Fundamentando a seção: [Concise, SCANNABLE, and Objective](https://www.nngroup.com/articles/concise-scannable-and-objective-how-to-write-for-the-web/) e [How Users Read on the Web](https://www.nngroup.com/articles/how-users-read-on-the-web/), Nielsen Norman Group.

## Aviso de sucesso nomeia o que aconteceu

⛔ **Sem "com sucesso".** O aviso já **é** a confirmação. Particípio e ponto final:

| ❌ | ✅ |
| --- | --- |
| Item concluído com sucesso. | Item resolvido. |
| Carona ofertada com sucesso. | Carona ofertada. |

Mesma régua para "por favor", "aguarde um momento" e "parabéns".

## Um conceito, uma palavra

O mesmo objeto ou estado se chama igual em **toda** a tela — etiqueta, botão, título de diálogo e aviso. Varra o artefato inteiro antes de fechar, não elemento a elemento.

⛔ Aconteceu em achados e perdidos: etiqueta "Concluído", diálogo "Confirmar Conclusão", botão "Concluir" e aviso "Item resolvido" — dois nomes para um estado. O **estado** ficou `Resolvido` na etiqueta, na opção do filtro, no aviso e no valor que o contrato serializa.

### O estado tem um nome; a ação de chegar nele fala por tipo

⚠️ **A regra acima é do estado, não da ação.** Resolver um item de achados e perdidos significa coisas diferentes conforme quem o cadastrou: quem perdeu e recuperou marca como **encontrado**, quem achou e entregou marca como **devolvido**. O botão do cartão, o título do diálogo e a mensagem falam por tipo; a etiqueta, o filtro e o aviso continuam `Resolvido`.

⛔ **O que fecha essa porta é o filtro, não preferência.** O campo `Situação` do painel não tem item, logo não tem tipo — ali `Resolvido` é a única palavra possível, e levar `Encontrado`/`Devolvido` para o estado deixaria o filtro sem nome para o que o cartão nomeia. O aviso de sucesso cai no mesmo teste por outro motivo: `Item encontrado.` colidiria com o estado vazio da própria tela, que diz `Nenhum item encontrado.`

⚠️ **O tell de que a distinção vazou para o lugar errado** é um rótulo de estado que só se consegue escrever tendo um item na mão.

### O rótulo do campo de busca nomeia tudo o que ele alcança

⛔ **Busca que casa mais de um campo diz isso no rótulo.** O rótulo é o que o leitor de tela anuncia como nome do campo, e placeholder some ao digitar — precisão que mora só no placeholder é precisão que some.

Os dois filtros da aplicação buscam em **dois** campos cada um, e por isso se chamam `Destino ou descrição` em caronas e `Nome ou descrição` em achados e perdidos. Antes diziam `Destino` e `Nome`, e prometiam menos do que a busca entrega. O endereço acompanha o rótulo: `?busca=` nos dois.

⚠️ O `Destino` do formulário de **ofertar** carona não é este campo e não muda — ali é o destino de verdade, digitado por quem oferta. Renomear os dois de uma vez quebra o formulário.

### O valor que o contrato serializa não é o rótulo

⛔ **Antes de escrever um valor de enum em texto que alguém lê — copy, URL, corpo de issue —, confira o mapa de rótulo.** Os dois nem sempre coincidem: `Solidarity` aparece na tela como **Solidária**, e `Egalitarian` como **Igualitária** — o valor é inglês, o rótulo é português com acento. O mapa mora ao lado da tela, em `src/pages/Rides/helpers/rideType.ts`.

Aconteceu ao especificar a paginação: escrevi `?tipo=filantropica` chamando aquilo de "o termo em pt-BR do produto". Não era — era a serialização do backend, e a palavra que a interface usa é outra. Eu tinha lido o `types.ts`; o valor estava certo e o **papel** dele, errado.

Coincidir era o caso feliz, e deixou de existir: achados e perdidos também levou o contrato para inglês, e `src/pages/LostAndFound/helpers/lostItemKind.ts` passou a ter mapa de rótulo como o de caronas — `Found` na tela é **Achado**, `Deleted` é **Excluído**. Não há mais tela em que o valor sirva de rótulo; **procure o mapa sempre**.

⚠️ O tell de que alguém confundiu os dois papéis é um teste que escolhe uma opção pelo valor do enum. Ele passa enquanto os dois coincidem e cai no dia da tradução, apontando para a linha errada — a mensagem diz que não existe opção chamada `Found`, e não que o rótulo mudou de dono.

## Erro: o problema e a saída

Diz o que aconteceu e o que fazer: `Erro ao carregar os itens. Tente novamente.`

- ⛔ Sem código nem jargão de servidor — nada de "Erro 500", "Internal Server Error".
- ⛔ **A falha nunca é de quem lê.** "Dados incompletos. Confira os campos destacados", não "Você preencheu errado".
- ⛔ Sem "!": em aviso de sistema ele soa como pânico.
- Se "Tentar novamente" não resolve, a saída é outra — e o texto diz qual.

## Botão

- Imperativo, **verbo primeiro**, até três palavras: "Marcar como encontrado", "Salvar alterações".
- Sem ponto final, sem emoji, sem caixa alta.
- **Título e botão de um diálogo dividem o nome da ação e a moldura da confirmação**, um em cada slot — ver a seção abaixo. Nunca palavras sem relação entre os dois. Ícone, quando houver, à esquerda.

### O nome da ação aparece uma vez no diálogo, não duas

O par `Cancelar` / botão de confirmar distribui **duas** coisas entre o título e o botão: o nome da ação e a moldura que diz que aquilo é uma confirmação. Cada slot leva uma.

| Título | Botão | Por quê |
| --- | --- | --- |
| `Confirmar exclusão` | `Excluir` | a moldura está no título, então o botão nomeia a ação |
| `Marcar como encontrado` | `Confirmar` | a ação já está no título, em negrito, então o botão fecha o ato |

⛔ **Não ponha a ação nos dois.** `Marcar como encontrado` no título e no botão faz o botão soar como eco do título em vez de resolução — e, medido, um rótulo de três palavras estoura o rodapé.

⚠️ **`Cancelar` / `Confirmar` só vale quando o título diz o que vai acontecer.** Título que apenas emoldura (`Confirmar alteração`) com botão `Confirmar` deixa a pessoa confirmando sem nada nomear a ação: aí o botão volta a levar o verbo.

## Caixa: sentence case

Rótulo de botão, aba, título de diálogo e **cabeçalho de seção** levam maiúscula **só na primeira palavra** — "Cadastrar item", "Confirmar exclusão", "Dados para contato". Nome próprio e sigla mantêm a caixa.

⚠️ **Dívida conhecida:** caronas e cadastro ainda usam Title Case ("Ofertar Carona", "Salvar Alterações"), herdado do protótipo. Achados e perdidos já está em sentence case; a conversão do resto acontece quando alguém tocar em cada tela.

## Cabeçalho de seção nomeia o que está dentro

Frase nominal curta dizendo o conteúdo, como o cadastro já faz: `Endereço` e `Dados para contato`.

⛔ **Não nomeie a seção pela natureza do ajuste.** `Ajustes do sistema` não separa nada para quem lê — a tela inteira é o sistema — e "ajustes" repete o nome da tela que a contém. Em preferências, a seção que reúne tema, e-mails e notificações chama-se `Aparência e notificações`.

⛔ **E o rótulo não repete o nome de um item de dentro.** Seção `Preferências` contendo o item `Preferências` põe a palavra duas vezes em duas linhas seguidas e não organiza nada: no menu lateral a seção saiu, e os itens subiram para a vizinha. O teste é ler os rótulos em voz alta, do cabeçalho para baixo — repetiu, ou o cabeçalho está errado ou ele não devia existir.

⚠️ **Nomeie pelo que a seção vai reunir, não só pelo que já está dentro dela.** Enquanto não houver usuários no sistema, descrever uma linha que ainda vai entrar custa menos que renomear a seção depois — é a mesma tolerância da exceção de escopo planejado acima, aplicada dentro da aplicação.

## Tooltip

Complementa, não repete. A exceção é o **botão só de ícone**: ali o tooltip é o nome do botão e repete o rótulo acessível de propósito — sem ele, o ícone não diz nada. Primeira letra maiúscula, no máximo duas linhas.

## Nota ao lado de etiqueta

Nota ao lado de uma etiqueta diz o que a etiqueta não diz. Repetir a palavra dela gasta a linha e sai duas vezes em leitor de tela — havendo só a repetição a dizer, a nota não existe.

⛔ Aconteceu no cartão de achados e perdidos. A etiqueta dizia `Excluído` e, quando a API não mandava o motivo, a nota logo abaixo dizia `Excluído.` — a mesma palavra, duas vezes, uma delas sem acrescentar nada. Ela saiu: a nota passou a existir **só quando há motivo**, e aí ela conta o que a etiqueta não conta (`Excluído manualmente.`, `Excluído automaticamente por inatividade.`).

⚠️ **Texto de reserva é onde essa repetição nasce**, porque ele é escrito para preencher um espaço e não para dizer algo. Antes de escrever um, pergunte o que ele acrescenta à etiqueta ao lado; não havendo resposta, o espaço fica vazio.

## Estado vazio

Três partes: **status** ("Nenhum item encontrado"), **o que apareceria ali**, e a **saída** — nunca só a frase seca, nunca "Ops" nem "Nada aqui". Não pode parecer erro.

## Verbos e palavras

| ❌ | ✅ | Por quê |
| --- | --- | --- |
| Clique, toque | Acesse, Selecione | Serve mouse, toque e leitor de tela |
| Digite | Insira | Mesma razão |
| Veja, ver | Confira, Consulte | |
| Clique aqui | o verbo do destino | Âncora tem que dizer para onde vai |

## Pontuação: sem travessão

⛔ **Nada de `—` em copy de produto.** Ele pede uma pausa longa que a frase curta não precisa, e quem lê por leitor de tela não o ouve como pausa nenhuma. Onde ele apareceria cabe uma de três saídas: ponto final, dois pontos, ou nenhuma pontuação porque a frase encurtou.

| ❌ | ✅ |
| --- | --- |
| `Cadastre o item — ele aparece na lista` | `Cadastre o item. Ele aparece na lista.` |
| `Nenhum resultado — ajuste os filtros` | `Nenhum resultado. Ajuste os filtros.` |

Decidido em 10/09/2026, ao revisar os documentos legais: eram **15** travessões neles e **2** na copy do produto — o estado vazio de caronas e o conflito de e-mail já cadastrado. A limpeza mede o que existe; sem esta linha, a copy seguinte nasce com um.

⚠️ **O traço que marca ausência de valor não é pontuação, e fica.** `pages/Rides/helpers/rideType.ts` e `pages/LostAndFound/helpers/lostItemStatus.ts` declaram `UNKNOWN_LABEL = '—'` para a célula sem conteúdo. Ali ele é símbolo, e trocá-lo mudaria o que a tela mostra.

⚠️ **A régua é da copy, não dos nossos documentos.** Rule, skill, issue, corpo de PR e comentário seguem usando travessão à vontade — este arquivo tem dezenas. O alvo é o texto que a pessoa lê dentro do produto, mais os dois documentos legais, que são texto de produto por outro nome.

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

## Copy que carrega dado tem largura

⛔ **Rótulo com número, faixa ou unidade ocupa espaço — e o espaço se mede no contêiner real, não no olho.** A régua não é o texto sozinho: é a largura útil de onde ele vai morar, que muda de um lugar para o outro.

Aconteceu em 31/08/2026, ao nomear os turnos do filtro de caronas. Propus `Manhã (04:00 - 11:59)` e a cobrança do Victor foi *"lembrou de validar isso?"*. Eu não tinha.

Medido com a aplicação de pé a 409px:

| | Painel de filtros | Diálogo |
| --- | --- | --- |
| Campo | 313px | 281px |
| Sobra para o texto | **267px** | **235px** |

O candidato mais longo, `Vespertino (12:00 - 17:59)`, ocupa 183,5px em Inter 16px: cabe nos dois. A largura **deixou de decidir** o nome, e a escolha voltou a ser por precisão — que é o critério certo. Sem a medição eu teria descartado ou aceitado um nome pelo motivo errado.

**Como medir:** largura útil pelo `getBoundingClientRect` do campo menos o `padding` computado; largura do texto com `measureText` num `canvas` usando a fonte real, depois de `document.fonts.ready`. Meça no **mais apertado** dos contêineres que vão receber o texto.

### As larguras do diálogo, medidas

O diálogo é o contêiner mais apertado do produto, e cada região dele tem uma sobra diferente. Medido a 409px em 09/09/2026, ao nomear a confirmação de resolver item:

| Região | Largura útil |
| --- | --- |
| Corpo e par de ações do rodapé | **281px** |
| Linha do título | **242px** |

O papel mede 345px — 409 menos os 32px de margem que o MUI aplica de cada lado —, menos 32px de recuo da superfície de cada lado. Na linha do título ainda saem o vão de 12px e o botão de fechar de 40px, que só existe abaixo do breakpoint de mobile, devolvendo os 13px do recuo negativo dele.

⚠️ **Estourar não corta o texto: cresce na vertical, e cada região cresce diferente.** O rodapé tem `flexWrap`, então duas ações que não caibam empilham e ele vai de 36px para **80px** — `Cancelar` mais um rótulo de três palavras já passa disso. O título apenas quebra em duas linhas, que é barato. Foi essa assimetria que decidiu a copy da confirmação de resolver: o título ficou com a frase inteira (`Marcar como encontrado`, 291px, duas linhas) e o botão de confirmar ficou curto (`Confirmar`, 106px, mantendo o par em 214px numa linha).

## Idioma

Copy em **pt-BR**, identificador em inglês: a constante é `resolveSucceeded`, o texto dela é `Item resolvido.` — ver `.claude/rules/fateconnect-locale-code.md`.
