# FateConnect — API

API do FateConnect em .NET 8, com PostgreSQL pelo Entity Framework Core e RabbitMQ pelo MassTransit.

Estrutura do repositório, fluxo de trabalho, integração contínua e a versão do projeto, que mora no `package.json` da raiz, estão no [README da raiz](../../README.md).

## Requisitos

- **SDK do .NET 8**, da faixa 8.0.400 ou mais nova: o `global.json` da raiz recusa as anteriores
- **Docker**, para o banco e a fila na sua máquina e para a suíte de testes

## Começando

```bash
cp .env.example .env
dotnet run
```

A API não sobe sem as variáveis obrigatórias, e o erro diz qual faltou. O valor de cada uma na sua máquina, e os contêineres do banco e da fila, estão no [CONTRIBUTING](../../CONTRIBUTING.md#rodar-o-projeto-na-sua-máquina).

Ela responde em `http://localhost:5011`. Na primeira subida, cria o banco e as tabelas.

| Rota | O que é |
| --- | --- |
| `/scalar/v1` | a referência das rotas, aberta sem login |
| `/swagger/v1/swagger.json` | o documento OpenAPI que a referência lê |
| `/health` | a saúde da API: `503` quando o banco não responde |
| `/hubs/notifications` | o canal de tempo real das notificações (SignalR) |

## Comandos

Da raiz do repositório:

| Comando | O que faz |
| --- | --- |
| `dotnet build FateConnect/FateConnect.Api/FateConnect.Api.sln` | compila a API e os testes; na API, achado de estilo reprova |
| `dotnet test FateConnect/FateConnect.Api/FateConnect.Api.sln` | roda a suíte, com o Docker de pé |

## Estrutura

```
Program.cs           registro de serviços e pipeline HTTP
Infrastructure/
  Configuration/     variáveis obrigatórias, lidas na subida
  Database/          DbContext e a migration
  Middlewares/       tratamento global de exceção
  Observability/     Sentry e a resposta do /health
  OpenApi/           documento OpenAPI e referência das rotas
  Converters/        conversores de JSON (data e hora)
  Validation/        atributos de validação dos DTOs
Modules/             um módulo por domínio
  Auth/  Common/  Emails/  InAppNotifications/  LostAndFound/  Reports/  Rides/  Storage/  Users/
```

Cada módulo repete as mesmas pastas, usando só as que precisa: `Controllers/`, `DTOs/`, `Entities/`, `Enums/`, `Exceptions/`, `Infrastructure/` (o mapeamento das entidades no banco), `Interfaces/`, `Repositories/` e `Services/`. O `Common/` guarda o que mais de um módulo usa.

Os testes ficam em `../FateConnect.Api.Tests/`, pasta irmã e não filha, com uma pasta por módulo e as peças compartilhadas em `Fixtures/`.

## Convenções

- **Sem comentário em C#.** O `pre-commit` e o CI reprovam `//` e `/* */` em `.cs`, fora dos arquivos gerados: o nome do símbolo é que explica o código.
- **O estilo reprova o build da API.** As regras do `.editorconfig` e do SonarAnalyzer valem como erro, então o código que compila já passou pela análise. No projeto de testes elas só avisam, mas o Sonar do PR cobra igual.
- **O contrato é o documento OpenAPI.** O CI passa o documento gerado pelo Spectral, com as regras de `.spectral.yaml`, e reprova o que fugir delas.

As demais estão nas regras do projeto, em `.claude/rules/`.

## Banco

O esquema mora numa migration só, `InitialCreate`, em `Infrastructure/Database/Migrations/`. Antes de gerar ou alterar migration, leia `.claude/rules/dotnet-migrations.md`: o `dotnet ef` precisa de valores falsos para as variáveis obrigatórias, e o gerador troca rename por drop e create.

## Testes

xUnit, com a API inteira em memória pelo `WebApplicationFactory` (`Fixtures/ApiFactory.cs`) e um PostgreSQL 17 de verdade num contêiner do Testcontainers. Consulta que o PostgreSQL não traduz quebra o teste, e não a produção. Por isso a suíte precisa do Docker de pé, inclusive no `git push`, que roda o `pre-push`.

## Automação

| Onde | O que roda |
| --- | --- |
| `pre-commit` | a checagem de comentário em `.cs` e a build da API, quando o que está preparado mexe na pasta dela |
| `pre-push` | a suíte da API, quando o envio mexe na pasta dela |
| CI (no PR) | build, suíte com cobertura, Sonar e o lint do documento OpenAPI |
