---
description: Como escrever C# aqui — sem comentário, o analisador que roda no build, controller que só orquestra, condição com nome, idioma, DTO de entrada, e os gatilhos que levam às rules de teste, migration, copy e documento legal
paths:
  - "FateConnect/FateConnect.Api/**"
  - "FateConnect/FateConnect.Api.Tests/**"
---

# Escrita de C#

## Gatilhos: o que a mudança leva junto

- **Código novo sai com ≥90% de cobertura**, medida por `./scripts/coverage-changed.sh` rodado **depois de commitar**; se a contagem de arquivos não bate com o que você mexeu, a medida está errada. O portão do Sonar é mais baixo de propósito (detalhe na `dotnet-testing`, que carrega ao abrir `FateConnect.Api.Tests/`).
- **Mudou entidade ou configuração do EF:** a migration gerada pode dropar em vez de renomear; leia o `Up()` antes de tudo (a `dotnet-migrations` carrega ao abrir `Infrastructure/Database/`).
- **Mensagem em `Modules/*/Exceptions/*.cs`** sai no `detail` do erro, em inglês, e nenhuma tela a mostra: a copy que a pessoa lê, cada tela escreve. Ao mudá-la, procure nos testes cada frase do texto antigo, não só o começo: `Assert.EndsWith` guarda o fim.
- **Mudança em `Modules/*/Entities/**` que altera o dado coletado ou mostrado** reabre os termos e a política em `FateConnect/Web/legal/` (rule `legal-documents`).
- ⛔ **C# não leva comentário** (fora do gerado pelo EF): o `./scripts/check-csharp-comments.sh` reprova no `pre-commit` e no `check-api`, e a explicação vai no nome, no PR ou na issue.

## O analisador roda no build

- **Na API, achado do SonarAnalyzer é erro de build** (`TreatWarningsAsErrors`); no projeto de testes ele só avisa. Corrija; o improcedente se responde com `#pragma warning disable` + motivo, ou no corpo do PR.
- ⛔ **O aviso do projeto de testes o Sonar do PR cobra igual.** Antes do push, zere os do arquivo novo (`dotnet build … | grep '<Arquivo>.*warning'`): corrigido depois da aprovação, o push a derruba.
- ⛔ **S107 só a análise do PR acusa:** construtor ou método com mais de 7 parâmetros passa na build local. Conte antes de acrescentar; as saídas são um record (`UserContact`) ou um método chamado depois do construtor (`Ride.ChangeRepetition`).
- `Program` não vira `static` para o S1118: o `WebApplicationFactory<Program>` precisa dele. O construtor privado resolve.
- **A duplicação do Sonar conta identificador.** Módulo copiado do vizinho nomeia logs e parâmetros pelo domínio (`LogRideCreated`/`rideId`), não herda `LogRecordCreated`. O passo do Sonar roda depois dos testes: teste vermelho esconde o gate.
- Regra `IDExxxx` só reprova com a severidade declarada no `FateConnect/.editorconfig` (`= true:warning`). Sem isso, ela roda e não barra nada.
- ⛔ **A imagem da API compila com o contexto `FateConnect/`** (`deploy/docker-compose.yml`), para ler o mesmo `.editorconfig` do CI: com o contexto na pasta da API, a migration com array reprova o deploy no CA1861.
- **ImageSharp valida licença:** em Release a build exige `SIXLABORS_LICENSE` (o conteúdo inteiro do `.lic`, segredo do `.env` da VPS); localmente, `-p:SixLaborsLicenseFile=<caminho>`. O "License ID" sozinho não é a chave.

## Mensageria

