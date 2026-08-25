---
name: resolve-pr-comments
description: "Resolve, responde e faz a triagem de comentários de review numa Pull Request deste repositório. Use sempre que o usuário apontar para feedback de review — \"resolve os comentários do PR\", \"responde o review\", uma URL de PR seguida de observações, ou uma nova rodada de comentários depois de um fix anterior. Busca os comentários inline, os gerais e os corpos de review, confere cada um contra o código atual antes de tocar em qualquer coisa, aplica o que é válido, responde a todos com justificativa (inclusive as recusas), roda o quality gate e pede confirmação antes de qualquer comando git. Não use para abrir ou atualizar PR (isso é pr-creator) nem para revisar código do zero."
---

# Resolver comentários de PR

Trate o feedback de ponta a ponta: buscar tudo, julgar cada ponto contra o código real, aplicar o que faz sentido, responder a todos — inclusive o que for recusado — e rodar o gate. Sem resolver thread em silêncio.

**O ponto é julgamento, não obediência.** Quem revisa costuma estar certo, às vezes está errado, e às vezes comenta em código que já mudou. O trabalho é separar sinal de ruído e deixar registrado o **porquê** de cada decisão.

## 1. Busque os três streams

Uma PR guarda comentários em três lugares e é fácil deixar um passar:

```bash
gh api repos/OWNER/REPO/pulls/PR/comments --paginate   # inline, presos a uma linha
gh api repos/OWNER/REPO/issues/PR/comments --paginate  # gerais, na aba de conversa
gh api repos/OWNER/REPO/pulls/PR/reviews --paginate    # corpo de cada review enviado
```

Guarde `id`, `in_reply_to_id`, `path`, `line`, `user.login` e `body`. O `id` é o que permite responder na thread certa. Havendo rodada anterior, identifique o que é **novo** para não reabrir o que já foi resolvido.

## 2. Faça a triagem e espere o sinal verde

Para cada comentário: **veredicto** — aplicar, recusar (com motivo) ou já resolvido.

Apresente em tabela curta (comentário → veredicto → plano) e **espere a confirmação antes de tocar no código**. O passo é deliberado: quem revisa conhece contexto que você não tem — algo combinado noutro lugar, mudança que vem em outra PR, enquadramento que ele quer. É o momento mais barato de redirecionar.

## 3. Confira contra o código atual — este é o passo que mais protege

⛔ **Não confie no diff citado no comentário.** Abra o arquivo na linha real e confirme se o apontamento ainda se sustenta. Comentário sobre código que já mudou é recusa, não mudança.

Quando o comentário propõe **silenciar** um erro — desabilitar regra, capturar exceção, esconder aviso —, redobre o escrutínio: distinga correção de máscara, e investigue a causa antes de suprimir.

## 4. Aplique o válido, recuse o resto — sempre com motivo

- **Válido** → a menor mudança que resolve o ponto.
- **Falso positivo** → **não** ignore em silêncio: responda explicando (diff velho, suposição errada, resolve metade do problema, semântica deliberada).
- **Decisão de julgamento** → boa prática legítima com trade-off real: leve ao usuário em vez de decidir sozinho.

**Respeite o escopo.** Se o pedido foi "só responde", só responda. Branch de release é sensível: não edite sem sinal verde explícito.

## 5. Rode o gate no que mudou

De `FateConnect/Web`, com o Node do `.nvmrc`:

```bash
./node_modules/.bin/eslint <arquivos alterados>
./node_modules/.bin/tsc --noEmit
./node_modules/.bin/vitest run <caminho afetado>
```

Erro reprova; warning se ignora. Não reporte como pronto com erro de pé.

## 6. Commit — peça confirmação antes

Uma mudança lógica por commit, mensagem em inglês no imperativo, pela skill `write-commit`. **Mostre o que vai ser preparado e a mensagem, e espere o sim** antes de qualquer comando git. Entrada de changelog vai em commit próprio, pela skill `changelog-writer`, e é sempre o último da branch.

## 7. Responda na thread, em pt-BR, uma resposta por thread

Resposta concreta — "ajustado X, por causa de Y" ou "mantido como está porque Z" —, nunca um "feito" seco nem um comentário de nível superior redundante.

**Agrupe por thread, não por comentário.** Uma thread costuma ter vários comentários: qualquer um com `in_reply_to_id` pertence à mesma. Responda **uma vez** no id **raiz**:

```bash
gh api --method POST repos/OWNER/REPO/pulls/PR/comments/ROOT_COMMENT_ID/replies \
  -f body='Ajustado: <o que mudou>.'
```

**Entre rodadas, edite a sua resposta anterior** em vez de empilhar outra — e só a sua:

```bash
gh api --method PATCH repos/OWNER/REPO/pulls/comments/SUA_RESPOSTA_ID -f body='<texto novo>'
```

## 8. ⛔ Não marque thread como resolvida por conta própria

Responder e resolver são coisas diferentes: resolver esconde a thread e sinaliza encerramento, o que é decisão de quem revisou. **Por padrão, responda e deixe aberta.** Só resolva quando pedirem, e aí por GraphQL, que é o único caminho:

```bash
gh api graphql -f query='mutation { resolveReviewThread(input: {threadId: "THREAD_NODE_ID"}) { thread { isResolved } } }'
```

## 9. Feche com o resumo

Reporte o que foi aplicado e o que foi recusado (com o porquê), os commits, e o link `discussion_r…` de cada resposta — é o que permite conferir a rodada rápido.

Não há bot de review neste repositório: quem comenta é humano, e o peso do comentário é o de sempre.
