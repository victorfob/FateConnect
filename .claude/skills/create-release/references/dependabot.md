# PRs de versão do Dependabot

## Mergear

- A `develop` exige a branch em dia e a aprovação de alguém que não fez o último push. Quem atualiza o PR é o próprio Dependabot (`@dependabot rebase`): o "Update branch" do site ou um commit com a conta do dono o tira de aprovador.
- Um por vez: rebase, CI verde, aprovação, squash. Cada merge deixa os outros para trás.
- No PR de grupo, `@dependabot recreate`: o `rebase` pode ficar sem resposta nenhuma.
- Corrigir o PR dele (teste que a versão nova quebra) é um commit em cima da branch: ele para de rebasear, e a branch passa a ser de quem empurrou.

## O verde que não testa

PR que só mexe em `.github/` não alcança o recorte de caminho dos checks: os jobs que usam a action nova são pulados e o check sai verde. A prova vem no primeiro PR de front depois do merge e no deploy de homologação.

## Antes de recomendar o merge

- **O que o pacote exige:** a dependência declarada (`peerDependencies` no npm, `dependencyGroups` do NuGet) contra o que o projeto tem. Transitiva arrasta major sem aparecer no título: o `MassTransit.EntityFrameworkCore` 8.5 exige o EF Core 9 no .NET 8, e o grupo de minor e patch o trouxe junto.
- **O que sobe junto:** pacote cuja família precisa da mesma versão (o `vitest` com o `@vitest/coverage-v8`, o EF Core com o Npgsql) sobe num PR só. O Dependabot sobe um e o CI quebra com versões misturadas: feche e suba a família.
- **Licença:** major pode virar comercial (o MassTransit 9 exige licença).
- O que não dá para subir se ignora; o que quebra só teste, sobe com o teste corrigido.

## O que ele não sobe

O `.nvmrc` fica de fora: release de segurança do Node se acompanha à mão. A mais nova da linha em uso:

```bash
major=$(cut -d. -f1 FateConnect/Web/.nvmrc)
curl -s https://nodejs.org/dist/index.json | jq -r --arg major "v$major." '[.[] | select(.version | startswith($major)) | select(.security)][0].version'
```

Sobe o `.nvmrc` e o `engines` do front juntos; a imagem do build do front lê o mesmo arquivo.

## Ignorar

- Por comentário vale na hora: `@dependabot ignore this major version` num PR de uma dependência; no de grupo, `@dependabot ignore <dependência> major version` (ou `minor`). Desfaz com `@dependabot unignore <dependência>`.
- O `dependabot.yml` o GitHub lê na `main`: a regra escrita nele vale na release seguinte ao merge.
