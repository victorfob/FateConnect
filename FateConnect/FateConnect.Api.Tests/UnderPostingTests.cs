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
        ["fatecEmail"] = $"sonda{Guid.NewGuid():N}@aluno.cps.sp.gov.br",
        ["password"] = "SenhaForte123!",
        ["fullName"] = "Mariana Alves Rocha",
        ["gender"] = "Male",
        ["addresses"] = new[]
        {
            new { zipCode = "18040-430", street = "Rua Cesário Mota", streetNumber = "1", complement = "Casa", city = "Sorocaba", state = "SP" },
        },
        ["contacts"] = new[] { new { phone = "15999990000", contactEmail = "mariana.rocha@gmail.com" } },
    };

    [Fact]
    public async Task Signup_WithoutTheBirthDate_IsRejected()
    {
        HttpResponseMessage response = await _factory.CreateClient()
            .PostAsJsonAsync("/Users/signup", BaseSignup());

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task Signup_WithTheBirthDate_IsAccepted()
    {
        Dictionary<string, object> payload = BaseSignup();
        payload["birthDate"] = "2000-01-01T00:00:00Z";

        HttpResponseMessage response = await _factory.CreateClient()
            .PostAsJsonAsync("/Users/signup", payload);

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
        Assert.Contains("entre 1 e 7 vagas", body, StringComparison.Ordinal);
    }
}
