---
description: pt-BR para UI, URLs e mensagem ao usuário; inglês para código, estrutura e contrato da API — absoluto dos dois lados; domínio Ride e o prefixo Enum do C#
paths:
  - "FateConnect/**"
  - ".github/**"
---

# FateConnect — idioma da interface vs idioma do código

Separar o que é **experiência do usuário (pt-BR)** do que é **base de código (inglês)**. A regra vale igual nos dois lados; o back-end .NET tem seção própria no fim só pelo que é dele — o prefixo `Enum` e o idioma de log e de Swagger.

## O que fica em **pt-BR**

- **Copy de produto:** texto de tela, notificação, diálogo, placeholder, `aria-label` quando é mensagem ao usuário, e o erro de bootstrap em `main.tsx`.
- **URLs visíveis:** segmentos de rota e fragmentos de âncora (`inicio`, `cadastro`, `menu`, `achados-perdidos`, `caronas`, `buscar`, `ofertar`, `servicos`, `contato`, `login`). Trocar um segmento quebra link salvo — só com decisão de produto.
- **Query string — o nome e o valor.** ⛔ **A regra não para no caminho:** `?meus=true` é errado pela mesma razão que uma rota `/lost-and-found` seria. Booleano é `sim` e `nao`; conjunto fechado usa o **rótulo** da interface, em minúscula e sem acento (`?tipo=solidaria`), nunca o valor que o backend serializa — ver `.claude/rules/product-copy.md`. Leitura tolerante a maiúscula, e valor irreconhecível cai no padrão em vez de quebrar a tela.
- **`index.html`:** `lang="pt-BR"`, alinhado à interface.
- **Comentário e JSDoc do front:** português, citando nome de API em inglês quando necessário. Em C# não há comentário nenhum — ver `.claude/rules/comments.md`.

## O que fica em **inglês** (código)

- **TypeScript:** tipos, enums, funções, props, hooks, variáveis, nomes de pasta e de arquivo.
- **Domínio "carona" no código é `Ride`:** `Ride`, `RideFilter`, `listRides`, `pages/Rides/`. **Nunca** *Carona* em nome de tipo, arquivo ou função.
- **`id` e seletor** usados só pelo código (não copy): inglês.
- **Tokens** do design system: inglês (`primary`, `surfaceWhite`, `textMuted`).
- **Teste:** `describe` e `it` em inglês, no padrão `should <fazer algo>`. O código dentro do teste também é inglês. Copy de produto em asserção continua em pt-BR, porque é o texto real da tela.

## Esteira: nome em inglês, comentário em pt-BR

⛔ **Nome de job e de step em workflow é inglês** — é a mesma regra do identificador de código, e vale porque o nome aparece como check no PR, ao lado dos que o GitHub gera.

⛔ Aconteceu em 11/09/2026, no `check-front.yml`: escrevi um step `Frentes anteriores` e o Victor cobrou — *"lembra que é pra ser feito tudo em inglês"*. A medição mostrou o tamanho do desvio: **26 nomes de step em todos os workflows, e o meu era o único em português**.

⚠️ **E aqui o `paths` desta rule era o defeito real.** Ele cobria só `FateConnect/**`, então editar `.github/` não carregava nada sobre idioma — a regra existia e não me alcançava. Por isso a entrada de `.github/**` acima.

**Comentário e mensagem de `echo` continuam em pt-BR**, como nos sete workflows. Medido na mesma rodada: os sete têm comentário em português, e o `echo` que fala com quem lê o log também. Não "corrija" isso para inglês — o que é inglês é o **nome**.

## Back-end .NET

**Inglês absoluto, como no front:** identificador, namespace, nome de pasta e nome de arquivo. Módulos são `Auth`, `Common`, `Denunciations`, `LostAndFound`, `Rides` e `Users`; o nome de cada tabela vem do `DbSet` que a declara no `FateConnectDbContext`, em PascalCase e no plural.

- **Enum leva o prefixo `Enum`** — `EnumRideType`, `EnumGender`, `EnumProfileType` —, enquanto no front a regra é o sufixo (`RideTypeEnum`, `RoutePathEnum`). A divergência não é descuido e **não se corrige**: a análise da Microsoft reprova o sufixo pela **CA1711**, e com o `TreatWarningsAsErrors` do `.csproj` isso é erro de compilação, não preferência. Medido em 2026-08-28: um `public enum SondaEnum` derruba o build com `error CA1711: Rename type name SondaEnum so that it does not end in 'Enum'`.
- **A rota do controller vem de `[Route("[controller]")]`**, nunca de string literal — daí `/Rides`, `/Users`, `/Auth`, com a inicial maiúscula do nome da classe. O roteamento do ASP.NET é case-insensitive, então minúsculo também resolve; o que muda é o que o Swagger mostra.

### O que fica em pt-BR

⛔ **Mensagem que uma pessoa lê.** Validação de DTO, exceção de domínio, erro genérico do middleware. É copy de produto e segue a `product-copy.md` — inclusive usando **o mesmo texto** que a tela já usa: `Informe o e-mail`, `E-mail inválido`, `Mínimo de 8 caracteres`.

### O que fica em inglês, apesar de ser texto

