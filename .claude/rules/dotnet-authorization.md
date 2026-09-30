---
description: Autorização da API .NET — as duas camadas que protegem um endpoint, onde o `[Authorize]` mora, o gate por perfil e o encerramento de sessão
paths:
  - "FateConnect/FateConnect.Api/Modules/*/Controllers/**"
  - "FateConnect/FateConnect.Api/Modules/Auth/**"
  - "FateConnect/FateConnect.Api/Program.cs"
  - "FateConnect/FateConnect.Api.Tests/Auth/**"
---

# Autorização na API

## Duas camadas, e as duas ficam

- **Piso:** `SetFallbackPolicy(RequireAuthenticatedUser())` no `Program.cs` fecha o endpoint que ninguém anotou.
- **Explícito:** `[Authorize]` no controller, para a regra aparecer a quem o abre. ⛔ Nunca troque um pelo outro: sem o piso, esqueceu = aberto.

## Onde o `[Authorize]` mora

⛔ **Endpoint novo nasce com `[Authorize]` explícito**, e o nível depende do controller:

- **Homogêneo** (toda action exige token): `[Authorize]` na classe, como no `RidesController`.
- **Misto** (alguma action pública): `[Authorize]` em cada action protegida e `[AllowAnonymous]` na pública, como no `UsersController` e no `AuthController`. ⛔ Ao acrescentar a primeira action pública, o `[Authorize]` desce da classe: na classe, com `[AllowAnonymous]` embaixo, o topo mente sobre metade das actions.

**Gate por perfil é `[AuthorizeProfile(EnumProfileType.X)]`**, que já inclui os perfis acima de X e conta como o `[Authorize]` da action. ⛔ `[Authorize(Roles = "Operator")]` cru barra o administrador: o token leva uma claim de role só.

Endpoint novo entra na teoria de rotas do `AuthorizationTests` (401 sem token) e ganha o par positivo (a mesma rota atravessa com token).

## O piso responde 401 até para rota que não existe

⛔ **401 não prova que a rota existe.** Para saber se o código novo subiu, leia o `swagger.json`; para saber se a aplicação está viva, qualquer caminho serve (é o que a sonda de `.github/workflows/publish.yml` faz).

## O que roda antes da autorização não passa por ela

- Middleware registrado antes de `UseAuthentication`/`UseAuthorization` responde sem token. O que precisa de token precisa ser endpoint, como o `UploadsController`, e não middleware de arquivo estático.
- ⛔ **O Swagger é público de propósito**, nos dois ambientes. Não "corrija" como vazamento.

## O recorte que o token responde não vira parâmetro

⛔ **Quando o papel de quem chama já decide o que a resposta contém, quem decide é a API**, não um campo da consulta. O tell é a tabela de autorização depender de um valor da consulta ("liberado para X quando o campo Y vier"). Filtro que a mesma pessoa usa dos dois jeitos (`OnlyMine` em caronas e achados) continua certo.

## Encerrar sessão

- `Users.TokenVersion` viaja como claim; `POST /Auth/logout` incrementa a coluna, e o `OnTokenValidated` recusa valor diferente. ⛔ O login só lê a coluna, nunca incrementa.
- Toda requisição autenticada exige que o usuário exista: fixture que emite token sem semear o usuário recebe 401.