- ⛔ **Com o bus outbox, o `Publish` vem antes do `SaveChanges` que o grava:** publicado depois do último `SaveChanges`, o evento nunca sai. Repositório cujo `AddAsync` já salva recebe o `Publish` antes da chamada (`RideService.CreateAsync`).
- ⛔ **Entidade com `Id` de identidade não tem o `Id` antes de salvar:** o EF não o escreve na propriedade, e o evento sai com `0`. Salve, publique e salve de novo (`InAppNotificationService.NotifyAsync`).
- ⛔ **Evento que leva código de link ou dado pessoal descarta a falha:** esgotadas as tentativas, o MassTransit guarda o corpo inteiro na fila `_error`, sem prazo. O `DiscardFaultedMessages()` mora numa `ConsumerDefinition` (`AccountEmailConsumerDefinition`), não no `UsingRabbitMq`, que o harness dos testes nunca executa. A prova é o `GetProbeResult` da `ApiFactory`: `discardFault` contra `moveFault` (`AccountEmailFaultTests`).

## Forma

- `if` de uma instrução não leva chaves; a instrução vai na linha seguinte, indentada.
- O build reprova o `using` fora do lugar (IDE0065) e o namespace diferente da pasta (IDE0130), mas não a ordem: `System` primeiro se ajusta com `dotnet format style <csproj> --include <arquivos>`. O arquivo que o IDE0065 converte perde a linha em branco depois do `namespace`.
- `Infrastructure/` se divide por assunto (`Database`, `Middlewares`, `Validation`, `Observability`), com a interface ao lado da implementação; a quebra em `Interfaces/`, `Services/` e `Extensions/` é dos `Modules/`.
- ⛔ **O controller só orquestra.** Nada de `private` nele: o auxiliar vira extension no módulo dono do conceito (`Modules/Auth/Extensions/ClaimsPrincipalExtensions.cs`, `GetUserId`), não em `Common`.
- ⛔ **Outra camada precisa de algo `private`? Exponha o método que responde, não o dado** (`DateTimeUtils.NowInProductTimeZone`, `ToUtcFromProductTimeZone`). O tell é tornar público um `private` para atender um consumidor; extrair para arquivo novo reabre essa decisão.
- `[Route("[controller]")]`, daí `/Rides`, `/Users` e `/Auth` com maiúscula. Rota que vem de constante do domínio (`UploadsController`, `UploadsLocation.FolderName`) é a exceção.

## Condição que não se lê sozinha ganha nome

⛔ Expressão que esconde o teste vira variável antes do `if`, e o nome cobre **todos** os operandos, não o mais fácil. Condição que já se lê (`if (ride is null)`) fica como está.

✅ O `TryParse` sai do `if`, e a disjunção inteira ganha o nome (❌ nomear só `phoneRepeatedInRequest` e deixar a consulta crua no `if`):

```csharp
bool isValidUserId = int.TryParse(identifier, CultureInfo.InvariantCulture, out int userId);

bool phoneRepeatedInRequest = !phonesInRequest.Add(dto.Phone);
bool phoneIsTaken = phoneRepeatedInRequest || await _userRepository.ContactPhoneExistsAsync(dto.Phone);
```

Subir o `||` para a atribuição não gasta consulta: o curto-circuito é do operador.

O `return` de uma expressão montada (coleção com LINQ, objeto com campo calculado) também ganha nome antes de sair: `statusOfEachCurrentDocument` no `LegalDocumentService.GetStatusAsync`. Variável, chamada simples e literal saem direto.

⛔ **Dentro de `IQueryable`, o nome é `Expression<Func<T, bool>>`**: variável `bool` no lambda não compila, e método `bool` comum quebra em runtime (`could not be translated`). Veja `HasAnUpcomingDeparture` no `RideRepository`. Nomeie o conceito inteiro, não as metades.

## Rename mecânico acerta o que você não pediu

Depois de qualquer substituição em lote, procure as três formas de estrago, que compilam verdes:

- o nome novo colidindo com símbolo de `using static` (o método passa a chamar a si mesmo);
- o termo dentro de string literal (`git diff <base>..HEAD | grep -E "^\+" | grep -oE '"[^"]*<termo>[^"]*"'`);
- o termo no meio de outra palavra: procure o termo minúsculo **precedido de letra minúscula**, fronteira que camelCase nunca produz.

## DTO de entrada

