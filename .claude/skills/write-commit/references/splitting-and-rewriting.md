# Dividir e reescrever a história da branch

Leia antes de reescrever a história, de dividir a branch em mais de um commit, ou de commitar mudança que mexe em arquivo de índice (barrel, `index.ts`, rotas) ou alarga uma interface.

## Os blocos saem do diff final, não dos commits antigos

⛔ **Ao refazer a história, derive os commits do diff contra a base, nunca da lista de commits que existia.** Os limites antigos guardam a ordem do trabalho, inclusive o vaivém do review que a reescrita existe para apagar; reaproveitá-los reproduz a divisão errada com mensagens novas.

**O sinal é a contagem não cair.** Reescrita que sai com tantos commits quantos entraram só renomeou.

## Cada commit precisa compilar sozinho

⛔ **Nenhum gate confere isto:** ESLint, `tsc`, a suíte e o `pre-commit` olham a ponta da branch ou a árvore de trabalho, nunca o estado de cada commit. Agrupar por assunto esquece a ordem de dependência.

Os dois tells:

- **arquivo de índice** (barrel, `index.ts`, rotas, registro de módulo): o commit passa a citar o que só chega no seguinte;
- **interface que ganha método**: quem a implementa mora noutros arquivos, e o duplo de teste é o que se esquece (`CS0535` no commit do meio).

`git ls-tree` responde por arquivo, não por símbolo: o que responde é compilar o commit.

```bash
git worktree add --detach /tmp/checa <commit>
ln -s "$PWD/<app>/node_modules" /tmp/checa/<app>/node_modules
cd /tmp/checa/<app> && ./node_modules/.bin/tsc --noEmit
git worktree remove --force /tmp/checa
```

No back-end, troque o compilador: `cd /tmp/checa && dotnet build FateConnect/FateConnect.Api/FateConnect.Api.sln`.

Rode nos commits que tocam índice ou alargam interface, não em todos. Achando erro, mova para o commit que traz o símbolo **só o trecho que depende dele**: não o arquivo inteiro (ele carrega junto o que não era dali), e não reordene os commits.

## Corte que exige inventar um estado é corte errado

⛔ **Se dividir por assunto obriga a autorar uma versão de arquivo que nunca existiu, recorte, não invente.** Duas mudanças que reescreveram as mesmas regiões (uma função morreu *porque* a outra mudança aconteceu) não viram dois commits: o do meio carregaria código que ninguém escreveu. O tell é abrir o editor para "desfazer" parte de uma mudança só para o commit anterior fechar.

É o oposto do replay abaixo: lá os estados intermediários existiram.

## Replay: mudanças mecânicas que se sobrepõem nos mesmos arquivos

Lote de rename, `Readonly` ou namespace de import toca os mesmos arquivos. Em vez de reconstruir à mão cada estado:

1. Snapshot do estado final (`cp -r src <tmp>`), conferindo a contagem de arquivos.
2. Volte ao HEAD (`git checkout -- .` e `git clean -fd`), com o índice limpo (`git diff --cached --stat` vazio, senão o primeiro commit engole o lote).
3. Reaplique **o script de uma transformação por vez**, commitando cada uma; não copie o arquivo pronto do snapshot, que traz as outras junto.
4. `diff -r <tmp>/src src` com zero diferenças prova que o histórico dividido chega no estado que já passou nos gates.

## O commit do meio não exibe palavra que não é nem a antiga nem a final

⛔ Ao dividir um rename em dois commits, confira o que cada um mostra na tela: quem revisa commit a commit lê o estado intermediário como sobra. A ordem que evita isso põe o visível primeiro (a copy com a palavra final, depois o contrato, sem tocar rótulo nem URL). Escolhendo a outra ordem, diga no corpo do PR o que o commit do meio exibe.
