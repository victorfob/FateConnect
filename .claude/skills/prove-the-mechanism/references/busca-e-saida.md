# Busca e saída de comando

O instrumento nasce cobrindo uma forma, e a resposta está na outra. O silêncio sobre a forma não lida se lê como ausência.

## Onde a busca não alcança

- **Truncar:** `grep … | head` some com a 11ª linha, e a saída parece completa. Em busca que sustenta conclusão, conte antes (`grep -c`) ou não trunque.
- **Texto de código mora em cinco formas:** string, template, regex literal (`/nome deve ter ao menos/i`), comentário e bloco de código (sem crase nenhuma — `csharp`, JSON, diagrama). Varredura que lê quatro responde com a mesma confiança sobre as quatro.
- **Caixa e acento:** `grep` casa literal. `onlyMyItems` não acha `OnlyMyItems`; `per[ií]odo` no locale C não alcança o `í` (dois bytes). Busca de presença ou contagem roda com `-i` e `LC_ALL=pt_BR.UTF-8`, e o controle é procurar um trecho que você sabe que existe.
- **Glob no zsh:** `--include=*.ts` sem aspas é expandido pelo shell, que aborta com `no matches found` e deixa na tela só o seu `echo`. Aspas no padrão (`--include='*.ts'`) e `echo "exit=$?"` logo depois.
- **`cd` que falhou:** em `cd X && grep …` o zero pode ser do diretório anterior. `pwd` na mesma saída.
- **Pedido visual não tem símbolo:** recuo, largura e alinhamento não se procuram por nome. Pergunte ao rastreador:

  ```bash
  gh issue list --state all --limit 300 --json number,title,state \
    --jq '.[] | select(.title | test("<termo>"; "i")) | "#\(.number) [\(.state)] \(.title)"'
  ```

## Saída que passa por wrapper

Wrapper de shell que reescreve saída (formato compacto, cabeçalho, resumo) mente de três jeitos. Conclusão se lê na saída crua: `git --no-pager diff --no-ext-diff`, `/usr/bin/grep`, o binário sem alias.

- **Engole:** `grep -E "^\+"` sobre diff reformatado dá 0. Contagem vem de `git diff --numstat`, que é machine-readable.
- **Conta no lugar de listar:** `N matches in 0 files` sem linha embaixo. O tell é a contagem discordar da listagem.
- **Infla:** `wc -l` conta cabeçalho e rodapé do wrapper. Conte na listagem.
- **Come a entrada:** flag curta com valor separado (`-v q`) pode perder o valor para o wrapper, e o comando roda sem argumento — falso vermelho. Escreva por extenso: `--verbosity quiet`.

## Comando que pode falhar

`git push | tail -2` deixa `failed to push some refs` sem o motivo. Comando que pode falhar vai sem filtro, ou com a saída inteira num arquivo; o `tail` entra depois, sobre o arquivo.

## Número prometido

Valor esperado entregue junto de um comando se obtém rodando aquele comando exato, e com `grep -n` para ver **quais** linhas casaram — o comentário que cita a diretiva conta como linha.