- **`summary` e `description` do Swagger** — descrevem a API para quem a consome.
- **Template de `LoggerMessage`** — descreve o log para quem o opera. ⛔ Nunca interpolar a mensagem de produto dentro dele: o log registra o **tipo** da exceção, não a frase traduzida.

## Contrato com a API

A API fala **inglês inteira** — caminho, query, corpo e resposta. Não há tradução na borda: o tipo do front vai direto na chamada.

- **Caronas.** Caminho `/Rides`. Valores do enum de tipo: `Solidarity` | `Egalitarian`; do enum de turno: `Morning` | `Afternoon` | `Night`.
- **Achados e perdidos.** Caminho `/LostAndFound`. O campo de autoria se chama `OnlyMine` **nos dois módulos**.
- **Cadastro.** `POST /Users/signup` com `fullName`, `fatecEmail`, `password`, `birthDate`, `gender` e `contacts` (`phone`, `contactEmail`). Resposta: `{ token }` — o cadastro já autentica. Valores de gênero: `Male` | `Female` | `Other`.
- **Login.** `POST /Auth/login` com `{ fatecEmail, password }`, resposta `{ token }`.
- **Sessão.** `GET /Auth/session`, autenticada, responde `204` enquanto o token vale e `401` quando não vale mais. É quem diz se a sessão continua de pé — o front não julga validade por conta própria, e não lê o `exp` do token.
- **O nome de quem está logado sai do token**, na claim `unique_name`, e não de nenhuma resposta. Cadastro e login devolvem o mesmo `TokenResponseDto`.
- **Erro.** São **duas** formas, e o que as separa é quem recusou:
  - o que a **aplicação** lança sai como `{ "error": "..." }`, do `ErrorResponseDto`, com a mensagem em pt-BR — é o que o `GlobalExceptionMiddleware` devolve, e é o mesmo tipo que o `ProducesResponseType` anuncia, então documentação e resposta não conseguem divergir;
  - o que a **validação de modelo ou o binder** recusa sai como `ProblemDetails`, com os campos aninhados: `{"title":"One or more validation errors occurred.","status":400,"errors":{"<Campo>":["..."]}}`. O `Program.cs` não configura `InvalidModelStateResponseFactory`, então quem responde é o padrão do ASP.NET.

  Medido em 10/09/2026 em quatro casos — enum fora do conjunto, enum com nome inexistente, booleano recebendo número, e o `IValidatableObject` do período invertido: os quatro devolveram `ProblemDetails`, com controle positivo no mesmo lote (valor de enum válido responde `200`).

  ⛔ **O que o front lê do corpo é o `field`, nunca a mensagem.** Nenhum arquivo de `src/` lê `error`: o interceptor descarta a mensagem da API e **cada tela escreve a copy dela**, escolhida por `status` ou por `field` — é por isso que o conflito de cadastro aparece como `Este e-mail já está em uso…` e não como o texto que a API mandou. Ao escrever mensagem de erro na API, saiba que ela documenta o contrato e **não** é o que a pessoa lê.

  ⚠️ **E a diferença que a segunda forma faz é no `field`, não no texto:** o `ProblemDetails` não traz `field` no topo — o nome do campo é chave dentro de `errors` —, então recusa de validação **não consegue apontar o campo** como o conflito de cadastro aponta.
- **Erro que aponta um campo** acrescenta `field`, com o nome que a **requisição** usa: `fatecEmail`, `phone` ou `contactEmail`. Hoje só o conflito de cadastro o manda, e é ele que permite ao formulário marcar o campo certo em vez de casar substring da mensagem. Erro sem campo associado devolve só `error`, e o front trata a ausência como o caso genérico.

⛔ **Não enumere aqui os parâmetros de filtro.** Esta seção os listava e drifou três vezes em uma semana: `destination` já era `SearchTerm`, `departureDate` saiu com o filtro de período, `departureTime` saiu com o de turno. Enumerar num lugar que ninguém revisita produz uma lista que mente com confiança. Eles se leem na fonte — o DTO de filtro de cada módulo, mais o `DateRangeFilterDto` e o `PagedFilterDto` que os dois herdam — e, no ar, no documento do Swagger de cada ambiente.

⚠️ **A query e o JSON de resposta não têm os mesmos nomes**, e já tiveram. Hoje a query de caronas filtra por `DateFrom`, `DateTo` e `DepartureShift`, enquanto o JSON devolve `DepartureDate` e `DepartureTime` — dos dois lados só `RideType` coincide. Não presuma simetria entre o que se filtra e o que se recebe.

⚠️ **A API publica com a inicial maiúscula e o front chama minúsculo.** `[Route("[controller]")]` gera `/Rides`, `/Users` e `/Auth`, que é o que o Swagger mostra; os serviços do front padronizam `/rides`, `/users/signup` e `/auth`, porque o roteamento do ASP.NET é case-insensitive. Não "corrija" nenhum dos dois lados — a divergência é deliberada.

## Referência no repositório

- Feature de exemplo: [`FateConnect/Web/src/pages/Rides/`](FateConnect/Web/src/pages/Rides/)
- Rotas: [`FateConnect/Web/src/routes/paths.ts`](FateConnect/Web/src/routes/paths.ts)
- Serviço de caronas: [`FateConnect/Web/src/services/rides/ridesService.ts`](FateConnect/Web/src/services/rides/ridesService.ts)
