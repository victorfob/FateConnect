---
description: Como escrever C# novo aqui — o controller só orquestra, e condição que não se lê sozinha ganha nome antes do `if`
paths:
  - "FateConnect/FateConnect.Api/**"
  - "FateConnect/FateConnect.Api.Tests/**"
---

# Escrita de C#

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
