using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;

namespace FateConnect.Api.Tests;

public class UnderPostingTests : IClassFixture<ApiFactory>
{
    private readonly ApiFactory _factory;

    public UnderPostingTests(ApiFactory factory)
    {
        _factory = factory;
    }

    private static Dictionary<string, object> BaseSignup() => new()
    {
        ["emailFatec"] = $"sonda{Guid.NewGuid():N}@aluno.cps.sp.gov.br",
        ["senha"] = "SenhaForte123!",
        ["nomeCompleto"] = "Pessoa de Teste",
        ["genero"] = "Male",
        ["enderecos"] = new[]
        {
            new { cep = "18000-000", logradouro = "Rua A", numero = "1", complemento = "Casa", cidade = "Sorocaba", estado = "SP" },
        },
        ["contatos"] = new[] { new { telefone = "15999990000", emailContato = "pessoa@example.com" } },
    };

    [Fact]
    public async Task Signup_WithoutTheBirthDate_IsRejected()
    {
        HttpResponseMessage response = await _factory.CreateClient()
            .PostAsJsonAsync("/usuario/cadastro", BaseSignup());

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task Signup_WithTheBirthDate_IsAccepted()
    {
        Dictionary<string, object> payload = BaseSignup();
        payload["dataNascimento"] = "2000-01-01T00:00:00Z";

        HttpResponseMessage response = await _factory.CreateClient()
            .PostAsJsonAsync("/usuario/cadastro", payload);

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
    }

    [Fact]
    public async Task CreateRide_WithSeatsOutOfRange_AnswersTheDomainMessage()
    {
        HttpClient client = _factory.CreateClient();
        client.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue("Bearer", ApiFactory.IssueToken());

        HttpResponseMessage response = await client.PostAsJsonAsync("/Rides", new
        {
            availableSeats = 99,
            destination = "Fatec Sorocaba",
            departureDate = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(7)).ToString("yyyy-MM-dd"),
            departureTime = "08:30:00",
            rideType = "Solidarity",
        });

        string body = await response.Content.ReadAsStringAsync();

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        Assert.Contains("between 1 and 7", body, StringComparison.Ordinal);
    }
}
