---
description: Contrato entre o front e a API — inglês sem tradução na borda, as duas formas de erro e o que o front lê delas, onde se leem campos e filtros, a caixa das rotas e a regra do feriado
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
- O Swagger não diz o que pode chegar nulo (o Swashbuckle marca `nullable` sem ler o C#): quem responde é o tipo do DTO.
- ⚠️ **A API publica `/Rides`, `/Users`, `/Auth`, e os serviços do front chamam minúsculo.** O roteamento é case-insensitive e a divergência é deliberada: não "corrija" nenhum lado.
- O nome de quem está logado sai do token (claim `unique_name`); se a sessão vale, quem diz é o `GET /Auth/session` (204 ou 401), não o `exp` lido no front.

## Duas formas de erro

- O que a aplicação lança sai do `GlobalExceptionMiddleware` como `ErrorResponseDto`: `{ error, field?, code? }`, com a mensagem em pt-BR. `field` usa o nome da **requisição** (`fatecEmail`, `phone`, `contactEmail`) e só vem quando o erro aponta um campo. `code` só vem quando o mesmo status tem mais de um motivo que a tela precisa separar (`ContactRequired` no 403 de criar carona, item e denúncia sem sigilo).
- O que a validação de modelo ou o binder recusa sai como `ProblemDetails` padrão do ASP.NET, com o campo como chave dentro de `errors` e sem `field` no topo: recusa de validação não aponta o campo.
- ⛔ **O front escolhe a copy por `status`, `field` ou `code`, nunca pela mensagem da API.** A mensagem documenta o contrato; o que a pessoa lê, cada tela escreve.

## Feriado

⛔ Nenhuma carona parte em feriado, nem a de uma vez só: a API recusa com `RideOnAHolidayException`, o schema do formulário recusa o feriado digitado e o calendário o desabilita. Os três lados mudam juntos.
