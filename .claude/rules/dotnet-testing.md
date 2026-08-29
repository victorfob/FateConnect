---
description: Os 90% de cobertura que escrevemos aqui — acima do gate de 33% de propósito — e como escrever teste na API .NET — projeto separado, nome em três partes, sem lógica e sem comentário, e o par positivo que impede a suíte de concordar com o defeito
paths:
  - "FateConnect/FateConnect.Api/**"
  - "FateConnect/FateConnect.Api.Tests/**"
---

# Teste na API .NET

## Cobertura de 90% no que escrevemos aqui

⛔ **Código novo escrito nesta sessão nasce com pelo menos 90% de cobertura**, o mesmo piso do front. Não é o número que o portão cobra — é o que a gente entrega.

⚠️ **O gate `Backend` no SonarCloud reprova em 33%, e isso é de propósito.** Aquele é o piso do repositório, para quem escreve à mão sem agente ao lado; escrever teste tem um custo diferente para cada um. Os 90% são o nosso, e ficam **acima** do portão de propósito.

⛔ **A consequência prática: gate verde não é entrega pronta.** Cobertura de código novo em 40% passa no portão e **não** cumpre esta regra. Calibrar pelo que o Sonar aceita é o erro que esta seção existe para impedir.

O relatório sai do `dotnet test` em formato **OpenCover** (`--collect:"XPlat Code Coverage;Format=opencover"`); o Sonar **não lê Cobertura para C#**, que é o padrão do `dotnet test`. Migrations e `obj/` ficam de fora da conta.

**Linha que não dá para cobrir se marca, não se ignora.** Construtor privado que existe só para impedir instanciação nunca é chamado: `[ExcludeFromCodeCoverage]` nele tira a linha do denominador e diz por quê. Baixar o alvo, não.

⚠️ **Cobertura baixa costuma acusar teste que falta, não métrica injusta.** Na primeira medição o PR saiu com 25%: as propriedades de um DTO sem nenhum teste que criasse o recurso, e a linha do middleware de erro sem nenhum teste que disparasse exceção tratada. Um teste que criava carona com vagas fora da faixa cobriu as duas — e ainda passou a garantir a mensagem de erro, que nada verificava.

## O teste mora em projeto separado

⛔ **Nunca coloque teste dentro do projeto da API.** O MSBuild não tem `devDependencies`: `PackageReference` é dependência de compilação **e** de runtime, entra no `deps.json` e é copiada para a publicação.

Medido em 2026-08-28, publicando a `FateConnect.Api` dos dois jeitos:

| | dlls | tamanho |
| --- | --- | --- |
| projeto de teste separado | 22 | **10 MB** |
| pacotes de teste dentro da API | 30 | **21 MB** |

Vão para dentro do contêiner de produção `xunit.core`, `xunit.assert`, `xunit.execution.dotnet`, `xunit.abstractions`, `Microsoft.AspNetCore.Mvc.Testing`, `Microsoft.EntityFrameworkCore.InMemory` e um `MvcTestingAppManifest.json` — inclusive um provedor de banco alternativo disponível no processo que atende a internet.

É também o que a Microsoft manda por escrito — *"Separate unit tests from integration tests into different projects"* — e o que os projetos de referência fazem: o `dotnet/eShop` tem `src/Catalog.API` com `tests/Catalog.FunctionalTests` ao lado, o `dotnet/aspnetcore` repete `src/` e `test/` em cada módulo, o `MediatR` tem `src/` e `test/`.

**A única peça de apoio a teste que pode morar no app** é tornar o `Program` visível para o `WebApplicationFactory`. O eShop faz isso com um arquivo de três linhas, e explica que `InternalsVisibleTo` não resolve porque a acessibilidade do tipo é verificada. Aqui o `Program` já é público, então nem isso é preciso.

⚠️ **Quando a suíte crescer, separe por tipo.** Hoje `FateConnect.Api.Tests` mistura unidade (`TokenServiceTests`) e integração (`AuthorizationTests`, que sobe a aplicação). Com 10 testes não paga; o eShop separaria em `.UnitTests` e `.FunctionalTests`, e é para lá que a divisão vai quando a suíte justificar.

## Nome em três partes

`Método_Cenário_ComportamentoEsperado`, como a Microsoft padroniza — o nome é o que se lê quando o teste falha, e deve dispensar a leitura do corpo.

```csharp
RideEndpoints_WithoutToken_RespondUnauthorized
GerarJwtToken_IsAcceptedByAKeyBuiltInUtf8
```

Nome de teste é código, então segue a regra de idioma: **inglês**.

## Arrange, Act, Assert — em branco, não em comentário

A estrutura é obrigatória; **os rótulos `// Arrange`, `// Act`, `// Assert` não entram**. Os exemplos da Microsoft os usam, e a `comments.md` deste repo proíbe qualquer comentário em C#. As três fases se separam por **linha em branco**.

```csharp
[Fact]
public async Task RideEndpoints_WithAValidToken_ReachTheController()
{
    HttpClient client = _factory.CreateClient();
    client.DefaultRequestHeaders.Authorization =
        new AuthenticationHeaderValue("Bearer", ApiFactory.IssueToken());

    HttpResponseMessage response = await client.GetAsync("/Rides");

    Assert.Equal(HttpStatusCode.OK, response.StatusCode);
}
```

## O par positivo é obrigatório

⛔ **Teste que só prova a recusa passa também numa API que recusa tudo.** Todo conjunto que afirma um bloqueio precisa do caso que atravessa.

O par acima é o exemplo: `GET /Rides` sem cabeçalho responde 401, e **a mesma rota** com token válido responde 200. Sem o segundo, apagar a autenticação inteira mantém a suíte verde.

Vale para além de autorização: validação que rejeita precisa do caso que aceita, filtro que exclui precisa do que inclui.

## Um Act por teste, e nenhuma lógica

Sem `if`, `for`, `while` ou concatenação dentro do teste — bug em suíte de teste é o pior lugar para procurar. Vários casos viram `[Theory]` com `[InlineData]` ou `[MemberData]`, nunca laço sobre uma lista.

Valor fixo que não se explica sozinho vira constante nomeada, não literal solto no meio da chamada.

## Estado compartilhado: helper, não Setup

`SetUp`/`TearDown` não existem no xUnit 2.x. Estado comum vai em método auxiliar ou no construtor da classe de teste; fixture cara vai em `IClassFixture<T>`, como o `ApiFactory`.

## Método privado se testa pelo público

Nunca exponha membro só para testar. O que interessa é o resultado do método público que chama o privado.

## Estático precisa de costura

`DateTime.UtcNow`, `TimeZoneInfo` e afins tiram o controle do teste. Enquanto a costura não existir, **não escreva o teste que depende do relógio** — ele passa hoje e falha sozinho depois.

Aqui isso já espera por alguém: `Ride.ValidateDepartureDateTime` compara a partida com `DateTime.UtcNow`, então testar a regra de "partida no futuro" exige injetar o tempo antes.

## Subir a aplicação sem banco

O `ApiFactory` troca o provedor por `UseInMemoryDatabase`, e o `Program` só chama `Migrate()` quando `database.IsRelational()` — sem essa guarda a aplicação não sobe no teste, porque provedor em memória não tem migration.

⚠️ **O provedor em memória não é o Postgres.** Ele não avalia `unaccent` nem `ILike`, então filtro por destino não se prova ali: ou o teste evita esse caminho, ou a prova é gerar o SQL e lê-lo.
