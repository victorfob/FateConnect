---
description: Como escrever C# novo aqui — o controller só orquestra, e condição que não se lê sozinha ganha nome antes do `if`
paths:
  - "FateConnect/FateConnect.Api/**"
  - "FateConnect/FateConnect.Api.Tests/**"
---

# Escrita de C#

## `if` de uma instrução não leva chaves

Corpo com uma instrução só dispensa as chaves, e a instrução vai na linha seguinte, indentada. É o que o código já faz:

```csharp
if (areCredentialsInvalid)
    throw new InvalidCredentialsException();

if (dtos is null or { Count: 0 })
    return [];
```

## O controller só orquestra

⛔ **Nada de método auxiliar no corpo do controller.** Ele recebe a requisição, chama o serviço e devolve o resultado. O que ele precisar além disso vira **extension** ou vai para o serviço.

O sinal é um `private` dentro do controller. Quando o segundo controller precisar da mesma coisa, esse método é copiado — e a duplicação nasce antes de alguém notar.

Cobrado no review do PR #201: o `RidesController` carregava um `private int GetCurrentUserId()` que lia o claim de identidade. Virou `ClaimsPrincipalExtensions.GetUserId()`, e as cinco chamadas passaram a ser `User.GetUserId()`.

**A extension mora no módulo dono do conceito, não em `Common`.** `GetUserId` ficou em `Modules/Auth/Extensions/` porque é `Auth` quem escreve o claim, no `TokenService`, e quem declara a exceção que ela lança. Em `Common` ela faria o único módulo que não depende de ninguém passar a depender de `Auth`.

## Condição que não se lê sozinha ganha nome

⛔ **Condição que exige decifrar vira variável nomeada antes do `if`.** Vale principalmente para `TryParse` e parentes, em que o `out` no meio da expressão esconde o que está sendo testado.

Assim:

```csharp
bool isValidUserId = int.TryParse(identifier, CultureInfo.InvariantCulture, out int userId);

if (!isValidUserId)
    throw new UnidentifiedUserException();
```

Não assim:

```csharp
if (!int.TryParse(identifier, CultureInfo.InvariantCulture, out int userId))
    throw new UnidentifiedUserException();
```

⚠️ **Condição que já se lê não ganha linha.** `if (ride is null)` e `if (!isValidUserId)` ficam como estão — a regra é sobre expressão que esconde o teste, não sobre proibir condição no `if`.

## Rename atinge mais do que o identificador alvo

⛔ **Substituição em lote acerta o que você não pediu, e nenhum gate reclama.** Depois de qualquer rename mecânico, procure separadamente as três formas de estrago — todas pagas na #222, todas com a build verde:

**1. Colisão com símbolo importado.** `GerarHashDaSenha` só encaminhava para o `HashPassword` do BCrypt, que entra por `using static`. Renomeado para `HashPassword`, o método passou a chamar **a si mesmo** — recursão infinita que compila. Antes de renomear, procure o nome novo entre os símbolos que o arquivo importa: `using static` traz nome sem qualificador, e o método local vence a resolução.

**2. Dentro de string literal.** `Senha` → `Password` transformou `"SenhaForte123!"` em `"PasswordForte123!"` em seis lugares, dois deles `[DefaultValue]` que o Swagger exibe.

**3. No meio de outra palavra.** `cep` → `zipCode` transformou `IsAccepted` em `IsAczipCodeted` (`IsA` + `cep` + `ted`) em dois nomes de teste. ⛔ **Este é o pior**: compila, o xunit ignora o nome do método, e os 42 testes passaram verdes com o nome corrompido.

⚠️ **O risco se concentra na substituição minúscula e curta.** Trocar identificador **capitalizado** é quase seguro — `Cep` com maiúscula raramente cai no meio de uma palavra. Foi o que salvou os quatro PRs anteriores da mesma sequência.

**O detector precisa ser o certo, senão ninguém o usa duas vezes.** Procurar o termo "colado a letra dos dois lados" devolve dezenas de camelCase legítimo (`isZipCodeFilled`, `mappedAddresses`); procurar o termo **seguido** de minúscula acusa todo plural (`Users`, `Addresses`). O que discrimina é **termo minúsculo precedido de letra minúscula** — fronteira que camelCase nunca produz.

```bash
git diff <base>..HEAD | grep -E "^\+" | grep -oE '"[^"]*<termo-novo>[^"]*"'   # dentro de aspas
```

## A rota do controller vem do nome da classe

⛔ **`[Route("[controller]")]`, nunca string literal.** É o que `RidesController`, `UsersController` e `AuthController` fazem, e é de onde saem `/Rides`, `/Users` e `/Auth`, com a inicial maiúscula.

O roteamento do ASP.NET é case-insensitive, então `/users/signup` também resolve — o que muda é o endereço que o Swagger publica. Decidido em 30/08/2026, ao levar o controller de usuários para inglês: a issue tinha especificado `/users/signup` e ficou `/Users/signup`, pela simetria com `Rides`.
