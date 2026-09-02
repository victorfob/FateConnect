using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using FateConnect.Api.Modules.Auth.DTOs;

namespace FateConnect.Api.Tests;

public class SignupTests : IClassFixture<ApiFactory>
{
    private readonly ApiFactory _factory;

    public SignupTests(ApiFactory factory) => _factory = factory;

    private static object SignupPayload(object contacts) => new
    {
        fatecEmail = $"sonda{Guid.NewGuid():N}@aluno.cps.sp.gov.br",
        password = "SenhaForte123!",
        fullName = "Mariana Alves Rocha",
        birthDate = "2000-01-01T00:00:00Z",
        gender = "Male",
        addresses = new[] { new { zipCode = "18040-430", street = "Rua Cesário Mota", streetNumber = "1", complement = "Casa", city = "Sorocaba", state = "SP" } },
        contacts = contacts,
    };

    private async Task<(HttpStatusCode StatusCode, string? Field)> SignupAnswerFor(object payload)
    {
        HttpResponseMessage response = await _factory.CreateClient().PostAsJsonAsync("/Users/signup", payload);

        if (response.StatusCode == HttpStatusCode.Created)
            return (response.StatusCode, null);

        JsonElement raw = JsonDocument.Parse(await response.Content.ReadAsStringAsync()).RootElement;
        string? field = raw.TryGetProperty("field", out JsonElement value) ? value.GetString() : null;

        return (response.StatusCode, field);
    }

    [Fact]
    public async Task Signup_WithOneContact_IsAccepted()
    {
        HttpResponseMessage r = await _factory.CreateClient().PostAsJsonAsync(
            "/Users/signup",
            SignupPayload(new[] { new { phone = ApiFactory.UniquePhone(), contactEmail = ApiFactory.UniqueContactEmail() } }));

        string corpo = await r.Content.ReadAsStringAsync();

        Assert.True(r.StatusCode == HttpStatusCode.Created, $"status={r.StatusCode} corpo={corpo}");
    }

    [Fact]
    public async Task Signup_WithOneContact_AnswersATokenThatOpensTheApi()
    {
        HttpResponseMessage signup = await _factory.CreateClient().PostAsJsonAsync(
            "/Users/signup",
            SignupPayload(new[] { new { phone = ApiFactory.UniquePhone(), contactEmail = ApiFactory.UniqueContactEmail() } }));

        Assert.Equal(HttpStatusCode.Created, signup.StatusCode);

        JsonElement raw = JsonDocument.Parse(await signup.Content.ReadAsStringAsync()).RootElement;

        Assert.Single(raw.EnumerateObject());
        Assert.True(raw.TryGetProperty("token", out _));

        TokenResponseDto body = (await signup.Content.ReadFromJsonAsync<TokenResponseDto>())!;

        HttpClient authenticated = _factory.CreateClient();
        authenticated.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue("Bearer", body.Token);

        HttpResponseMessage rides = await authenticated.GetAsync("/Rides");

        Assert.Equal(HttpStatusCode.OK, rides.StatusCode);
    }

    [Fact]
    public async Task Signup_WithAnEmptyContactList_IsRejected()
    {
        HttpResponseMessage r = await _factory.CreateClient()
            .PostAsJsonAsync("/Users/signup", SignupPayload(Array.Empty<object>()));

        Assert.Equal(HttpStatusCode.BadRequest, r.StatusCode);
    }

    [Fact]
    public async Task Signup_WithoutTheContactField_IsRejected()
    {
        HttpResponseMessage r = await _factory.CreateClient().PostAsJsonAsync("/Users/signup", new
        {
            fatecEmail = $"sonda{Guid.NewGuid():N}@aluno.cps.sp.gov.br",
            password = "SenhaForte123!",
            fullName = "Mariana Alves Rocha",
            birthDate = "2000-01-01T00:00:00Z",
            gender = "Male",
            addresses = new[] { new { zipCode = "18040-430", street = "Rua Cesário Mota", streetNumber = "1", complement = "Casa", city = "Sorocaba", state = "SP" } },
        });

        Assert.Equal(HttpStatusCode.BadRequest, r.StatusCode);
    }

