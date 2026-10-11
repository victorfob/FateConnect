# CI e checks de PR

## Esperar

`all(.bucket != "pending")` sobre a lista que ainda enche é verdadeiro com um check só registrado. `length >= N` envelhece: o conjunto de checks depende do que o PR toca. **Nomeie o check que a espera existe para provar** — os nomes estão no `name:` dos jobs em `.github/workflows/`:

```bash
until gh pr checks <n> --json name,bucket \
  | jq -e 'any(.[]; .name == "<check exigido>") and all(.[]; .bucket != "pending")'; do sleep 20; done
```

## Relatar

- A lista só fica completa no fim: check cujo passo criador estava `skipped` aparece depois. Leia a lista inteira, sem `tail`.
- Nomeie cada bucket; o complemento de `pass` não é falha (`pending`, `skipping`, `neutral`):

  ```bash
  gh pr checks <n> --json name,bucket --jq '.[] | "\(.bucket)\t\(.name)"' | sort
  gh pr checks <n> --json name,bucket --jq 'group_by(.bucket)[] | "\(.[0].bucket)=\(length)"'
  ```

## Job vermelho

O job reporta o primeiro passo que caiu; os seguintes **não rodaram**, e o gate costuma ser o último. Quem discrimina é a lista de passos:

```bash
gh run view <run-id> --json jobs --jq '.jobs[].steps[] | "\(.conclusion)\t\(.name)"'
```

`skipped` depois de `failure` é passo que ninguém mediu.

## A suíte que o CI não rodou

- Job verde também se lê pelos passos: o filtro de caminhos pula build e testes e o job responde `success`. Sem um passo de teste `success` no head, nada se afirma sobre a suíte.
- Rode-a localmente no head, com a `develop` como controle: o que falha ou trava só no head é do PR.
- No macOS não há `timeout`. Suíte .NET que pode travar roda com `--blame-hang-timeout 3m` e `--logger trx`; quem não terminou é a diferença entre `dotnet test --list-tests` e os `testName` do `.trx`.

## Artefato entre jobs

- `actions/upload-artifact` nasce com `if-no-files-found: warn`: caminho errado sobe zero arquivo e o job fica verde, e quem quebra é o consumidor, longe da causa. Arquivo oculto (`.vitest-reports`) é ignorado sem `include-hidden-files: true`.
- Passo que transporta leva as duas guardas: `if-no-files-found: error` de um lado, e do outro contar o que chegou (um relatório por shard) antes de usar.
- Prova local não cobre o trajeto: localmente os dois passos leem o mesmo disco e o diretório sempre existe. Pergunte por onde o dado viaja e conte o que chegou.
