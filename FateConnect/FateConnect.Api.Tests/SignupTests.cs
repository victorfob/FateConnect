using System.Net;
using System.Net.Http.Json;

namespace FateConnect.Api.Tests;

public class SignupTests : IClassFixture<ApiFactory>
{
    private readonly ApiFactory _factory;

    public SignupTests(ApiFactory factory) => _factory = factory;

    private static object SignupPayload(object contacts) => new
    {
        emailFatec = $"sonda{Guid.NewGuid():N}@aluno.cps.sp.gov.br",
        senha = "SenhaForte123!",
        nomeCompleto = "Pessoa de Teste",
        dataNascimento = "2000-01-01T00:00:00Z",
        genero = "Male",
        enderecos = new[] { new { cep = "18000-000", logradouro = "Rua A", numero = "1", complemento = "Casa", cidade = "Sorocaba", estado = "SP" } },
        contatos = contacts,
    };

    [Fact]
    public async Task Signup_WithOneContact_IsAccepted()
    {
        HttpResponseMessage r = await _factory.CreateClient().PostAsJsonAsync(
            "/usuario/cadastro",
            SignupPayload(new[] { new { telefone = "15999990000", emailContato = "pessoa@example.com" } }));

        string corpo = await r.Content.ReadAsStringAsync();

        Assert.True(r.StatusCode == HttpStatusCode.Created, $"status={r.StatusCode} corpo={corpo}");
    }

    [Fact]
    public async Task Signup_WithAnEmptyContactList_IsRejected()
    {
        HttpResponseMessage r = await _factory.CreateClient()
            .PostAsJsonAsync("/usuario/cadastro", SignupPayload(Array.Empty<object>()));

        Assert.Equal(HttpStatusCode.BadRequest, r.StatusCode);
    }

    [Fact]
    public async Task Signup_WithoutTheContactField_IsRejected()
    {
        HttpResponseMessage r = await _factory.CreateClient().PostAsJsonAsync("/usuario/cadastro", new
        {
            emailFatec = $"sonda{Guid.NewGuid():N}@aluno.cps.sp.gov.br",
            senha = "SenhaForte123!",
            nomeCompleto = "Pessoa de Teste",
            dataNascimento = "2000-01-01T00:00:00Z",
            genero = "Male",
            enderecos = new[] { new { cep = "18000-000", logradouro = "Rua A", numero = "1", complemento = "Casa", cidade = "Sorocaba", estado = "SP" } },
        });

        Assert.Equal(HttpStatusCode.BadRequest, r.StatusCode);
    }
}
