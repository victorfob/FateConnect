using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using FateConnect.Api.Modules.Auth.DTOs;
using FateConnect.Api.Tests.Fixtures;

namespace FateConnect.Api.Tests.Users;

public class SignupTests : IClassFixture<ApiFactory>
{
    private readonly ApiFactory _factory;

    public SignupTests(ApiFactory factory) => _factory = factory;

    private const int UnderageYears = 10;

    private static string BirthDateForAge(int years) =>
        DateTime.UtcNow.Date.AddYears(-years).ToString("yyyy-MM-dd'T'00:00:00'Z'");

    private static object SignupPayload(string? birthDate = null) => new
    {
        fatecEmail = $"sonda{Guid.NewGuid():N}@aluno.cps.sp.gov.br",
        password = "SenhaForte123!",
        fullName = "Mariana Alves Rocha",
        birthDate = birthDate ?? "2000-01-01T00:00:00Z",
        gender = "Male",
        acceptances = new[]
        {
            new { document = "TermsOfUse", version = "2026-01-15" },
            new { document = "PrivacyPolicy", version = "2026-02-20" },
        },
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

    private async Task<HttpClient> SignedInWith(HttpResponseMessage signup)
    {
        TokenResponseDto body = (await signup.Content.ReadFromJsonAsync<TokenResponseDto>())!;
        HttpClient authenticated = _factory.CreateClient();
        authenticated.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", body.Token);

        return authenticated;
    }

    [Fact]
    public async Task Signup_WithTheRequiredFields_IsAccepted()
    {
        HttpResponseMessage response = await _factory.CreateClient().PostAsJsonAsync("/Users/signup", SignupPayload());

        string body = await response.Content.ReadAsStringAsync();

        Assert.True(response.StatusCode == HttpStatusCode.Created, $"status={response.StatusCode} body={body}");
    }

    [Fact]
    public async Task Signup_AnswersATokenThatOpensTheApi()
    {
        HttpResponseMessage signup = await _factory.CreateClient().PostAsJsonAsync("/Users/signup", SignupPayload());

        Assert.Equal(HttpStatusCode.Created, signup.StatusCode);

        JsonElement raw = JsonDocument.Parse(await signup.Content.ReadAsStringAsync()).RootElement;

        Assert.Single(raw.EnumerateObject());
        Assert.True(raw.TryGetProperty("token", out _));

        HttpResponseMessage rides = await (await SignedInWith(signup)).GetAsync("/Rides");

        Assert.Equal(HttpStatusCode.OK, rides.StatusCode);
    }

    [Fact]
    public async Task Signup_CarryingContactFields_OpensAnAccountWithoutContact()
    {
        HttpResponseMessage signup = await _factory.CreateClient().PostAsJsonAsync("/Users/signup", new
        {
            fatecEmail = $"sonda{Guid.NewGuid():N}@aluno.cps.sp.gov.br",
            password = "SenhaForte123!",
            fullName = "Mariana Alves Rocha",
            birthDate = "2000-01-01T00:00:00Z",
            gender = "Male",
            phone = ApiFactory.UniquePhone(),
            contactEmail = ApiFactory.UniqueContactEmail(),
            acceptances = new[] { new { document = "TermsOfUse", version = "2026-01-15" } },
        });

        JsonElement profile = JsonDocument.Parse(await (await SignedInWith(signup)).GetStringAsync("/Users/me")).RootElement;

        Assert.Equal(HttpStatusCode.Created, signup.StatusCode);
        Assert.Equal(JsonValueKind.Null, profile.GetProperty("phone").ValueKind);
        Assert.Equal(JsonValueKind.Null, profile.GetProperty("contactEmail").ValueKind);
    }

    [Fact]
    public async Task Signup_OfTwoAccountsWithoutContact_AcceptsBoth()
    {
        HttpClient client = _factory.CreateClient();

        HttpResponseMessage first = await client.PostAsJsonAsync("/Users/signup", SignupPayload());
        HttpResponseMessage second = await client.PostAsJsonAsync("/Users/signup", SignupPayload());

        Assert.Equal(HttpStatusCode.Created, first.StatusCode);
        Assert.Equal(HttpStatusCode.Created, second.StatusCode);
    }

    [Fact]
    public async Task Signup_CarryingFieldsTheApiNoLongerReads_IsAccepted()
    {
        HttpResponseMessage response = await _factory.CreateClient().PostAsJsonAsync("/Users/signup", new
        {
            fatecEmail = $"sonda{Guid.NewGuid():N}@aluno.cps.sp.gov.br",
            password = "SenhaForte123!",
            fullName = "Mariana Alves Rocha",
            nickname = "Mari",
            birthDate = "2000-01-01T00:00:00Z",
            gender = "Male",
            addresses = new[] { new { zipCode = "18040-430", street = "Rua Cesário Mota", streetNumber = "1", complement = "Casa", city = "Sorocaba", state = "SP" } },
            acceptances = new[]
            {
                new { document = "TermsOfUse", version = "2026-01-15" },
                new { document = "PrivacyPolicy", version = "2026-02-20" },
            },
        });

        string body = await response.Content.ReadAsStringAsync();

        Assert.True(response.StatusCode == HttpStatusCode.Created, $"status={response.StatusCode} body={body}");
    }

    [Fact]
    public async Task Signup_WithTheLoginEmailAlreadyRegistered_IsRejectedNamingTheLoginEmail()
    {
        string takenEmail = $"sonda{Guid.NewGuid():N}@aluno.cps.sp.gov.br";

        object payload = new
        {
            fatecEmail = takenEmail,
            password = "SenhaForte123!",
            fullName = "Mariana Alves Rocha",
            birthDate = "2000-01-01T00:00:00Z",
            gender = "Male",
            acceptances = new[]
            {
                new { document = "TermsOfUse", version = "2026-01-15" },
                new { document = "PrivacyPolicy", version = "2026-02-20" },
            },
        };

        (HttpStatusCode first, _) = await SignupAnswerFor(payload);

        Assert.Equal(HttpStatusCode.Created, first);

        (HttpStatusCode second, string? field) = await SignupAnswerFor(payload);

        Assert.Equal(HttpStatusCode.Conflict, second);
        Assert.Equal("fatecEmail", field);
    }

    [Fact]
    public async Task Signup_WithTheLoginEmailOfAnotherAccountInCapitalLetters_IsRejectedNamingTheLoginEmail()
    {
        (_, string takenEmail) = _factory.SeedUserWithPassword("Bruno Carvalho Souza", "SenhaForte123!");
        object payload = new
        {
            fatecEmail = takenEmail.ToUpperInvariant(),
            password = "SenhaForte123!",
            fullName = "Mariana Alves Rocha",
            birthDate = "2000-01-01T00:00:00Z",
            gender = "Male",
            acceptances = new[] { new { document = "TermsOfUse", version = "2026-01-15" } },
        };

        (HttpStatusCode status, string? field) = await SignupAnswerFor(payload);

        Assert.Equal(HttpStatusCode.Conflict, status);
        Assert.Equal("fatecEmail", field);
    }

    [Fact]
    public async Task Signup_ByWhoIsUnderage_IsRejected()
    {
        (HttpStatusCode statusCode, _) = await SignupAnswerFor(SignupPayload(BirthDateForAge(UnderageYears)));

        Assert.Equal(HttpStatusCode.BadRequest, statusCode);
    }
}
