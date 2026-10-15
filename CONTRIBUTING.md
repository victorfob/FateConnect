# Como contribuir

Obrigado pelo interesse. Este é um projeto acadêmico, e o fluxo aqui é simples — mas tem convenções próprias, e vale ler estas duas páginas antes de abrir a primeira mudança.

O **[README](README.md)** é a referência completa: estrutura das pastas, regras de idioma, versionamento, integração contínua. Este arquivo é o caminho curto de quem vai contribuir, e não repete o que está lá.

## Antes de escrever código

**Abra uma issue primeiro.** O número dela alimenta o nome da branch, o título e o corpo do PR — sem ele, o rastro se perde. Se a mudança já tem issue, comente nela dizendo que vai pegar, para ninguém trabalhar em dobro.

Issues são escritas em **pt-BR**: elas são documento de planejamento, não código.

## Rodar o projeto na sua máquina

As ferramentas: Git, Docker, o SDK do .NET 8 e o [nvm](https://github.com/nvm-sh/nvm), que instala o Node da versão do `FateConnect/Web/.nvmrc`. O Yarn 4 vem pelo Corepack, que acompanha o Node; o Yarn 1 instalado na máquina recusa o projeto.

O SDK precisa ser da faixa 8.0.400 ou mais nova, e o `global.json` recusa as anteriores: a análise de estilo, que reprova o build, muda de uma faixa para outra. O pacote do .NET que o Ubuntu traz é da faixa 8.0.100. O instalador da Microsoft traz a faixa certa:

```bash
curl -sSL https://dot.net/v1/dotnet-install.sh | bash -s -- --channel 8.0
export DOTNET_ROOT="$HOME/.dotnet" PATH="$HOME/.dotnet:$PATH"   # e no perfil do seu shell
```

### Banco e fila

A API usa PostgreSQL e RabbitMQ, e os dois sobem em contêiner:

```bash
docker run -d --name fateconnect-db -e POSTGRES_PASSWORD=fateconnect -p 5432:5432 postgres:17
docker run -d --name fateconnect-mq -p 5672:5672 rabbitmq:3-management
```

### API

```bash
cd FateConnect/FateConnect.Api
cp .env.example .env
```

A API não sobe sem as variáveis abaixo, e o erro diz qual faltou. As outras do `.env` podem ficar vazias: a fila cai no `localhost` com o usuário padrão do RabbitMQ, e o CORS libera o front em `http://localhost:5173`.

| Variável | Valor na sua máquina |
| --- | --- |
| `DB_CONNECTION` | `Host=localhost;Port=5432;Database=fateconnect;Username=postgres;Password=fateconnect` |
| `JWT_SECRET` | a saída de `openssl rand -base64 32` |
| `JWT_ISSUER`, `JWT_AUDIENCE` | qualquer texto, como `fateconnect` |
| `PUBLIC_URL` | `http://localhost:5173`, o endereço do front, de onde partem os links dos e-mails |
| `EMAIL_SENDER`, `RESEND_API_KEY` | o remetente e a chave do Resend; sem uma chave válida, qualquer texto serve e o e-mail não sai |
| `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY` | o par das notificações por push; sem testar push, qualquer texto serve, e o par de verdade sai de `npx web-push generate-vapid-keys`, com o Node do front instalado |

```bash
dotnet run
```

A API responde em `http://localhost:5011`, com a referência das rotas em `/scalar/v1`. Na primeira subida ela cria o banco e as tabelas.

### Front

Em outro terminal:

```bash
cd FateConnect/Web
nvm install && corepack enable && yarn
cp .env.example .env.development
```

No `.env.development`, `VITE_API_URL=http://localhost:5011`. Depois:

```bash
yarn dev
```

O front abre em `http://localhost:5173`.

### A primeira conta

Crie a conta pela tela de cadastro. O login exige o e-mail confirmado, e sem o Resend o link não chega: confirme a conta no banco.

```bash
docker exec fateconnect-db psql -U postgres -d fateconnect -c "UPDATE \"Users\" SET \"IsEmailConfirmed\" = true WHERE \"FatecEmail\" = 'a-sua-conta@aluno.cps.sp.gov.br';"
```

A área de gestão pede o perfil de administrador, que se dá pelo banco: veja [Promover alguém a administrador](deploy/DATABASE.md#promover-alguém-a-administrador).

### Hooks e testes

Os hooks locais **não vêm habilitados no clone** — o repositório usa `core.hooksPath` em vez de um gerenciador de hooks, para não desligar os hooks do Git LFS. Habilite uma vez:

```bash
git config core.hooksPath .githooks
```

O `pre-commit` conserta o que dá no front — `eslint --fix` e `prettier --write` sobre o que está preparado — e compila a API quando a mudança a alcança, que é a build por onde entra o SonarAnalyzer. O `pre-push` roda o recorte de testes do front relacionado ao que está sendo enviado e a suíte da API. A suíte inteira com cobertura fica no CI.

**A suíte da API precisa de Docker rodando.** Ela sobe um contêiner `postgres:17` e roda as consultas contra o banco de verdade, porque o filtro por destino usa funções do PostgreSQL e porque consulta que o Postgres não traduz precisa quebrar teste, não produção. Vale para `dotnet test` e, por tabela, para o `git push` que dispara o `pre-push`.

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
