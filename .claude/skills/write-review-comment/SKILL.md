---
name: write-review-comment
description: "Escreve comentário de review em PR deste repositório, ancorado na linha exata — defeito no formato Problema/Solução proposta, e o que não está errado como sugestão. Use quando o usuário pedir para comentar, revisar ou apontar problemas no PR de outra pessoa, ou para levar achados de um code review para o PR. Para responder comentários que outros escreveram, use `resolve-pr-comments`."
---

# Escrever comentário de review

O comentário existe para quem vai corrigir, não para provar que eu li. Duas linhas, ancoradas onde o problema está.

## O formato

```
Problema: o que está errado e o que acontece por causa disso.
Solução proposta: o que fazer.
```

⛔ **O `Problema:` cabe em duas frases.** Não cabendo, o que sobra é contexto do corpo do PR e não do thread — de onde a regra veio, o que eu já tinha pedido antes, o que aconteceria noutro cenário. Cobrado na rodada do PR #186: *"seja mais objetivo na explicação do problema, teve uns que ficaram com 6 linhas"*. Os mesmos sete apontamentos couberam em duas frases cada sem perder nada.

⛔ **Nada de comentário solto.** Todo apontamento vai numa linha específica. Comentário na aba de conversa não aparece ao lado do código, e quem corrige tem que caçar o lugar.

⛔ **Um problema por comentário.** Dois threads sobre linhas vizinhas é ruído; se dois apontamentos têm a **mesma correção**, são um comentário só — foi o caso do `[Range]` duplicado e do `[Required]` inútil, que estavam no mesmo bloco de anotações e terminavam na mesma frase: enxugar o DTO.

### A palavra `Problema` promete gravidade — o que não é defeito usa outro registro

⛔ **Só é `Problema:` o que está errado: defeito, contrato quebrado, código morto, incoerência dentro do PR.** O resto — ganho de desempenho, privacidade por desenho, nome que lê melhor, campo que falta no contrato — abre com `**Sugestão:**` e fecha dizendo que a escolha é de quem escreveu.

⛔ Cobrado em 12/09/2026, na rodada do PR #391. Eu tinha redigido como `Problema:` uma refatoração que trocava garantia do compilador por dois `!` — real, mas sem nada quebrado hoje. A correção do Victor foi *"se esse não é um problema use um template de sugestão, colocar como problema faz parecer q é algo crítico"*.

**O custo de errar o registro não é de estilo.** Quem recebe doze threads abertos por `Problema:` não consegue separar o que derruba a aplicação do que melhora uma linha, e passa a ler todos com o mesmo peso — ou a descontar todos pelo mesmo fator.

**O teste:** alguma coisa está errada **hoje**, com o código como está? Não estando, é sugestão.

## Preview antes de publicar, um de cada vez

⛔ **Nenhum comentário vai para o PR sem o texto ter sido mostrado e confirmado.** Um por vez: preview, confirmação, publicação, próximo — nunca uma leva inteira de uma vez.

Pedido pelo Victor nas duas vezes em que esta skill foi invocada: *"só poste depois que confirmar explicitamente, quero ver o preview antes de confirmar"* e *"me mostrar o preview antes de cada um, quero confirmar um por vez"*. O motivo aparece na prática — comentário publicado é instrução endereçada a quem vai corrigir, e retirar um que já foi lido custa mais que mostrá-lo antes. Na rodada do #322, **dois** dos onze mudaram de conteúdo no preview e um terceiro deixou de existir.

## Onde ancorar

```bash
gh api --method POST repos/<dono>/<repo>/pulls/<n>/comments \
  -f commit_id="$(gh pr view <n> --json headRefOid --jq .headRefOid)" \
  -f path="<caminho>" -F line=<n> -f side="RIGHT" -f body='...'
```

