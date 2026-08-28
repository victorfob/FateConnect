---
name: write-review-comment
description: >-
  Escreve comentário de review em PR deste repositório — formato Problema/Solução proposta, ancorado
  na linha exata. Use quando o usuário pedir para comentar, revisar ou apontar problemas no PR de
  outra pessoa, ou para levar achados de um code review para o PR. Para responder comentários que
  outros escreveram, use `resolve-pr-comments`.
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

## Onde ancorar

```bash
gh api --method POST repos/<dono>/<repo>/pulls/<n>/comments \
  -f commit_id="$(gh pr view <n> --json headRefOid --jq .headRefOid)" \
  -f path="<caminho>" -F line=<n> -f side="RIGHT" -f body='...'
```

- ⛔ **A linha precisa estar dentro de uma seção do diff**, senão a API responde 422. Confira antes mapeando as seções — o `Program.cs` tinha um vão de duas linhas exatamente onde eu queria comentar.
- **Problema num arquivo apagado: `side: LEFT`, no arquivo antigo.** É a melhor âncora para comportamento removido: o thread nasce em cima do código que some, e não numa linha vizinha parecida. Ancore na **declaração** — a classe, o método —, nunca na chave de fechamento.
- Editar: `PATCH .../pulls/comments/<id>`. Apagar: `DELETE` no mesmo caminho.

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

⛔ **Meça no ambiente que o projeto usa, não no seu.** No PR #186 eu publiquei que a API não compilava, com a saída do `dotnet build` na mão. Ela compilava: o meu SDK era o 10 e o projeto tem como alvo o `net8.0`, cujo `sdk:8.0` é o que o Dockerfile e a esteira usam. A regra que reprovou nasceu no .NET 9, e o `AnalysisLevel=latest-recommended` liga os analisadores do **SDK instalado**. O autor corrigiu um defeito que não existia para ele.

**A pergunta antes de publicar:** esta saída viria igual na máquina de quem vai corrigir e no servidor que constrói? Toolchain, versão de runtime e variável de ambiente mudam o veredito, e a saída não avisa qual delas usou.

O tempo verbal denuncia: *"vai ficar"*, *"responderia"*, *"em banco novo"*. Troque por passado medido.

**Errou depois de publicar?** Edite o comentário para o texto correto e sem meta-narrativa — o histórico de edição do GitHub já registra. A explicação do erro vai para o usuário, não para o thread do autor.

## Fechamento da rodada

⛔ **Cruze a lista de achados contra os comentários publicados — não conte de cabeça.**

```bash
gh api repos/<dono>/<repo>/pulls/<n>/comments --jq '.[] | "\(.path):\(.line)"'
```

Cada achado termina num estado dito em voz alta: **comentado**, **virou issue**, **descartado porque eu estava errado**, ou **dispensado por decisão do usuário**. "Não mencionei mais" não é estado — foi assim que um achado evaporou entre dois turnos, e quem percebeu foi o usuário.

⛔ **Rodada de correção é diff novo, e pede review novo.** Conferir que cada correção faz o que diz **não é** revisar — os commits de correção são código que ninguém leu ainda.

Cobrado duas vezes no PR #186, com a mesma pergunta: *"nenhum achado novo nas novas alterações?"*. Da primeira vez o passe encontrou uma validação de enum que sumira junto com o que eu pedi para remover. Da segunda, um defeito pior que o original: a correção do escape trocou concatenação por interpolação, e a busca por destino passou a responder 500.

⛔ **O resumo abre com o número de achados, e cada um aparece nomeado.** Destacar os mais graves é certo; comprimir a cauda num parágrafo corrido não é — quem lê conta o que consegue ver. Na rodada do PR #186 eu apresentei 3 em destaque e os outros 12 numa frase só, e a pergunta que veio foi *"só foram 3 mesmo?"*. Uma tabela de três colunas — estado, quantos, quais — resolve, e é a mesma contagem que o `gh api` acima confere.

## Idioma

Comentário em **pt-BR**, como issue e descrição de PR. Nome de símbolo, arquivo e comando ficam como estão no código.
