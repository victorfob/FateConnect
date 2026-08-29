# Como contribuir

Obrigado pelo interesse. Este é um projeto acadêmico, e o fluxo aqui é simples — mas tem convenções próprias, e vale ler estas duas páginas antes de abrir a primeira mudança.

O **[README](README.md)** é a referência completa: estrutura das pastas, regras de idioma, versionamento, integração contínua. Este arquivo é o caminho curto de quem vai contribuir, e não repete o que está lá.

## Antes de escrever código

**Abra uma issue primeiro.** O número dela alimenta o nome da branch, o título e o corpo do PR — sem ele, o rastro se perde. Se a mudança já tem issue, comente nela dizendo que vai pegar, para ninguém trabalhar em dobro.

Issues são escritas em **pt-BR**: elas são documento de planejamento, não código.

## Ambiente

O front vive em `FateConnect/Web` e usa a versão do Node declarada no `.nvmrc`, com Yarn 1.x:

```bash
cd FateConnect/Web && nvm use && yarn && yarn dev
```

Os hooks locais **não vêm habilitados no clone** — o repositório usa `core.hooksPath` em vez de um gerenciador de hooks, para não desligar os hooks do Git LFS. Habilite uma vez:

```bash
git config core.hooksPath .githooks
```

O `pre-push` roda só os testes relacionados aos arquivos enviados. A suíte inteira com cobertura fica no CI.

## Branch e commit

Branch sai da **`develop`**, nomeada `<tipo>/<número-da-issue>` — `feat/56`, `fix/171`, `chore/48`. Sem issue, um slug descritivo.

Mensagem de commit em **inglês**, no imperativo, seguindo [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add the pagination control
fix: correct the email field validation
docs: update the setup guide
```

**Uma mudança lógica por commit** — mas agrupar é metade da regra. Se dois commits descrevem o mesmo assunto para quem lê o histórico, são um só. Dividir demais custa tanto quanto juntar tudo.

## Pull Request

PR aponta para a **`develop`**. Título em **inglês**, no formato `tipo(número-da-issue): descrição curta`. A **descrição** é o único texto do fluxo git em pt-BR, e segue o modelo que aparece ao abrir o PR: objetivo, alterações, issue e evidências.

Antes de pedir review, rode os mesmos portões que o CI roda:

```bash
cd FateConnect/Web && yarn lint && yarn typecheck && yarn test:ci
```

Mexeu na API, compile e rode a suíte dela — a compilação é portão à parte, e reprova por aviso:

```bash
dotnet build FateConnect/FateConnect.Api/FateConnect.Api.sln
dotnet test FateConnect/FateConnect.Api/FateConnect.Api.sln --no-build
```

Aviso reprova nos dois lados: o lint do front roda com `--max-warnings=0`, e o `.csproj` da API liga `TreatWarningsAsErrors`.

## Mudança que o usuário percebe entra no CHANGELOG

Tela nova, comportamento diferente, defeito corrigido — vai para a seção `## [Unreleased]` do [CHANGELOG.md](CHANGELOG.md), como **uma** entrada que descreve o efeito, terminando no número do PR.

O que não muda comportamento — refactor interno, ajuste de teste, configuração de lint — fica só no histórico de commit.

## Código

Os padrões do front estão em `.claude/rules/`, e valem para quem escreve à mão tanto quanto para um agente de código: comentário só quando for estritamente essencial, nada de estilo inline, tipos e componentes em arquivos próprios, teste consultando por papel de acessibilidade.

Antes de criar componente, hook ou utilitário, **procure o que já existe** — buscando pelo comportamento, não pelo nome. Se achar algo parecido mas não igual, proponha unificar em vez de criar a segunda cópia.

## Segurança

Encontrou uma vulnerabilidade? **Não abra issue.** O caminho está em [SECURITY.md](SECURITY.md).

## Convivência

Participar daqui implica seguir o [Código de Conduta](CODE_OF_CONDUCT.md).
