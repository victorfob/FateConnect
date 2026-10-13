---
description: Contrato entre o front e a API — inglês sem tradução na borda, o formato único de erro e o que o front lê dele, onde se leem campos e filtros, a caixa das rotas e a regra do feriado
paths:
  - "FateConnect/Web/src/services/**"
  - "FateConnect/FateConnect.Api/Modules/*/Controllers/**"
  - "FateConnect/FateConnect.Api/Modules/*/DTOs/**"
  - "FateConnect/FateConnect.Api/Infrastructure/Middlewares/**"
---

# Contrato com a API

- **A API fala inglês inteira** (caminho, query, corpo, resposta), e não há tradução na borda: o tipo do front vai direto na chamada.
- ⛔ **O contrato de cada rota se lê no DTO e no Swagger, não se enumera em rule.** Vale para os campos do corpo e para os parâmetros de filtro (o DTO de filtro do módulo, mais o `DateRangeFilterDto` e o `PagedFilterDto`).
- A query e a resposta não têm os mesmos nomes (a de caronas filtra por `DateFrom`/`DepartureShift` e devolve `DepartureDate`/`DepartureTime`): não presuma simetria.
- O Swagger diz o que pode chegar nulo e o que vem sempre: o `nullable` sai do tipo do C#, e o `required` da resposta, dos parâmetros do record posicional (`PositionalRecordRequiredFilter`).
- ⚠️ **A API publica `/Rides`, `/Users`, `/Auth`, e os serviços do front chamam minúsculo.** O roteamento é case-insensitive e a divergência é deliberada: não "corrija" nenhum lado.
- O nome de quem está logado sai do token (claim `unique_name`); se a sessão vale, quem diz é o `GET /Auth/session` (204 ou 401), não o `exp` lido no front.

## Um formato de erro

- Toda resposta 4xx e 5xx é `ProblemDetails` (RFC 9457), com `application/problem+json`: a exceção da aplicação sai do `GlobalExceptionMiddleware`, a recusa de validação do `[ApiController]`, a resposta que nasceria sem corpo (401 do piso, 403 de perfil, 404 de rota) do `UseStatusCodePages`, e o 503 da saúde do `HealthResponse`. O formato não depende do `Accept`: cliente que pede `text/html` recebe o mesmo corpo.
- A mensagem, em inglês, vai em `detail`. `field`, `code` e `minutesRemaining` são extensões no topo do corpo e só vêm quando existem. `field` usa o nome da **requisição** (`fatecEmail`, `phone`, `contactEmail`) e só vem quando o erro aponta um campo. `code` só vem quando o mesmo status tem mais de um motivo que a tela precisa separar (`ContactRequired` no 403 de criar carona, item e denúncia sem sigilo).
- A recusa de validação traz o campo como chave dentro de `errors`, sem `field` no topo: recusa de validação não aponta o campo.
- ⛔ `[Produces("application/json")]` num controller vale também para a resposta de erro dele, que deixa de sair `application/problem+json`: não declare.
- ⛔ **O front escolhe a copy por `status`, `field` ou `code`, nunca pela mensagem da API.** A mensagem documenta o contrato; o que a pessoa lê, cada tela escreve.
- No stub do teste do front, o erro da API sai do `problemResponse` (`src/test/utils/problemResponse.ts`).

## Feriado

⛔ Nenhuma carona parte em feriado, nem a de uma vez só: a API recusa com `RideOnAHolidayException`, o schema do formulário recusa o feriado digitado e o calendário o desabilita. Os três lados mudam juntos.