- ⛔ **A linha precisa estar dentro de uma seção do diff**, senão a API responde 422. Confira antes mapeando as seções — o `Program.cs` tinha um vão de duas linhas exatamente onde eu queria comentar.
- **Problema num arquivo apagado: `side: LEFT`, no arquivo antigo.** É a melhor âncora para comportamento removido: o thread nasce em cima do código que some, e não numa linha vizinha parecida. Ancore na **declaração** — a classe, o método —, nunca na chave de fechamento.
- Editar: `PATCH .../pulls/comments/<id>`. Apagar: `DELETE` no mesmo caminho.
- ⛔ **O `POST` falhou com erro de rede? Conte os comentários antes de repetir.** Esta rede derruba escrita no GitHub mantendo a leitura boa, e o `EOF` aparece tanto quando o comentário não entrou quanto quando ele entrou e a resposta se perdeu. Repetir às cegas publica dois threads idênticos no PR de outra pessoa. Aconteceu duas vezes em 12/09/2026: `gh api .../pulls/<n>/comments --jq length` respondeu o número exato de antes, e aí a repetição foi segura.
- ⛔ **O head que você revisou pode não ser o head em que vai publicar.** O autor empurra enquanto você redige, e o `headRefOid` do comando acima pega o novo sem avisar: a linha que você ancora e o código que o comentário descreve podem ter mudado. Antes do primeiro comentário, compare o head atual com o revisado; diferindo, leia o `git diff <revisado> <atual>`, confira cada âncora no arquivo do head novo e reveja os comentários que o diff alcança.

  Aconteceu em 28/09/2026, no #482: revisei `1e21e040`, o autor empurrou dois commits, e publiquei o primeiro comentário em `0aeb8152` sem olhar. A linha ainda era a mesma por sorte, e um dos commits mexia no changelog, que outro comentário planejado citava pela linha.

