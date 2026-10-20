using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using FateConnect.Api.Tests.Fixtures;

namespace FateConnect.Api.Tests.Common;

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
        ["phone"] = ApiFactory.UniquePhone(),
        ["contactEmail"] = ApiFactory.UniqueContactEmail(),
        ["acceptances"] = new[]
        {
            new { document = "TermsOfUse", version = CurrentLegalVersions.TermsOfUse },
            new { document = "PrivacyPolicy", version = CurrentLegalVersions.PrivacyPolicy },
        },
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
        payload["birthDate"] = "2000-01-01";

        HttpResponseMessage response = await _factory.CreateClient()
            .PostAsJsonAsync("/Users/signup", payload);

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
    }

    [Fact]
    public async Task CreateRide_WithAShortDestination_AnswersTheDomainMessage()
    {
        HttpClient client = _factory.CreateClientForNewUser("Ana Beatriz Nogueira");

        HttpResponseMessage response = await client.PostAsJsonAsync("/Rides", new
        {
            destination = "AB",
            departureDate = RideDates.Iso(RideDates.DepartureDayFrom(7)),
            departureTime = "08:30:00",
            rideType = "Solidarity",
            vehicleType = "Car",
        });

        string body = await response.Content.ReadAsStringAsync();

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        Assert.Contains("The destination must have between 3 and 100 characters.", body, StringComparison.Ordinal);
    }
}