    [Fact]
    public async Task Signup_WithTheRemovedNicknameField_IsAccepted()
    {
        HttpResponseMessage r = await _factory.CreateClient().PostAsJsonAsync("/Users/signup", new
        {
            fatecEmail = $"sonda{Guid.NewGuid():N}@aluno.cps.sp.gov.br",
            password = "SenhaForte123!",
            fullName = "Mariana Alves Rocha",
            nickname = "Mari",
            birthDate = "2000-01-01T00:00:00Z",
            gender = "Male",
            addresses = new[] { new { zipCode = "18040-430", street = "Rua Cesário Mota", streetNumber = "1", complement = "Casa", city = "Sorocaba", state = "SP" } },
            contacts = new[] { new { phone = ApiFactory.UniquePhone(), contactEmail = ApiFactory.UniqueContactEmail() } },
        });

        string corpo = await r.Content.ReadAsStringAsync();

        Assert.True(r.StatusCode == HttpStatusCode.Created, $"status={r.StatusCode} corpo={corpo}");
    }

    [Fact]
    public async Task Signup_WithAPhoneAlreadyRegistered_IsRejectedNamingThePhone()
    {
        string takenPhone = ApiFactory.UniquePhone();

        (HttpStatusCode first, _) = await SignupAnswerFor(
            SignupPayload(new[] { new { phone = takenPhone, contactEmail = ApiFactory.UniqueContactEmail() } }));

        Assert.Equal(HttpStatusCode.Created, first);

        (HttpStatusCode second, string? field) = await SignupAnswerFor(
            SignupPayload(new[] { new { phone = takenPhone, contactEmail = ApiFactory.UniqueContactEmail() } }));

        Assert.Equal(HttpStatusCode.Conflict, second);
        Assert.Equal("phone", field);
    }

    [Fact]
    public async Task Signup_WithAContactEmailAlreadyRegistered_IsRejectedNamingTheContactEmail()
    {
        string takenEmail = ApiFactory.UniqueContactEmail();

        (HttpStatusCode first, _) = await SignupAnswerFor(
            SignupPayload(new[] { new { phone = ApiFactory.UniquePhone(), contactEmail = takenEmail } }));

        Assert.Equal(HttpStatusCode.Created, first);

        (HttpStatusCode second, string? field) = await SignupAnswerFor(
            SignupPayload(new[] { new { phone = ApiFactory.UniquePhone(), contactEmail = takenEmail } }));

        Assert.Equal(HttpStatusCode.Conflict, second);
        Assert.Equal("contactEmail", field);
    }

    [Fact]
    public async Task Signup_RepeatingThePhoneWithinTheSameRequest_IsRejectedNamingThePhone()
    {
        string repeated = ApiFactory.UniquePhone();

        (HttpStatusCode statusCode, string? field) = await SignupAnswerFor(SignupPayload(new[]
        {
            new { phone = repeated, contactEmail = ApiFactory.UniqueContactEmail() },
            new { phone = repeated, contactEmail = ApiFactory.UniqueContactEmail() },
        }));

        Assert.Equal(HttpStatusCode.Conflict, statusCode);
        Assert.Equal("phone", field);
    }

    [Fact]
    public async Task Signup_WithTheLoginEmailAlreadyRegistered_IsRejectedNamingTheLoginEmail()
    {
        string takenEmail = $"sonda{Guid.NewGuid():N}@aluno.cps.sp.gov.br";

        object PayloadFor(string phone, string contactEmail) => new
        {
            fatecEmail = takenEmail,
            password = "SenhaForte123!",
            fullName = "Mariana Alves Rocha",
            birthDate = "2000-01-01T00:00:00Z",
            gender = "Male",
            addresses = new[] { new { zipCode = "18040-430", street = "Rua Cesário Mota", streetNumber = "1", complement = "Casa", city = "Sorocaba", state = "SP" } },
            contacts = new[] { new { phone, contactEmail } },
        };

        (HttpStatusCode first, _) = await SignupAnswerFor(
            PayloadFor(ApiFactory.UniquePhone(), ApiFactory.UniqueContactEmail()));

        Assert.Equal(HttpStatusCode.Created, first);

        (HttpStatusCode second, string? field) = await SignupAnswerFor(
            PayloadFor(ApiFactory.UniquePhone(), ApiFactory.UniqueContactEmail()));

        Assert.Equal(HttpStatusCode.Conflict, second);
        Assert.Equal("fatecEmail", field);
    }
}