⛔ **Comentário que leva, ou pode vir a levar, um bloco ` ```suggestion `:** leia `references/suggestion-blocks.md` antes de publicar. A faixa de linhas só se escolhe na criação, e o bloco precisa compilar no head do PR.

⛔ **Quando o problema é ausência, não há âncora.** Arquivo que o PR *não* tocou não está no diff. Aí o apontamento não é comentário: vira issue, ou não é levantado. **Decida com o usuário** — foi assim que o contrato do front virou uma issue em vez de um thread.

## O que a redação precisa carregar

- **A consequência concreta**, não a categoria. "Toda chamada do navegador é recusada e nada aparece no log da API" faz o autor entender em cinco segundos; "problema de configuração de CORS" não.
- **O custo da correção, quando é baixo.** *"Nenhum `using` muda, porque o namespace já é esse"* transforma um pedido que parecia varredura num `git mv`.
- **De onde o defeito veio, quando não é do autor.** O `unaccent` e a ordenação sem desempate vieram do código antigo. Dizer isso evita que o comentário soe como cobrança — e mantém o pedido, porque a oportunidade de corrigir é agora.
- **Uma solução**, quando o código responde qual é a certa. **Duas**, apenas quando a escolha é do autor — e aí ordenadas, com a recomendada primeiro.

⛔ **Nunca marque thread como resolvida.** Resolver é de quem comentou ou de quem revisa, não de quem apontou.

## Convenção nossa não se cobra no PR dos outros

⛔ **O que vale entre mim e o Victor não vira exigência para quem só contribui.** Densidade de comentário, forma do JSDoc, ordem de import, nome de arquivo: são acordos da nossa dupla, escritos nas rules deste repo porque nos servem — não porque quem abre um PR aqui os assinou.

Cobrado no review do PR #186. Eu tinha redigido um apontamento pedindo a restauração de três comentários apagados, citando a `comments.md`; a resposta foi *"ele não gosta de comentários, não precisamos forçar ele a seguir um padrão nosso"*.

**O corte é o efeito, não a convenção.** Defeito, contrato quebrado, código morto e incoerência **dentro do próprio PR** valem sempre, porque nenhum deles depende de acordo prévio. Preferência de estilo só entra quando o autor já a segue — aí é incoerência dele com ele mesmo, e o comentário mostra isso em vez de citar a nossa regra.

## Pedir mudança em código executável

⛔ **Todo pedido que altera código que roda precisa dizer o que a linha faz hoje e o que tem de continuar valendo depois.** "Enxugue isto" é um pedido sem contorno: quem atende decide sozinho onde termina o corte, e o que cai junto some sem ninguém decidir.

Aconteceu **três vezes no mesmo PR**, o #186, sempre pelo mesmo gesto meu:

| O que eu pedi | O que caiu junto |
| --- | --- |
| enxugar o `UpdateRideDto` | `[EnumDataType]` — o `PUT` passou a aceitar `"rideType": 99` |
| tirar o `Deconstruct` do `FilterRideDto` | `[StringLength(100)]` do filtro |
| — (o DTO de criação, na mesma leva) | `MinimumLength = 3` do destino |

**A forma:** nomeie a regra que a linha carrega e para onde ela vai. *"Tirar o `[Range]`, que a entidade já valida; o `[EnumDataType]` precisa ficar ou migrar para a entidade, porque nada mais checa o enum"* custa uma frase e não deixa buraco.

⛔ **Sugestão de forma para código de consulta se mede antes de sair, não depois.** Na mesma rodada eu pedi escape de `%` e `_` no filtro por destino; o escape saiu correto, mas a edição trocou concatenação por interpolação — e dentro de uma árvore de expressão `$"%{x}%"` compila para `string.Format`, que o EF Core **não traduz**. Toda busca por destino passou a responder 500, pior que o defeito que eu tinha apontado.

**O que a medição precisa ser:** chamar o método real do commit, não reconstruir a consulta numa sonda. O controle que provou foi chamar `GetAllAsync` duas vezes — sem `Destination` a query chega a abrir conexão, com `Destination` estoura na tradução. Reconstruir teria medido o meu código, não o dele.

## Meça antes de afirmar

⛔ **Afirmação sobre dado, contagem, extensão ou configuração de ambiente exige medição.** Escrevi que uma migração deixaria as caronas órfãs e que a tela ficaria vazia em produção — os bancos não tinham uma linha. No mesmo review, medir transformou um achado hipotético sobre `unaccent` no defeito mais grave da rodada: o filtro por destino já respondia 500 em produção.

⛔ **Meça no ambiente que o projeto usa, não no seu.** No PR #186 publiquei que a API não compilava, com a saída do `dotnet build` na mão; ela compilava, e quem reprovava era um analisador do meu SDK, de outro major — o `AnalysisLevel=latest-recommended` liga os analisadores do **SDK instalado**. O autor corrigiu um defeito que não existia para ele.

O `global.json` fecha essa porta: ele fixa a banda `8.0.x`, e numa máquina com o SDK 10 instalado o `dotnet --version` responde `8.0.424`. Segue derivando o que ele não fixa — ferramenta global, banco, variável de ambiente, versão do Node —, então diga em que ambiente mediu.

**A pergunta antes de publicar:** esta saída viria igual na máquina de quem vai corrigir e no servidor que constrói? Toolchain, versão de runtime e variável de ambiente mudam o veredito, e a saída não avisa qual delas usou.

O tempo verbal denuncia: *"vai ficar"*, *"responderia"*, *"em banco novo"*. Troque por passado medido.

**Errou depois de publicar?** Edite o comentário para o texto correto e sem meta-narrativa — o histórico de edição do GitHub já registra. A explicação do erro vai para o usuário, não para o thread do autor.

### A issue se cita pelo que ela escreve, não pelo que você deduziu

⛔ **Atribuir à issue uma exigência que ela não escreve é afirmar sem medir, com um agravante: a issue é a autoridade que o autor não discute.** Antes de escrever "a #N pede", abra o corpo e ache a frase. Sem a frase, a exigência é sua, e se diz como sua.

⛔ Aconteceu em 28/09/2026, no #482. A #108 pede que banir e rebaixar incrementem o `TokenVersion`, e que a promoção valha "no token emitido no login seguinte". Eu escrevi que ela pedia a promoção "sem derrubar a sessão", uma dedução minha publicada com a voz da issue. O autor perguntou se derrubar não fazia mais sentido, e fazia: o token antigo carrega `Operator`, que é menos poder do que o banco já dá, e os dois desenhos cumprem a frase da issue. O comentário foi apagado e refeito sobre o defeito real, que estava no fixture.

**O tell é o verbo de exigência com a issue como sujeito:** "a #N pede", "a #N proíbe", "como a #N quer". Cada um é uma busca que você ainda não rodou:

```bash
gh issue view <n> --json body -q .body | grep -n -i "<o termo>"
```

⚠️ **E o que a issue não diz não é proibição.** Fica em aberto, e a escolha é de quem escreve ou de quem revisa, não um defeito do PR.

## O certo mora no consumidor e no módulo irmão

⛔ **Todo apontamento que diz "o certo seria X" pede dois arquivos abertos antes do texto: o consumidor e o módulo irmão.** A definição do comportamento correto quase nunca está no arquivo revisado.

- **O consumidor** — o serviço, o codec, o schema e o **teste** do outro lado que exercitam aquele campo.
- **O módulo irmão** — o mesmo campo no módulo que já existe, que quase sempre já decidiu.

⛔ Aconteceu duas vezes no #322, com dois comentários já redigidos:

| O que eu ia publicar | O que a leitura mostrou |
| --- | --- |
| "a listagem sem `status` traz os excluídos — deveria excluí-los" | o filtro do front tem uma opção "Todas" que omite o parâmetro de propósito: omitir **significa** todas as situações. Eu ia pedir para quebrar código que funciona |
| "descrição obrigatória diverge do front; é decisão de produto" | em caronas o mesmo campo é `string?` sem validação na entidade — não havia decisão a tomar |

⚠️ **Ler os dois não decide quem cede, e consumidor mergeado não é fonte de verdade.** A leitura estabelece **que** a divergência existe e o que cada lado faz hoje; qual lado se move é a pergunta seguinte, e o apontamento legítimo às vezes é *"o front vai ter que mudar"*. Divergência de contrato, quem se adequa é o consumidor; rigidez desnecessária de quem serve, corrige-se na origem — senão todo cliente futuro paga o mesmo imposto. O comentário diz qual dos dois e por quê.

⚠️ **O tell é a frase de escape:** *"alinhar com o front"*, *"é decisão de produto"*, *"depende do contrato"*. Sem arquivo e linha ao lado, cada uma significa que você ainda não leu onde o certo está escrito.

**E a leitura rende achado que você não tinha:** a mesma passada pelo front encontrou um campo que o cartão renderiza e a API não devolve.

## Fechamento da rodada

⛔ **Cruze a lista de achados contra os comentários publicados — não conte de cabeça.**

```bash
gh api repos/<dono>/<repo>/pulls/<n>/comments --jq '.[] | "\(.path):\(.line)"'
```

Cada achado termina num estado dito em voz alta: **comentado**, **virou issue**, **descartado porque eu estava errado**, ou **dispensado por decisão do usuário**. "Não mencionei mais" não é estado — foi assim que um achado evaporou entre dois turnos, e quem percebeu foi o usuário.

⛔ **Rodada de correção é diff novo, e pede review novo.** Conferir que cada correção faz o que diz **não é** revisar — os commits de correção são código que ninguém leu ainda.

Cobrado duas vezes no PR #186, com a mesma pergunta: *"nenhum achado novo nas novas alterações?"*. Da primeira vez o passe encontrou uma validação de enum que sumira junto com o que eu pedi para remover. Da segunda, um defeito pior que o original: a correção do escape trocou concatenação por interpolação, e a busca por destino passou a responder 500.

⛔ **O resumo abre com o número de achados, e cada um aparece nomeado.** Destacar os mais graves é certo; comprimir a cauda num parágrafo corrido não é — quem lê conta o que consegue ver. Na rodada do PR #186 eu apresentei 3 em destaque e os outros 12 numa frase só, e a pergunta que veio foi *"só foram 3 mesmo?"*. Uma tabela de três colunas — estado, quantos, quais — resolve, e é a mesma contagem que o `gh api` acima confere.

⛔ **O número só vale depois de o diff inteiro ter sido lido.** Ferramenta de revisão tem teto de achados por rodada, e o teto se lê como total: a lista cheia parece completa. Antes de dizer quantos são, confira que cada arquivo do diff foi aberto, inclusive o que parece gerado ou acessório — o `.Designer.cs`, o snapshot, o fixture —, e cruze o PR contra as issues que ele fecha.

Aconteceu em 28/09/2026, no #482, duas vezes seguidas. A primeira rodada entregou 10 achados porque 10 era o teto; a pergunta foi *"só tem 10 achados?"*. A segunda entregou 18 depois de cruzar com as issues, e a pergunta voltou: *"só 18? ou tem mais?"*. Só a terceira abriu o `.Designer.cs`, as claims do token e os helpers vizinhos, e fechou em 27.

## Quem corrige depois de você também passa por skill

⛔ **Publicados os comentários, a correção vai pela `resolve-pr-comments` — inclusive quando quem corrige somos nós.** Esta skill termina no comentário publicado; ela não cobre triagem com veredicto, resposta na thread nem o gate. Partir direto para o código pula os três.

⛔ Cobrado em 14/09/2026, no #391: eu tinha postado sete comentários e comecei a corrigir, e a instrução veio como *"na hora de corrigir use essa skill"*.

⚠️ **O caso que engana é revisar e corrigir o mesmo PR.** A `resolve-pr-comments` foi escrita para o feedback de outra pessoa — *"quem revisa costuma estar certo, às vezes está errado"* —, então, sendo nossos os comentários, ela parece não se aplicar. Aplica-se igual, e o passo que mais se perde é o de **responder cada thread dizendo o que foi feito**: sem ele o PR fica com N apontamentos abertos sobre código que já mudou, e quem for aprovar não sabe quais ainda valem.

**O tell é a frase "agora é só corrigir".** Ela marca exatamente a fronteira entre as duas skills.

## Idioma

Comentário em **pt-BR**, como issue e descrição de PR. Nome de símbolo, arquivo e comando ficam como estão no código.
