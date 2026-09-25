---
name: write-commit
description: >-
  Formato de mensagem de commit do FateConnect (Conventional Commits, mensagem em inglês imperativa),
  nomenclatura de branch e regra de um commit por mudança lógica. Use quando o usuário pedir para
  commitar, escrever ou revisar mensagem de commit, ou dividir alterações em commits.
---

# Commit format

Follow [Conventional Commits](https://www.conventionalcommits.org/). Message in **English**, imperative. Applied whenever the user asks to commit changes.

## Prefixes

| Prefix     | Use                                                           |
| ---------- | ------------------------------------------------------------- |
| `feat`     | New feature                                                   |
| `fix`      | Bug fix                                                       |
| `chore`    | Changes that do not affect production code (scripts, configs) |
| `ci`       | Pipeline and workflow under `.github/`                        |
| `refactor` | Code changes that do not alter external behavior              |
| `test`     | Adding or updating tests                                      |
| `docs`     | Documentation changes                                         |
| `style`    | Formatting only (spaces, indentation, etc.)                   |

## Format

- `prefix: message`
- Imperative, lowercase after the colon. Do not add the issue code (e.g. Github Issue ID) in the message; it is already in the branch name.

⚠️ **`ci` e `chore` se confundem, e o corte é o arquivo:** mexeu em `.github/`, é `ci`; qualquer outro script ou configuração é `chore`. A distinção existe porque a esteira é o que decide se um PR pode ser mergeado — quem lê o histórico procurando "por que o CI mudou" não deveria ter de garimpar entre `chore`.

### Examples

- `feat: add submit button`
- `fix: correct email field validation`
- `chore: update dependencies`
- `docs: update setup README`

> **Idioma:** commit, nome de branch e **título** de PR em inglês. A **descrição** do PR é o único texto do fluxo git em pt-BR.

## Branch naming

Branches: `<type>/<issue-code>` — e.g. `feature/123`, `fix/123`, `chore/123`, `refactor/123`, `hotfix/123`.

## Local commits

- Prefer `git commit --amend` for small fixes or additions to the last commit.
- Use `git rebase -i` to group or reorder commits before opening the PR.
- Avoid unnecessary commits (e.g. `fix typo`, `add console.log`). Keep history clean for review.
- Use `--amend` and `rebase` with care.

## User confirmation (mandatory)

**Always ask for user review and confirmation before running any git command** (e.g. `git commit`, `git commit --amend`, `git add`, `git rebase -i`). This applies even when command execution is allowed. Show: (1) what will be committed or staged, (2) the proposed commit message, (3) the exact command to run. Only execute after the user explicitly confirms.

⛔ **A confirmação cobre o fluxo que ela nomeia, não um comando só.** Autorizado "segue até abrir o PR" ou "pode seguir até fechar", o commit, a reescrita, o `push --force-with-lease` e a resposta em thread até aquele ponto não pedem um segundo sim. Cobrado em 25/09/2026, no #461, depois de eu reperguntar antes de dobrar um commit já decidido: *"já falei, segue até abrir o PR"*. **O que volta a ele é a decisão nova** — algo que a autorização não previa, como o conflito de lint que apareceu no meio daquele mesmo fluxo.

## One logical change per commit (mandatory)

**You MUST NOT** stage and commit all changes in a single commit. **Before suggesting or running any commit:**

1. **Split the work:** Each commit MUST contain exactly one logical change (e.g. one feature, one refactor, one fix, or one docs update). If the current diff mixes multiple concerns (e.g. new API + new component + styles), you MUST split into separate commits.
2. **Verify scope:** Ask yourself: "Could someone revert or cherry-pick this commit alone without breaking the branch?" If no, split further.
3. **One commit per step:** Treat each commit as a standalone unit (readable message, minimal diff, safe to revert).

When the user asks for a commit, propose or execute **one** commit at a time for the current logical unit; then suggest the next commit for the remaining changes. **Do not batch unrelated changes into one commit.**

### Agrupar é metade da regra

A regra é **uma mudança lógica por commit** — não um commit por arquivo, nem um commit por edição. Dividir demais é tão errado quanto juntar tudo: quem revisa passa a ler três diffs que só fazem sentido lidos juntos, e reverter exige achar os três.

**Teste antes de dividir:** as duas mudanças descrevem o mesmo assunto para quem lê o histórico? Se a resposta é sim, é **um** commit.

⛔ Aconteceu na `chore/57`: saíram três commits — filtro de caminho no CI, remoção de um job e recorte dos testes — quando os três eram *"ajustar o CI"*. Correção do Victor: *"são todos relacionados à CI, a ideia é agrupar mudanças lógicas em commits, não fazer só 1 pra tudo e não fazer commits atômicos tbm"*. Pior: uma das fatias não funcionava sozinha (chamava o script sem o `fetch-depth: 0` que a fatia seguinte adicionava), o que viola o próprio critério de "dá para reverter ou cherry-pick isolado".

Sinal de divisão excessiva: dois commits seguidos tocando **o mesmo arquivo** pelo **mesmo motivo**. Hook e CI são assuntos diferentes (um roda na máquina, outro no servidor) — filtro e recorte *dentro* do CI, não.

### Reescrever a história: os blocos saem do diff final, não dos commits antigos

⛔ **Ao refazer a história de uma branch, derive os commits do diff contra a base — nunca da lista de commits que existia.** Os limites antigos guardam a **ordem em que o trabalho aconteceu**, incluindo o vaivém do review que a reescrita existe justamente para apagar. Reaproveitá-los reproduz a divisão errada com mensagens novas.

Aconteceu em 04/09/2026, na #296. A branch tinha 7 commits e eu propus 8 — um por bloco antigo, mais o novo. O Victor perguntou *"não tem como reduzir a quantidade de commits?"*, e a releitura mostrou que **quatro** contavam o mesmo assunto: expor o `ListItem`, montar as seções, criar o `Sair` e ligar tudo na casca não se revertem um sem o outro. Viraram um, e a branch fechou em 4.

**O sinal é a contagem não cair.** Reescrita que sai com tantos commits quantos entraram não reagrupou nada — só renomeou.

### Cada commit precisa compilar sozinho

⛔ **Nenhum gate confere isto: ESLint, `tsc` e a suíte rodam sempre na ponta da branch, nunca em cada commit.** Agrupar por assunto é certo e esquece a ordem de dependência — o assunto "promover o componente" e o assunto "usar o componente" não nascem na mesma hora.

**O tell é um arquivo de índice.** Barrel, `index.ts`, arquivo de rotas, registro de módulo: eles reúnem o que está espalhado, então são o primeiro lugar onde um commit passa a citar o que só chega no seguinte.

Aconteceu duas vezes com a mesma forma. Na #171, o commit da paginação levava o barrel exportando um componente cuja pasta só chegava depois. Em 11/09/2026, na #358, o commit que promovia o link levava `export type { FooterContact }` enquanto o tipo só nascia no commit seguinte.

⚠️ **`git ls-tree` responde por arquivo, e o segundo caso passa por ele.** O `Footer/index.tsx` **existia** naquele commit; faltava o tipo dentro dele. Para símbolo não há atalho — o que responde é compilar:

```bash
git worktree add --detach /tmp/checa <commit>
ln -s "$PWD/<app>/node_modules" /tmp/checa/<app>/node_modules
cd /tmp/checa/<app> && ./node_modules/.bin/tsc --noEmit
git worktree remove --force /tmp/checa
```

⛔ **E há um segundo tell, que não é arquivo: uma interface que ganha método.** Quem a implementa mora noutros arquivos, e o **duplo de teste** é o que se esquece — ninguém pensa nele como consumidor. O commit que alarga a interface não compila enquanto o duplo não a acompanha.

Aconteceu em 21/09/2026, na #374: o commit da varredura acrescentou dois métodos à `ILostAndFoundRepository`, e o duplo que `ImageStorageTests` declara só os ganhava dois commits depois. Três erros `CS0535` — invisíveis para o `pre-commit`, que compila a **árvore de trabalho** e não o estado do commit.

No back-end a sonda é a mesma, trocando o compilador:

```bash
git worktree add --detach /tmp/checa <commit>
cd /tmp/checa && dotnet build FateConnect/FateConnect.Api/FateConnect.Api.sln
git worktree remove --force /tmp/checa
```

**Rode isso nos commits que mexem em índice ou alargam interface**, não em todos. Achando erro, a correção é mover para o commit que traz o símbolo **só o trecho que depende dele** — não o arquivo inteiro, e não reordenar os commits.

⚠️ **Mover o arquivo inteiro carrega junto o que não era dali.** Naquele `ImageStorageTests` havia duas mudanças independentes — a conformidade com a interface e a extração de uma classe aninhada —, e só a primeira pertencia ao commit da interface.

### Corte que exige inventar um estado é corte errado

⛔ **Se dividir por assunto obriga você a autorar uma versão de arquivo que nunca existiu, o corte está errado — recorte, não invente.** O commit do meio passa a carregar código que ninguém escreveu e que morre no commit seguinte; quem revisa lê history ficcional, e nenhum gate acusa.

⛔ Aconteceu em 21/09/2026, na #429. O plano tinha três commits — extrair o serviço de imagem, separar as listagens, mover a rota da foto — e as duas últimas mudanças haviam **reescrito as mesmas regiões** do mesmo serviço: uma função morreu justamente *porque* a outra mudança aconteceu. O commit do meio só sairia com aquela função ressuscitada para morrer de novo depois. O corte virou dois, e o que sobrou foi o único pedaço com estado intermediário **real**: a extração, que existiu antes da mudança de rota.

⚠️ **Isto é o oposto da seção de replay abaixo.** Lá os estados intermediários **existiram** e se reconstroem reaplicando a transformação; aqui eles nunca existiram, e reconstruí-los é escrever ficção.

**O tell é você abrindo o editor para "desfazer" parte de uma mudança** só para o commit anterior fechar.

### Quando as mudanças se sobrepõem nos mesmos arquivos

Lote de mudanças mecânicas (rename, `Readonly`, namespace de import) costuma tocar os **mesmos arquivos**. Reconstruir "como o arquivo estava depois do commit 3" à mão é lento e erra em silêncio. Em vez disso, **replay**:

1. Snapshot do estado final (`cp -r src <tmp>`), conferindo a contagem de arquivos.
2. Voltar ao HEAD: `git checkout -- .` e `git clean -fd`.
3. Reaplicar **uma transformação por vez**, commitando cada uma.
4. No fim, `diff -r <tmp>/src src` — **zero diferenças** prova que o histórico dividido chega no mesmo estado que já passou nos gates.

⚠️ **Reaplique o script da transformação; não copie o arquivo pronto do snapshot** — o arquivo pronto traz junto as outras transformações. Aconteceu no PR #77: o commit da navegação levou o rename de enum e teve que ser refeito reconstruindo o trecho a partir de `git show HEAD:<arquivo>`.

⚠️ **Antes do primeiro commit, conferir que o índice está limpo** (`git diff --cached --stat` vazio). Índice sujo faz o primeiro commit engolir o lote inteiro — aconteceu no PR #76.

### O commit do meio não exibe palavra que não é nem a antiga nem a final

⛔ **Ao dividir um rename em dois commits, confira o que cada um mostra na tela.** Quem revisa lê commit a commit, e um estado intermediário que não é o produto de antes nem o de depois se lê como sobra.

Na #310 o corte foi "contrato para inglês" e depois "rename da copy", nessa ordem, para que nenhum commit escrevesse inglês na barra de endereço. O efeito colateral: no primeiro, o `STATUS_SLUG` dizia `cancelado` enquanto o PR inteiro era sobre `excluido`. O Victor apontou **duas vezes** achando que era resíduo.

**A ordem que evita isso põe o visível primeiro:** o commit da copy já mostra a palavra final, e o do contrato, depois dele, não toca em rótulo nem em URL. Escolhendo a outra ordem, diga no corpo do PR o que o commit do meio exibe — e conte com a pergunta assim mesmo.
