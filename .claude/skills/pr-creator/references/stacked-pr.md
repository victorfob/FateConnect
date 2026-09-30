# PR empilhado à mão: o squash da base o deixa em conflito

⛔ **PR que aponta para a branch de outro PR, sem pilha nativa, entra em conflito quando a base é mergeada por squash.** O GitHub reaponta a base para a `develop`, mas não rebaseia: o PR segue carregando os commits da base, que na `develop` viraram **um** commit com outro SHA, e o `mergeable` vira `CONFLICTING`. Fica fora da pilha nativa o PR cujas bases já têm aprovação de outra pessoa, porque linkar reapontaria as bases.

**A saída é replay com `--onto`, nunca `git rebase origin/develop`:**

```bash
git rev-parse <branch-da-base>                        # guarde o tip ANTES: a branch some no merge
git diff --quiet <tip-antigo-da-base> origin/develop  # vazio = a base está inteira na develop
git rebase --onto origin/develop <tip-antigo-da-base> <branch>
```

**A prova é o patch, não o verde:** as linhas `+`/`-` de `git diff <tip-antigo-da-base> <tip-antigo>` e de `git diff origin/develop <branch>` são iguais. Depois, `push --force-with-lease=<branch>:<tip-antigo>`, e o corpo do PR que falava da pilha muda, partindo do corpo publicado.

⚠️ **Squash se reconhece pelo pai:** `git log -1 --format=%P origin/develop` com **um** SHA só. Aqui o commit squashado leva o título do PR com o número no fim (`refactor(454): … (#456)`); merge commit tem dois pais.
