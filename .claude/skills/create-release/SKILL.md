---
name: create-release
description: >-
  Corta uma release do FateConnect — escolhe a versão, sobe os bumps, fecha a seção do CHANGELOG
  e abre o PR para a `main`. Use quando o usuário pedir para criar, cortar, publicar ou preparar
  uma release, ou uma versão nova. Cobre as validações que o CI faz antes de você, o que a
  automação faz sozinha depois do merge.
---

# Cortar uma release

A release entra pela `main`, e o merge dispara três automações de uma vez. O preparo é seu; o resto acontece sozinho, e saber o que é qual evita refazer à mão o que já foi feito.

## O que acontece sozinho no merge

Saber isto muda o que você precisa fazer à mão. O `release.yml` dispara em todo push na `main` e roda três jobs **independentes**:

| Job | O que faz |
| --- | --- |
| `tag` | cria a tag anotada `vX.Y.Z` a partir do `package.json` da **raiz** |
| `publish` | constrói e publica em produção, pelo mesmo `publish.yml` da homologação |
| `back-merge` | traz a `main` de volta para a `develop` |

⚠️ **Mergear é publicar** — o `publish` sobe para produção sozinho, sem portão de aprovação. O que for conferir, confira antes do merge.

## 1. Ver se há o que publicar, e o quê

```bash
git fetch origin
git rev-list --count origin/main..origin/develop     # zero = nada a publicar
grep -c '^- ' CHANGELOG.md                            # entradas acumuladas
```

Leia a seção `## [Unreleased]` inteira. Ela é a release: se estiver vazia, não há release, por mais commits que existam — refactor e ajuste de CI não entram no changelog e não justificam versão.

⚠️ **Olhe o que vai ao ar, não só o que mudou.** Funcionalidade entregue no front contra API que não existe vai para produção quebrada. Isso não impede a release, mas o usuário precisa saber antes, não depois.

## 2. Escolher a versão

Em `0.x`, funcionalidade nova é **minor** — `0.2.0 → 0.3.0`. Só correção é **patch**.

⛔ **A versão do projeto é a do `package.json` da raiz, e só ela.** É o que o `check.yml`, o `release.yml` e o `publish.yml` leem:

```bash
grep -rn 'jq -r .version' .github/workflows/
```

O `check.yml` **reprova o PR para a `main`** se a tag `vX.Y.Z` já existir. Confira antes de abrir:

```bash
git ls-remote --tags origin "refs/tags/v<versão>"     # tem que voltar vazio
```

## 3. Subir os bumps

A da raiz sobe **sempre**. As outras sobem **só se aquele lado mudou** — versão que anda sem o código ter andado é ruído, e some a informação de "esta versão é diferente da anterior".

⛔ **Decida pelo diff, não pela memória.** Compare a `main` com a `develop`, **antes** dos commits da própria release, senão o bump que você acabou de fazer conta como mudança e a resposta é sempre "sim":

```bash
git fetch origin
git diff --name-only origin/main..origin/develop -- FateConnect/Web | head -1
git diff --name-only origin/main..origin/develop -- FateConnect/FateConnect.Api FateConnect/Carona | head -1
```

| Onde | Sobe quando |
| --- | --- |
| `package.json` da raiz | **sempre** — é a versão da release e vira a tag |
| `FateConnect/Web/package.json` | houve mudança em `FateConnect/Web/` |
| `FateConnect/FateConnect.Api/FateConnect.Api.csproj` | houve mudança em `FateConnect/FateConnect.Api/` |
| `FateConnect/Carona/Directory.Build.props` | houve mudança em `FateConnect/Carona/` — cobre os projetos da pasta |

⚠️ **As duas APIs versionam separado**, porque sobem como contêineres separados. Mudança só em caronas não move a versão da API de contas.

Uma pista rápida do que cada lado recebeu: as entradas do `Unreleased` terminam em `[Frontend]` ou `[Backend]`. É indício, não prova — refactor e correção de infraestrutura não aparecem no changelog e mesmo assim mudam o código.

⚠️ **Só a da raiz é lida por alguma coisa.** As outras três não alimentam build, tag nem Sentry — existem para o artefato não mentir sobre si. Saber disso evita duas coisas: tratar um bump esquecido como incidente, e supor que mexer nelas afeta a publicação.

Depois de tocar `.csproj` ou `Directory.Build.props`, **confirme que o número chegou** e que o build passa:

```bash
dotnet msbuild <projeto>.csproj -getProperty:Version
dotnet build -v q --nologo
```

## 4. Cortar o CHANGELOG

`## [Unreleased]` vira `## [X.Y.Z] - AAAA-MM-DD`, e um `## [Unreleased]` **vazio** nasce por cima. Não há links de comparação no rodapé deste arquivo — não invente.

### Um commit só

⛔ **O bump e o corte do CHANGELOG saem no mesmo commit.** Os dois passos acima são um assunto — *cortar a versão X.Y.Z* — e a release é onde o histórico tem que ser mínimo: quem revisa quer ver o número mudando, não a sequência que o produziu.

Quando a branch de release levar correção junto — esteira, configuração —, ela é **um** commit e o corte é o outro. Dois é o teto.

## 5. Abrir o PR

Branch `release/X.Y.Z` a partir da `develop`, PR **para a `main`** pela skill `pr-creator`.

Mudança feita na branch de release chega à `develop` pelo `back-merge` — é o caminho legítimo para o que é de escopo de release. Não é desculpa para levar feature junto.

## 6. Depois do merge

```bash
git ls-remote --tags origin | grep "v<versão>"    # a tag saiu?
gh run list --branch main --limit 1               # os três jobs?
```

E confira que a `develop` recebeu o back-merge: `git rev-list --count origin/develop..origin/main` tem que ser **zero**.

## Armadilhas já pagas

| Sintoma | Causa |
| --- | --- |
| O PR para a `main` é reprovado no passo `Version` | a versão da raiz já tem tag — faltou o bump |
| Um bump ficou para trás e ninguém notou | só a versão da raiz é lida; as outras não quebram nada ao divergir |
