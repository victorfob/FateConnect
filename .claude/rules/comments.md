---
description: Quando comentar no front, nos workflows, hooks e scripts — renomear, extrair e simplificar antes de escrever, só a decisão que o código não deixa deduzir sobrevive, até três linhas e nada de histórico
paths:
  - "FateConnect/Web/**"
  - ".github/**"
  - ".githooks/**"
  - "scripts/**"
  - "deploy/**"
---

# Comentário

Em C# não há comentário: o `pre-commit` e o `check-api` reprovam `//` e `/* */` em `.cs`, fora dos arquivos gerados. Esta rule vale para TypeScript, YAML de workflow e shell.

## Reescrever vem antes de comentar

⛔ **Comentário é sinal de que o código não se explicou sozinho.** Antes de escrever um, tente nesta ordem:

1. **renomear** — variável, função ou tipo que revele a intenção;
2. **extrair** — uma função nomeada no lugar do bloco que você ia comentar;
3. **simplificar** — early return, menos aninhamento, condição composta virando função com nome.

```ts
// ❌ o comentário narra o que a condição confere
// só quem administra ou quem ofertou pode excluir a carona
if ((profile === ProfileTypeEnum.ADMINISTRATOR || ride.isOwner) && ride.isActive) removeRide(ride);

// ✅ o nome carrega a intenção, e não sobra o que comentar
if (canRemove(profile, ride)) removeRide(ride);
```

**Sobrevive a decisão que o código não deixa deduzir:** o porquê de uma escolha contraintuitiva, uma armadilha de fora (contrato de terceiro, defeito de biblioteca, limite de plataforma) ou o motivo de não ter sido feito do jeito óbvio. E o candidato passa por um teste: **ele impede alguém de fazer uma mudança errada?** A escada vem antes porque, recém-escrito, quase todo comentário parece passar no teste.

Fica: o `Array.isArray` dos serviços, *porque sem endereço de API o dev server responde HTML com 200* (sem isso alguém apaga a guarda como código morto); o `event.target.value = ''` do `PhotoField`, *porque o navegador não dispara a troca ao escolher o mesmo arquivo de novo*.

## Sai, sempre

- JSDoc que repete a assinatura ou o nome do símbolo — `/** A fileira de ações do cartão. */` sobre `LostItemActions`.
- Narração do passo seguinte: `// monta os filtros`, `// abre o diálogo`.
- Parágrafo de contexto que pertence ao PR ou à issue.
- Comentário que repete a constante declarada logo acima.
- ⛔ Histórico — data, número medido, o que foi investigado, a issue em que o defeito apareceu — vai para o commit e o PR. A restrição de fora fica e a derivação sai: *"texto pede 4,5:1 pela WCAG"* fica; *"como texto ela dá 4,11:1"* vira *"como texto ela reprova no contraste"*.

⛔ **A lista vale para o que já está escrito.** Ao editar um trecho, passe os comentários vizinhos pelo mesmo teste e apague os que só repetem o código — só no trecho que o PR já toca, sem varredura.

## Teto: três linhas de texto

⛔ Até três linhas de texto, sem contar os delimitadores; dentro do teto, siga o tamanho dos vizinhos. Estourou? Volte à escada; o que não couber vai para o PR, a issue ou uma rule — o comentário fica com a decisão, não com a derivação.

## Forma

`/** … */` acima de declaração (`const`, `function`, `type`, `enum`, componente `styled`); `//` dentro de corpo (propriedade de objeto, ramo de `if`, passo de teste). Não há banner de arquivo: comentário no topo cola na primeira declaração.

## Comentário envelhece com o vizinho

- ⛔ Ao mexer perto de um comentário — regra, seletor, ramo ou outro comentário —, releia-o. Se a sua mudança o torna falso, ele é seu para corrigir no mesmo PR, mesmo em outro arquivo.
- Desconfie da frase que descreve o que **não** é coberto ("segue passando", "fica de fora"): é a primeira a envelhecer. Quando precisar dela, nomeie o lugar onde a exceção vive.
- ⛔ Ao deletar uma declaração, delete o JSDoc de cima junto. JSDoc seguido de linha em branco é órfão. Símbolo apagado também sai do harness (skill `harness-evolution`).
- Arquivo novo logo depois de uma limpeza: compare a densidade de comentário com a dos vizinhos antes de commitar — a limpeza não muda o hábito do próximo arquivo.