- Tipo-valor cuja ausência é válida é `int?`, não `required`: o `required` passa no S6964 mas torna o campo obrigatório.
- ⛔ Propriedade derivada leva `[BindNever]`, senão vira parâmetro no Swagger (como em `PagedFilterDto` e `DateRangeFilterDto`). Só aparece lendo o `swagger.json`.
- ⛔ **String vazia chega como `null`**, e "limpar o campo" vira "não mexer". Campo que pode ser esvaziado de propósito leva `[DisplayFormat(ConvertEmptyStringToNull = false)]` (`UpdateLostAndFoundDto`, `UpdateUserDto`); campo obrigatório, não. O tell é a entidade decidir por `is not null`.
- `[RegularExpression]` casa a string inteira: ancore `^…$`. Duas checagens com mensagens diferentes no mesmo campo viram um `ValidationAttribute` próprio (`Infrastructure/Validation/FatecEmailAttribute.cs`), e a ordem dos `if` decide a mensagem; trave-a com teste.
- ⛔ Coluna que passa a aceitar nulo: procure antes os DTOs de leitura que a devolvem. Nunca feche o tipo com `?? string.Empty`.

## Documento OpenAPI

O passo `OpenAPI lint` do `check-api.yml` roda o Spectral (`FateConnect.Api/.spectral.yaml`) no documento que a suíte grava, e reprova o que faltar:

- Operação leva `[SwaggerOperation]` com `OperationId`, `Summary` e `Description`, e cada resposta que devolve em `ProducesResponseType`. O 401, o 403 de `[AuthorizeProfile]` e o 400 de quem recebe corpo ou query vêm dos filtros de `Infrastructure/OpenApi/`.
- ⛔ Declarar um erro tira a dedução do 200: a operação com `ActionResult<T>` declara o 200 junto, com o tipo.
- Propriedade leva `[SwaggerSchema]` (no DTO de query, `[SwaggerParameter]`), e a do corpo de requisição leva `[SchemaExample]`. ⛔ `[DefaultValue]` é o padrão que a API aplica, não exemplo: como exemplo, o documento diria que o e-mail padrão do login é o do exemplo.
- ⛔ Propriedade que só o código lê se implementa explícita na interface (`IWaivesContact.WaivesContact`): o `[BindNever]` não a tira do formulário multipart no documento.
- Descrição e exemplo não repetem valor que tem fonte na aplicação: o limite que o atributo de validação já publica no schema (`StringLength`, `MinLength`, `Range`), o número de constante (tentativas de login, minutos de espera), a versão vigente dos documentos legais (o exemplo a lê pelo `CurrentLegalDocumentsExampleFilter`). A cópia envelhece quando o original muda; atributo só aceita constante, e o valor lido em execução vai por filtro de schema.

## Idioma

- Identificador, namespace, pasta e arquivo em inglês. Enum com **prefixo** `Enum` (`EnumRideType`); no front é sufixo, e a divergência não se corrige (o CA1711 reprova o sufixo aqui).
- ⛔ A API fala inglês inteira: mensagem de validação, de exceção e do middleware, `summary`/`description` e exemplo do Swagger, e template de `LoggerMessage`. Fica em pt-BR o que chega à pessoa por outro caminho, os e-mails (`Modules/Emails/Templates/`) e o texto das notificações (`NotificationContents`), e o comentário de qualquer arquivo (o `.spectral.yaml` inclusive; a `description` da regra, que sai na saída do Spectral, é inglês). O log registra o tipo da exceção: nunca interpole a mensagem nele.
- Todo `LoggerMessage` declara `EventId`, contínuo dentro da classe: removido um log que ainda não saiu em release, renumere os seguintes. O usuário aparece como `User ID {UserId}` (`user ID` no meio da frase).
- ⛔ Log carrega id, nunca e-mail, senha, token ou o texto que a pessoa digitou; sem id (e-mail sem conta), registra só o fato.
- ⛔ O `HttpClient` registra a URL inteira de cada pedido em `Information`, o nível de hml e produção: cliente que chama URL que identifica pessoa ou aparelho (o do push) leva `RemoveAllLoggers()`, com teste que procura a URL no log e o par com um cliente sem o filtro.
