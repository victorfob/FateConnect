---
name: parallel-work
description: "Trabalho em paralelo com worktrees e subagentes. Use quando o pedido falar em paralelo, worktree, cada uma na sua ou abre as frentes, ao fatiar trabalho entre agentes, ao abrir uma worktree, ao integrar ou conferir o que um agente entregou, ou quando dois servidores de dev estiverem no ar. Cobre a unidade de fatiação (issue), a ordem base e dependentes, a mecânica de worktree e a conferência da entrega."
---

# Trabalho em paralelo

## Paradas

1. ⛔ **A unidade é a issue, nunca a fatia → issue única se faz inteira, no checkout principal**, por mais independentes que as peças pareçam. Sintoma de fatiação errada: duas worktrees produzindo arquivos do mesmo PR.
2. ⛔ **Paralelizar é decisão do usuário → proponha qual issue vai em qual worktree e espere o ok**, mesmo quando ele já disse "paralelo": a palavra é ambígua. O "sim" é gatilho de execução: todas as frentes saem no mesmo turno. Aprovadas duas e só uma andando, falta disparar a outra — ou dizer por que não vai.
3. ⛔ **Issue com "Depende de" só começa com a base de escopo inteiro, PR aberto e verde** — antes disso ela escreve contra código que não existe. As irmãs saem da branch da base, uma por worktree.

## Mecânica de worktree

- **A worktree não nasce na branch atual.** Confira com `git log --oneline -1` e corrija com `git merge --ff-only <branch-da-tarefa>` antes da primeira linha.
- **Branch criada de `origin/<base>` rastreia a base**, e o `git push` vai para ela — vale para `git worktree add -b` e para `git checkout -b`:

  ```bash
  git branch --unset-upstream <nova>
  git rev-parse --abbrev-ref <nova>@{upstream}   # não pode responder nada
  ```

- **A worktree não tem `node_modules`:** symlink para o do checkout principal, senão não há ESLint, `tsc` nem Vitest.
- `.claude/worktrees/` é ignorada pelo git; worktree de agente mora ali.
- **Agente que cai:** confira o que já foi commitado na branch dele e assuma a fatia; relançar às cegas refaz trabalho.
- **A integração é sua:** cherry-pick da branch da worktree para a da tarefa, e os gates valem no **estado integrado** — o verde de cada worktree é sobre uma árvore que ninguém vai mergear.

## Conferir a entrega do agente

- **Comentário primeiro.** O agente pondera as rules menos que o prompt, e comentário é o que ele mais acrescenta sozinho. Meça antes de aceitar:

  ```bash
  git diff <base>..HEAD --numstat -- '*.ts' '*.tsx' | awk '{total += $1} END {print total}'        # linhas adicionadas
  git --no-pager diff --no-ext-diff <base>..HEAD -- '*.ts' '*.tsx' | grep -cE '^\+\s*(/\*\*|\*|//)'  # dessas, comentário
  ```

  A densidade é o gatilho de ir olhar, não o veredito: compare com o mesmo arquivo na base (arquivo de decisão de cor é denso por convenção) e julgue cada comentário pelo teste da `comments.md`.
- **Rode no app.** Gate verde não renderiza o componente dentro da aplicação; a conferência é a da skill `visual-validation` (fiação temporária numa tela real).
- **O corte dos commits:** o agente agrupa por assunto e esquece a ordem de dependência, e nenhum gate roda em cada commit. A conferência está na skill `write-commit`.

## Dois servidores no ar, um painel de navegador

O painel é compartilhado, e a aba que parece sua pode servir o checkout do vizinho noutra branch. Toda medição leva a porta, lida da própria página:

```js
({ porta: location.port, rota: location.pathname })
```

`lsof -nP -iTCP -sTCP:LISTEN | grep 517` diz quantos servidores existem. Mais de um ⇒ nenhuma medição vale sem dizer de qual porta veio.
