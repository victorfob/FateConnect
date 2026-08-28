---
description: Quando trabalhar em paralelo — uma worktree por issue e nunca por fatia de issue, proposta antes de disparar, issue-base pronta antes das dependentes, e a mecânica de worktree que já custou tempo
---

# Trabalho em paralelo

## A unidade é a issue, nunca a fatia

Uma worktree por **issue**. Issue única se faz inteira, no checkout principal, por mais independentes que as peças dela pareçam.

⛔ Aconteceu na #123: *"use worktrees separadas pra fazer as coisas em paralelo, uma pra cada subtask"* virou três worktrees — serviço, filtro e cartão — **dentro de uma issue só**. Correção do Victor: *"quando disse pra fazer em paralelo eu tinha falado sobre fazer cada issue em paralelo, quando for uma issue só vc pode fazer tudo"*.

Sintoma de que a fatiação está errada: duas worktrees produzindo arquivos que entram no **mesmo PR**.

## Proponha a fatiação e espere o ok

Paralelizar é decisão do Victor, não minha. Ao ver duas issues independentes prontas para começar, dizer qual vai em qual worktree e **esperar a confirmação** — mesmo quando ele já usou a palavra "paralelo", porque foi justamente ela que se mostrou ambígua.

### O "sim" à fatiação é o gatilho de execução

⛔ **Aprovada a fatiação, a worktree e o agente saem no mesmo turno.** Não há segunda confirmação: o "sim" autorizou o trabalho, não só o desenho dele.

Aconteceu na #137: propus "#137 e #140 em paralelo", o Victor respondeu *"Beleza, pode fazer"*, e eu comecei a #140 sozinho no checkout principal. A cobrança veio como *"pq não ta fazendo a 137 em paralelo?"*. Eu tinha lido o "sim" como aval do **desenho** e presumido que disparar agente precisava de um pedido à parte.

O sinal de que estou prestes a repetir: começar a executar **uma** das issues logo depois de o Victor aprovar duas. Se a fatiação previa duas frentes e só uma está andando, falta disparar a outra — ou dizer explicitamente por que não vai.

## Issue-base pronta antes das dependentes

Issue que declara "Depende de" só começa quando a base estiver **com o escopo inteiro, PR aberto e verde**. As irmãs saem então da branch da base, uma por worktree.

⛔ Mesma rodada: a #124, a #125 e a #126 dependem da #123 e as três mexem no mesmo cartão. Começá-las antes seria escrever contra um componente que ainda não existe. *"123 deve ficar pronta com seu escopo já, antes das worktrees"*.

## Mecânica de worktree

- **A worktree não nasce na branch atual.** Na #123 ela nasceu 16 commits atrás, sem o commit do contrato. Conferir com `git log --oneline -1` e corrigir com `git merge --ff-only <branch-da-tarefa>` **antes** de escrever qualquer linha.
- **A worktree não tem `node_modules`.** Symlink para o do checkout principal, senão não há ESLint, `tsc` nem Vitest.
- **`.claude/worktrees/` fica fora do versionamento** — a pasta é ignorada, porque worktree de agente dentro de pasta versionada aparece como arquivo não rastreado na raiz.
- **Agente cai.** Nesta rodada um morreu em erro 403 de autenticação e outro travou depois de commitar. Quando cair: verificar o que já foi commitado na branch da worktree e assumir a fatia — relançar às cegas refaz trabalho que já existe.
- **A integração é minha.** Cherry-pick da branch da worktree para a branch da tarefa, e os gates valem no **estado integrado** — o verde que cada worktree reporta é sobre uma árvore que ninguém vai mergear.

## Conferir a entrega do agente: comentário primeiro

⛔ **Antes de aceitar o que um agente entregou, meça a densidade de comentário.** As rules do repo carregam para dentro da worktree, mas o agente as pondera menos que o resto do prompt — e comentário é o item que ele mais acrescenta por conta própria.

```bash
git diff <base>..HEAD -- '*.ts' '*.tsx' | grep -cE "^\+[^+]"                 # linhas adicionadas
git diff <base>..HEAD -- '*.ts' '*.tsx' | grep -cE "^\+\s*(/\*\*|\*|//)" # dessas, comentário
```

Na #156 deram **37 de 157 linhas — 24%**. Sete reprovaram no teste da `comentarios.md` e saíram: um JSDoc que repetia o que o `types.ts` já dizia e ainda pousava sobre a constante errada, um que só reafirmava a linha logo abaixo, e uma enumeração de consumidores que **envelheceu no próprio PR** que a escreveu.

⚠️ **A densidade é o gatilho de ir olhar, não o veredito.** Compare com o mesmo arquivo na branch base antes de cortar: `palettes.ts` já era 15% e `tokens/palette.ts` é 40% — arquivo que guarda decisão de cor é denso por convenção da casa, e cortar até uma meta inventada apaga justamente o *porquê*. Quem decide continua sendo o teste de cada comentário: **ele impede alguém de fazer uma mudança errada?**

## Gate verde não prova componente

⛔ **Rode a entrega do agente dentro da aplicação antes de aceitá-la.** ESLint, `tsc`, a suíte inteira e o teste de contraste podem passar sobre um componente que se desenha errado, porque **nenhum deles o renderiza dentro do app** — sem o CSS da biblioteca competindo, sem o tema real, sem os vizinhos.

⛔ **E desconfie de medição feita em sonda isolada.** É o jeito natural de um agente provar estilo, e é justamente onde o defeito se esconde: a sonda mede um mundo em que a disputa não existe. Medição fora do contexto real não é medição fraca: é medição de outra coisa.

Aconteceu na #171. O agente relatou, de boa-fé, ter medido a página selecionada em `#CF2E2E` com texto branco. No app o fundo era o **cinza do MUI**: o seletor `& .Mui-selected` tem a mesma especificidade do seletor da biblioteca e perdia no desempate por ordem de fonte. A cor do texto aplicava — o MUI não disputa essa propriedade —, então o número saía **branco sobre cinza claro**, quase ilegível. Atravessou ESLint, `tsc`, 436 testes e o teste de contraste. Quem pegou foi o Victor, mandando testar antes de abrir o PR.

**O que rodar:** suba a aplicação, ligue o componente numa tela de verdade — fiação temporária, fora de commit — e meça com `getComputedStyle` **ali**. Depois desfaça a fiação e confira que ela não entrou em commit nenhum.

## Fatiação do agente: cada commit precisa compilar sozinho

⛔ **Confira o corte, não só o conteúdo.** O agente agrupa por assunto e esquece a ordem de dependência, e nenhum gate pega: eles rodam sempre na ponta da branch, nunca em cada commit.

Na mesma #171, o commit da paginação já trazia o barrel **inteiro**, exportando um componente cuja pasta só chegava no commit seguinte — `tsc` reprovaria naquele ponto do histórico. Cada commit passou a levar apenas a sua própria linha no barrel.

```bash
git ls-tree -r --name-only <commit> -- <caminho que o barrel exporta>   # vazio = o commit aponta para o vazio
```
