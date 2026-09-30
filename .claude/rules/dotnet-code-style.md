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
- **Mensagem em `Modules/*/Exceptions/*.cs`** é copy que a pessoa lê: passa pela régua da skill `ux-writing`, com o mesmo texto que a tela usa.
- **Mudança em `Modules/*/Entities/**` que altera o dado coletado ou mostrado** reabre os termos e a política em `FateConnect/Web/legal/` (rule `legal-documents`).
- ⛔ **C# não leva comentário** (fora do gerado pelo EF): o `./scripts/check-csharp-comments.sh` reprova no `pre-commit` e no `check-api`, e a explicação vai no nome, no PR ou na issue.

## O analisador roda no build

- **Na API, achado do SonarAnalyzer é erro de build** (`TreatWarningsAsErrors`); no projeto de testes ele só avisa. Corrija; o improcedente se responde com `#pragma warning disable` + motivo, ou no corpo do PR.
- ⛔ **S107 só a análise do PR acusa:** construtor ou método com mais de 7 parâmetros passa na build local. Conte antes de acrescentar; as saídas são um record (`UserContact`) ou um método chamado depois do construtor (`Ride.ChangeRepetition`).
- `Program` não vira `static` para o S1118: o `WebApplicationFactory<Program>` precisa dele. O construtor privado resolve.
- **A duplicação do Sonar conta identificador.** Módulo copiado do vizinho nomeia logs e parâmetros pelo domínio (`LogRideCreated`/`rideId`), não herda `LogRecordCreated`. O passo do Sonar roda depois dos testes: teste vermelho esconde o gate.
- Regra `IDExxxx` só reprova com a severidade declarada no `FateConnect/.editorconfig` (`= true:warning`). Sem isso, ela roda e não barra nada.
- **ImageSharp valida licença:** em Release a build exige `SIXLABORS_LICENSE` (o conteúdo inteiro do `.lic`, segredo do `.env` da VPS); localmente, `-p:SixLaborsLicenseFile=<caminho>`. O "License ID" sozinho não é a chave.

## Forma

- `if` de uma instrução não leva chaves; a instrução vai na linha seguinte, indentada.
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

## Idioma

- Identificador, namespace, pasta e arquivo em inglês. Enum com **prefixo** `Enum` (`EnumRideType`); no front é sufixo, e a divergência não se corrige (o CA1711 reprova o sufixo aqui).
- ⛔ Mensagem que a pessoa lê (validação, exceção de domínio, erro do middleware) em pt-BR, com o mesmo texto da tela. `summary`/`description` do Swagger e template de `LoggerMessage` em inglês, e o log registra o tipo da exceção: nunca interpole a mensagem de produto nele.
