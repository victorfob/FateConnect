---
description: pt-BR para UI, URLs e mensagem ao usuário; inglês para código, estrutura e contrato da API — absoluto dos dois lados; domínio Ride e o prefixo Enum do C#
paths:
  - "FateConnect/**"
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

## Back-end .NET

**Inglês absoluto, como no front:** identificador, namespace, nome de pasta e nome de arquivo. Módulos são `Auth`, `Common`, `Denunciations`, `LostAndFound`, `Rides` e `Users`; as tabelas são `Users`, `Addresses`, `Contacts` e `Rides`.

- **Enum leva o prefixo `Enum`** — `EnumRideType`, `EnumGender`, `EnumProfileType` —, enquanto no front a regra é o sufixo (`RideTypeEnum`, `RoutePathEnum`). A divergência não é descuido e **não se corrige**: a análise da Microsoft reprova o sufixo pela **CA1711**, e com o `TreatWarningsAsErrors` do `.csproj` isso é erro de compilação, não preferência. Medido em 2026-08-28: um `public enum SondaEnum` derruba o build com `error CA1711: Rename type name SondaEnum so that it does not end in 'Enum'`.
- **A rota do controller vem de `[Route("[controller]")]`**, nunca de string literal — daí `/Rides`, `/Users`, `/Auth`, com a inicial maiúscula do nome da classe. O roteamento do ASP.NET é case-insensitive, então minúsculo também resolve; o que muda é o que o Swagger mostra.

### O que fica em pt-BR

⛔ **Mensagem que uma pessoa lê.** Validação de DTO, exceção de domínio, erro genérico do middleware. É copy de produto e segue a `product-copy.md` — inclusive usando **o mesmo texto** que a tela já usa: `Informe o e-mail`, `E-mail inválido`, `Mínimo de 8 caracteres`.

### O que fica em inglês, apesar de ser texto

- **`summary` e `description` do Swagger** — descrevem a API para quem a consome.
- **Template de `LoggerMessage`** — descreve o log para quem o opera. ⛔ Nunca interpolar a mensagem de produto dentro dele: o log registra o **tipo** da exceção, não a frase traduzida.

## Contrato com a API

A API fala **inglês inteira** — caminho, query, corpo e resposta. Não há tradução na borda: o tipo do front vai direto na chamada.

- **Caronas.** Caminho `/Rides`, query (`destination`, `departureDate`, `departureTime`, `rideType`) e propriedades do JSON com os mesmos nomes. Valores do enum: `Solidarity` | `Egalitarian`.
- **Cadastro.** `POST /Users/signup` com `fullName`, `nickname`, `fatecEmail`, `password`, `birthDate`, `gender`, `addresses` (`zipCode`, `street`, `streetNumber`, `complement`, `city`, `state`) e `contacts` (`phone`, `contactEmail`). Resposta: `{ id, fatecEmail, fullName }`. Valores de gênero: `Male` | `Female` | `Other`.
- **Login.** `POST /Auth/login` com `{ fatecEmail, password }`, resposta `{ token, fullName }`.
- **Erro.** Qualquer status de erro devolve `{ "error": "..." }`, com a mensagem em pt-BR. O corpo sai do `ErrorResponseDto`, o mesmo tipo que o `ProducesResponseType` anuncia — documentação e resposta não conseguem divergir.

⚠️ **A API publica com a inicial maiúscula e o front chama minúsculo.** `[Route("[controller]")]` gera `/Rides`, `/Users` e `/Auth`, que é o que o Swagger mostra; os serviços do front padronizam `/rides`, `/users/signup` e `/auth`, porque o roteamento do ASP.NET é case-insensitive. Não "corrija" nenhum dos dois lados — a divergência é deliberada.

## Referência no repositório

- Feature de exemplo: [`FateConnect/Web/src/pages/Rides/`](FateConnect/Web/src/pages/Rides/)
- Rotas: [`FateConnect/Web/src/routes/paths.ts`](FateConnect/Web/src/routes/paths.ts)
- Serviço de caronas: [`FateConnect/Web/src/services/rides/ridesService.ts`](FateConnect/Web/src/services/rides/ridesService.ts)
