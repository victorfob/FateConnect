# Bloco `suggestion`

Leia antes de publicar qualquer comentário que leve, ou possa vir a levar, um bloco ` ```suggestion `.

## A faixa se decide na criação

⛔ **O bloco substitui exatamente as linhas ancoradas, e o `PATCH` de comentário de review só aceita o `body`.** Comentário nascido de linha única fica preso a uma linha para sempre; a saída seria apagar e repostar, o que só é barato enquanto ninguém respondeu. Decida a faixa antes de publicar, mesmo que ainda não vá sugerir.

```bash
gh api --method POST repos/<dono>/<repo>/pulls/<n>/comments \
  -f commit_id="$(gh pr view <n> --json headRefOid --jq .headRefOid)" \
  -f path="<caminho>" -F start_line=61 -F line=62 \
  -f side="RIGHT" -f start_side="RIGHT" -f body='...'
```

⛔ **A faixa cobre da primeira à última linha que o conserto toca**, não a que ilustra o argumento: uma correção que parecia de uma linha era a chamada, a linha em branco e o `SaveChangesAsync` que ela absorvia, e substituir só as duas primeiras duplicaria a chamada com um clique.

## Compile antes de publicar

⛔ **O conteúdo do bloco entra na branch como está escrito, sem ninguém reler.** Sugestão que não compila é defeito entregue por quem revisa, com a autoridade de quem apontou o problema.

⚠️ **A correção parcial é a que quebra.** Removendo um de dois `!`, o outro fica redundante, e redundante é erro aqui (`S8969` com `TreatWarningsAsErrors`).

**A bancada:**

1. worktree no head do PR (`git fetch origin pull/<n>/head`);
2. build de linha de base **primeiro**, senão uma falha depois não distingue a sua sugestão do que já estava quebrado;
3. aplicar, confirmar com `cmp -s` que o arquivo mudou, e construir;
4. o corpo do comentário sai do arquivo que passou no build, não do rascunho.

Diga no comentário em que ambiente compilou (o SDK que o `global.json` fixa, com `dotnet --version`).

## Compilar não cobre a borda

⛔ **Sugestão pode compilar e estourar no driver.** Ex.: o Npgsql recusa `DateTime` com `Kind` incompatível com a coluna (`timestamp without time zone` reprova `Kind=Utc`). O que libera é comparar a forma sugerida com a atual na dimensão que a outra camada inspeciona: tipo, `Kind`, encoding, precisão, nulidade. Se diferirem, o build segue verde e a gravação quebra em produção.
