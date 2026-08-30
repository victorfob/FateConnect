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

### Medir é um comando, e não é `dotnet test`

```bash
./scripts/coverage-changed.sh            # base padrão: origin/develop
```

Ele roda a suíte com cobertura, cruza o relatório com os arquivos de produção do diff e **sai com erro** listando quem ficou abaixo dos 90%.

⛔ **Rode antes de dizer que acabou.** `dotnet build` + `dotnet test` não medem nada, e o portão do Sonar aceita 33% — as duas coisas ficam verdes sobre uma regra violada. Aconteceu na #222: o PR chegou a 79,5% no Sonar com o `AuthService` em **22,7%**, porque não existia um único teste de login. O que fechou o buraco foram três testes; o que impede a repetição é este comando.

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
GenerateJwtToken_IsAcceptedByAKeyBuiltInUtf8
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

⛔ **E o risco maior é o inverso: ele aceita o que o Postgres recusa.** O provedor em memória executa LINQ em memória, então uma consulta que o PostgreSQL não sabe traduzir passa verde aqui e quebra em produção. Trocar a `Expression` de um predicado por um método `bool` — ver `dotnet-code-style.md` — é a forma mais fácil de causar isso: a suíte inteira continua passando.

**Enquanto for assim, tradução se prova gerando o SQL**, com `ToQueryString()` contra o `UseNpgsql`, que não precisa de banco no ar. A #237 troca o provedor por PostgreSQL real e **reescreve esta seção**.

## Suíte verde não prova que ela pega o defeito

⛔ **Quebre o código de propósito e confira que a suíte cai.** É a única forma de saber se o teste testa o que o nome dele diz — e o caso clássico é o teste que passa porque o cenário nunca se montou, não porque o código está certo.

Na #172 foram seis mutações no que a paginação tem de arriscado — corte off-by-one, contar depois de cortar, ignorar o teto do `PageSize`, arredondar `TotalPages` para baixo, remover o filtro de carona partida e tirar o `- FirstPage` do salto. As seis derrubaram testes.

⛔ **A armadilha é o build da mutação.** Se ele falhar, `dotnet test --no-build` roda a **DLL anterior** e tudo passa — o que se lê como "a mutação sobreviveu", quando ela nem chegou a existir. Aconteceu ali: remover um filtro deixou duas variáveis sem uso e, com `TreatWarningsAsErrors`, a compilação reprovou.

```bash
dotnet build <solução> -v q --nologo; echo "build da mutação exit=$?"   # 0, ou o resto não vale
dotnet test <solução> --no-build
```

**Restaure a árvore ao fim de cada mutação** e confirme com `git status` que nada sobrou.

## Fixture usa dado plausível, e válido

⛔ **Nada de rótulo no lugar de dado.** `"Pessoa de Teste"`, `"Rua A"` e `"pessoa@example.com"` não são dados — são etiquetas dizendo "isto é um teste". Use nome, endereço e contato que poderiam existir: `"Mariana Alves Rocha"`, `"Rua Cesário Mota"`, `"mariana.rocha@gmail.com"`.

A referência já está no código: os `[DefaultValue]` dos DTOs, que alimentam o Swagger, usam `João da Silva` e `Avenida Engenheiro Carlos Reinaldo Mendes`.

⚠️ **Nome de fixture não carrega papel.** `"Ana Ofertante"` e `"Bruno Passageiro"` viraram `"Ana Beatriz Nogueira"` e `"Bruno Carvalho Souza"`: quem diz o papel é a variável — `driverId`, `otherUserId` —, e o assert passou a verificar que a API devolve o nome de quem ofertou, não a palavra "Ofertante".

⛔ **E o dado precisa ser válido pelas regras da própria aplicação.** `ApiFactory` e `TokenServiceTests` usavam `@fatec.sp.gov.br`, domínio que o `FatecEmailPattern` **recusa** — o institucional é `@(aluno.)?cps.sp.gov.br`. Passava porque emissão de token e seed direto no banco não validam. Fixture inválida não quebra hoje: quebra o próximo teste que passe por validação, e o motivo não aparece no erro.

⚠️ **O valor fica em pt-BR; a chave, em inglês.** `password = "SenhaForte123!"` está certo — os dados são de um produto brasileiro. O que não pode é meia palavra em cada idioma, como o `"PasswordForte123!"` que um rename cego produziu.
