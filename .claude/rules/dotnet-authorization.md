---
description: Autorização da API .NET — as duas camadas que protegem um endpoint e onde o `[Authorize]` mora ao criar action ou controller novos.
paths:
  - FateConnect/FateConnect.Api/**
  - FateConnect/FateConnect.Api.Tests/**
---

# Autorização na API

## São duas camadas, e as duas ficam

| Camada | Onde | O que faz |
| --- | --- | --- |
| Piso | `Program.cs` — `SetFallbackPolicy(RequireAuthenticatedUser())` | vale onde o endpoint **não declarou nada**: endpoint novo nasce fechado |
| Explícito | `[Authorize]` | diz a regra no arquivo que quem lê abre |

⛔ **Nunca troque uma pela outra.** O atributo explícito documenta; a fallback policy protege o que alguém esqueceu de anotar. Sem o piso, o modo de falha volta a ser *esqueceu → aberto*, que é exatamente como os cinco endpoints de carona ficaram abertos para qualquer um com a URL até a #176.

⚠️ **Com `[Authorize]` explícito em todo endpoint, a suíte deixa de exercitar o piso** — todo endpoint testado passa pelo atributo. O piso segue valendo só para o endpoint que ninguém anotou, que por definição ainda não existe para ser testado. É o argumento de por que ele não sai, não de que ele é redundante.

## Onde o `[Authorize]` mora: onde a regra vale para todo mundo

⛔ **Endpoint novo nasce com `[Authorize]` explícito.** Não é o que protege — é o que faz a proteção aparecer para quem abre o controller em vez de ficar só no `Program.cs`. Pedido no review do #191.

O nível depende de o controller ser homogêneo ou misto, e são casos diferentes:

| Controller | Onde vai | Exemplo |
| --- | --- | --- |
| **Homogêneo** — toda action exige token | `[Authorize]` **na classe**, junto de `[ApiController]` e `[Route]` | `RidesController`: listar, ver, ofertar, editar e excluir |
| **Misto** — tem pelo menos uma action pública | `[Authorize]` **em cada action** protegida, `[AllowAnonymous]` na pública | `UsuarioController`: `cadastro` é anônimo, e o `PATCH` de configurações e preferências vai exigir token |

⛔ **Ao acrescentar a primeira action pública, o `[Authorize]` desce da classe para as actions.** Deixá-lo na classe com um `[AllowAnonymous]` embaixo afirma duas coisas contrárias no mesmo arquivo: funciona, mas quem lê o topo conclui errado sobre metade das actions.

Endpoint novo entra na teoria de rotas do `AuthorizationTests`, que prova por HTTP (401 sem token, 200 com token). O par positivo é obrigatório — ver `dotnet-testing.md`.

## Perfil ainda não se cobra

O token já emite o perfil como `ClaimTypes.Role` (`TokenService.CriarClaimsDoUsuario`), então gate por perfil é `[Authorize(Roles = ...)]` na action — não precisa de guard próprio, o ASP.NET Core já entrega o atributo.

⛔ **Mas não escreva a policy antes de existir o que ela proteja.** Quem decide o perfil de quem se cadastra é `UsuarioService`, e é lá que se vê qual perfil o sistema realmente produz hoje. Policy sem endpoint administrativo e sem usuário que alcance o perfil nasce sem consumidor e sem teste possível — tem cara de segurança e não barra nada.

Quando a hierarquia entre perfis for decidida (um perfil "conter" o outro), ela precisa sair no token ou numa policy nomeada: um `[Authorize(Roles = "Operator")]` **barra** quem tem só a claim de administrador, porque o `TokenService` emite uma claim de role por usuário.
