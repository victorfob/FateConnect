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

⛔ **Nada de comentário solto.** Todo apontamento vai numa linha específica. Comentário na aba de conversa não aparece ao lado do código, e quem corrige tem que caçar o lugar.

⛔ **Um problema por comentário.** Dois threads sobre linhas vizinhas é ruído; se dois apontamentos têm a **mesma correção**, são um comentário só — foi o caso do `[Range]` duplicado e do `[Required]` inútil, que estavam no mesmo bloco de anotações e terminavam na mesma frase: enxugar o DTO.

## Onde ancorar

```bash
gh api --method POST repos/<dono>/<repo>/pulls/<n>/comments \
  -f commit_id="$(gh pr view <n> --json headRefOid --jq .headRefOid)" \
  -f path="<caminho>" -F line=<n> -f side="RIGHT" -f body='...'
```

- ⛔ **A linha precisa estar dentro de uma seção do diff**, senão a API responde 422. Confira antes mapeando as seções — o `Program.cs` tinha um vão de duas linhas exatamente onde eu queria comentar.
- **Problema num arquivo apagado: `side: LEFT`, no arquivo antigo.** É a melhor âncora para comportamento removido — o comentário sobre o `TimeOnlyJsonConverter` ficou em cima do XML doc que explicava por que ele existia, então o motivo e o apontamento chegam juntos.
- Editar: `PATCH .../pulls/comments/<id>`. Apagar: `DELETE` no mesmo caminho.

⛔ **Quando o problema é ausência, não há âncora.** Arquivo que o PR *não* tocou não está no diff. Aí o apontamento não é comentário: vira issue, ou não é levantado. **Decida com o usuário** — foi assim que o contrato do front virou uma issue em vez de um thread.

## O que a redação precisa carregar

- **A consequência concreta**, não a categoria. "Toda chamada do navegador é recusada e nada aparece no log da API" faz o autor entender em cinco segundos; "problema de configuração de CORS" não.
- **O custo da correção, quando é baixo.** *"Nenhum `using` muda, porque o namespace já é esse"* transforma um pedido que parecia varredura num `git mv`.
- **De onde o defeito veio, quando não é do autor.** O `unaccent` e a ordenação sem desempate vieram do código antigo. Dizer isso evita que o comentário soe como cobrança — e mantém o pedido, porque a oportunidade de corrigir é agora.
- **Uma solução**, quando o código responde qual é a certa. **Duas**, apenas quando a escolha é do autor — e aí ordenadas, com a recomendada primeiro.

⛔ **Nunca marque thread como resolvida.** Resolver é de quem comentou ou de quem revisa, não de quem apontou.

## Meça antes de afirmar

⛔ **Afirmação sobre dado, contagem, extensão ou configuração de ambiente exige medição.** Escrevi que uma migração deixaria as caronas órfãs e que a tela ficaria vazia em produção — os bancos não tinham uma linha. No mesmo review, medir transformou um achado hipotético sobre `unaccent` no defeito mais grave da rodada: o filtro por destino já respondia 500 em produção.

O tempo verbal denuncia: *"vai ficar"*, *"responderia"*, *"em banco novo"*. Troque por passado medido.

**Errou depois de publicar?** Edite o comentário para o texto correto e sem meta-narrativa — o histórico de edição do GitHub já registra. A explicação do erro vai para o usuário, não para o thread do autor.

## Fechamento da rodada

⛔ **Cruze a lista de achados contra os comentários publicados — não conte de cabeça.**

```bash
gh api repos/<dono>/<repo>/pulls/<n>/comments --jq '.[] | "\(.path):\(.line)"'
```

Cada achado termina num estado dito em voz alta: **comentado**, **virou issue**, **descartado porque eu estava errado**, ou **dispensado por decisão do usuário**. "Não mencionei mais" não é estado — foi assim que um achado evaporou entre dois turnos, e quem percebeu foi o usuário.

## Idioma

Comentário em **pt-BR**, como issue e descrição de PR. Nome de símbolo, arquivo e comando ficam como estão no código.
