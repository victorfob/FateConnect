---
description: Copy de interface — aviso de sucesso sem redundância, uma palavra por conceito, frase curta e sem "você" em mensagem transacional
paths:
  - "FateConnect/Web/**"
---

# Copy de produto

O texto da interface é produto, não decoração. Vale para rótulo, botão, aviso, título de diálogo, estado vazio e mensagem de erro.

## Aviso de sucesso nomeia o que aconteceu

⛔ **Sem "com sucesso".** O aviso já **é** a confirmação; a palavra não acrescenta informação e alonga a frase. Particípio e ponto final:

| ❌ | ✅ |
| --- | --- |
| Item concluído com sucesso. | Item resolvido. |
| Item excluído com sucesso. | Item excluído. |
| Carona ofertada com sucesso. | Carona ofertada. |

Mesma régua para as outras muletas: "por favor", "aguarde um momento", "o seu saldo atual é".

## Um conceito, uma palavra

O mesmo objeto ou estado se chama igual em **toda** a tela — etiqueta, botão, título de diálogo e aviso. Antes de fechar, varra o artefato inteiro, não elemento a elemento.

⛔ Aconteceu em achados e perdidos: a etiqueta dizia "Concluído", o diálogo "Confirmar Conclusão", o botão "Concluir" e o aviso "Item resolvido" — quatro lugares, dois nomes para o mesmo estado. Ficou **Resolvido** em todos, inclusive no valor que o contrato serializa.

## Erro diz o que houve e o que fazer

`Erro ao carregar os itens. Tente novamente.` — o que falhou, e a saída. Sem prefixo "Erro:" repetido dentro da frase, sem texto de exceção cru, sem culpar quem lê.

## Frase curta, sem "você" em mensagem transacional

- Voltada ao fato, não à pessoa: "Item excluído", não "Você excluiu o item".
- Sem jargão, sem metáfora, sem linguagem rebuscada.
- Tom claro e direto: nem formal demais, nem íntimo.
- `você` continua valendo quando a ação é genuinamente de quem lê ("Tem certeza que deseja excluir…").

## Idioma

Copy em **pt-BR**; identificador em inglês. A constante se chama `resolveSucceeded`, o texto dela é `Item resolvido.` — ver `.claude/rules/fateconnect-locale-code.md`.
