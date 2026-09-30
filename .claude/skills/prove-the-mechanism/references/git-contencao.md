# Contenção de branch

## A referência do comando

`git branch -d` mede contra a branch em que você está, não contra a que você provou. `rev-list --count origin/main..<branch>` = 0 e o `-d` recusando com *"not fully merged"* respondem perguntas diferentes. O teste explícito na referência:

```bash
git merge-base --is-ancestor <branch> origin/main   # exit 0 = está toda lá
```

Provado assim, o `-D` é seguro — e a prova vai dita junto.

## Restrita aos arquivos que a branch tocou

`git diff <branch> develop` sobre a árvore inteira traz também o que entrou na base depois, e isso se lê como trabalho perdido.

```bash
base=$(git merge-base develop <branch>)
git diff --name-only "$base" <branch> > /tmp/tocados.txt
wc -l < /tmp/tocados.txt          # zero aqui é o instrumento falhando, não contenção
tr '\n' '\0' < /tmp/tocados.txt | xargs -0 git diff <branch> develop --
```

Saída vazia **com a contagem acima de zero** ⇒ nada ficou de fora. A contagem não é zelo: com lista vazia o `xargs` do BSD não roda nada e o do GNU roda o `git diff` sem pathspec, imprimindo a árvore inteira.
