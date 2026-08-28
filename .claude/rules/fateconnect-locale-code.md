---
description: pt-BR para UI e URLs; inglês para código e estrutura — absoluto no front, boy-scout no back-end .NET; domínio Ride e contrato da API Caronas
paths:
  - "FateConnect/**"
---

# FateConnect — idioma da interface vs idioma do código

Separar o que é **experiência do usuário (pt-BR)** do que é **base de código (inglês)**. O que vem a seguir descreve o front; o back-end .NET tem seção própria no fim, com rigor diferente.

## O que fica em **pt-BR**

- **Copy de produto:** texto de tela, notificação, diálogo, placeholder, `aria-label` quando é mensagem ao usuário, e o erro de bootstrap em `main.tsx`.
- **URLs visíveis:** segmentos de rota e fragmentos de âncora (`inicio`, `cadastro`, `menu`, `achados-perdidos`, `caronas`, `buscar`, `ofertar`, `servicos`, `contato`, `login`). Trocar um segmento quebra link salvo — só com decisão de produto.
- **Query string — o nome e o valor.** ⛔ **A regra não para no caminho:** `?meus=true` é errado pela mesma razão que uma rota `/lost-and-found` seria. Booleano é `sim` e `nao`; conjunto fechado usa o **rótulo** da interface, em minúscula e sem acento (`?tipo=solidaria`), nunca o valor que o backend serializa — ver `.claude/rules/product-copy.md`. Leitura tolerante a maiúscula, e valor irreconhecível cai no padrão em vez de quebrar a tela.
- **`index.html`:** `lang="pt-BR"`, alinhado à interface.
- **Comentário e JSDoc:** português, citando nome de API em inglês quando necessário.

## O que fica em **inglês** (código)

- **TypeScript:** tipos, enums, funções, props, hooks, variáveis, nomes de pasta e de arquivo.
- **Domínio "carona" no código é `Ride`:** `Ride`, `RideFilter`, `listRides`, `pages/Rides/`. **Nunca** *Carona* em nome de tipo, arquivo ou função.
- **`id` e seletor** usados só pelo código (não copy): inglês.
- **Tokens** do design system: inglês (`primary`, `surfaceWhite`, `textMuted`).
- **Teste:** `describe` e `it` em inglês, no padrão `should <fazer algo>`. O código dentro do teste também é inglês. Copy de produto em asserção continua em pt-BR, porque é o texto real da tela.

## Back-end .NET: inglês no que nasce, boy-scout no que existe

O idioma é o mesmo dos dois lados; o **rigor** não.

**No front é absoluto** — nenhum identificador em português, e `Ride` no lugar de `Carona`.

**No back-end é boy-scout**, porque o C# nasceu misto: verbo em inglês e domínio em português no mesmo símbolo (`GerarJwtToken`, `CriarClaimsDoUsuario`, `chaveSeguranca`, `CaronasController`).

- **Arquivo, classe, método ou variável novo nasce em inglês**, mesmo cercado de português. `AuthorizationTests` ao lado de `GerarJwtToken` é o estado esperado durante a migração, não inconsistência a corrigir.
- **O que já existe fica.** Renomear símbolo público arrasta interface, chamadas e às vezes migration — PR de funcionalidade não é lugar para isso.
- **Traduza o símbolo que o próprio PR já estiver reescrevendo** por outro motivo. É o único rename que sai de graça.
- **Enum leva o prefixo `Enum`** — `EnumRideType`, `EnumGender`, `EnumProfileType` —, enquanto no front a regra é o sufixo (`RideTypeEnum`, `RoutePathEnum`). A divergência não é descuido e **não se corrige**: a análise da Microsoft reprova o sufixo pela **CA1711**, e com o `TreatWarningsAsErrors` do `.csproj` isso é erro de compilação, não preferência. Medido em 2026-08-28: um `public enum SondaEnum` derruba o build com `error CA1711: Rename type name SondaEnum so that it does not end in 'Enum'`.

⛔ **Comentário continua em pt-BR dos dois lados**, `///` de C# incluído. O idioma do código e o idioma da explicação são decisões separadas.

## Contrato com a **API Caronas**

O idioma do contrato vem do backend, não da nossa convenção:

- Caminho HTTP **`/caronas`**, query params (`Destino`, `DataPartida`, `HoraPartida`, `TipoCarona`) e propriedades do JSON (`destino`, `dataPartida`, `tipoCarona`, …) ficam como o backend expõe.
- O que é **só nosso** usa inglês: `RideFilter` tem `destination`, `departureDate`, `departureTime`, `rideType`, e o serviço traduz na borda.
- Valores do enum na serialização: `Filantropica` | `Igualitaria`.

## Referência no repositório

- Feature de exemplo: [`FateConnect/Web/src/pages/Rides/`](FateConnect/Web/src/pages/Rides/)
- Rotas: [`FateConnect/Web/src/routes/paths.ts`](FateConnect/Web/src/routes/paths.ts)
- Tradução na borda: [`FateConnect/Web/src/services/rides/ridesService.ts`](FateConnect/Web/src/services/rides/ridesService.ts)
