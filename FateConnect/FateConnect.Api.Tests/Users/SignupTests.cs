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

    private static object SignupPayload(string phone, string contactEmail, string? birthDate = null) => new
    {
        fatecEmail = $"sonda{Guid.NewGuid():N}@aluno.cps.sp.gov.br",
        password = "SenhaForte123!",
        fullName = "Mariana Alves Rocha",
        birthDate = birthDate ?? "2000-01-01T00:00:00Z",
        gender = "Male",
        phone,
        contactEmail,
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

    [Fact]
    public async Task Signup_WithAPhoneAndAContactEmail_IsAccepted()
    {
        HttpResponseMessage response = await _factory.CreateClient().PostAsJsonAsync(
            "/Users/signup",
            SignupPayload(ApiFactory.UniquePhone(), ApiFactory.UniqueContactEmail()));

        string body = await response.Content.ReadAsStringAsync();

        Assert.True(response.StatusCode == HttpStatusCode.Created, $"status={response.StatusCode} body={body}");
    }

    [Fact]
    public async Task Signup_WithAPhoneAndAContactEmail_AnswersATokenThatOpensTheApi()
    {
        HttpResponseMessage signup = await _factory.CreateClient().PostAsJsonAsync(
            "/Users/signup",
            SignupPayload(ApiFactory.UniquePhone(), ApiFactory.UniqueContactEmail()));

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

    [Theory]
    [InlineData("", "mariana.rocha@gmail.com")]
    [InlineData("15998765432", "")]
    public async Task Signup_WithAnEmptyContactField_IsRejected(string phone, string contactEmail)
    {
        HttpResponseMessage response = await _factory.CreateClient()
            .PostAsJsonAsync("/Users/signup", SignupPayload(phone, contactEmail));

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task Signup_WithTheContactListOfThePreviousContract_IsRejected()
    {
        HttpResponseMessage response = await _factory.CreateClient().PostAsJsonAsync("/Users/signup", new
        {
            fatecEmail = $"sonda{Guid.NewGuid():N}@aluno.cps.sp.gov.br",
            password = "SenhaForte123!",
            fullName = "Mariana Alves Rocha",
            birthDate = "2000-01-01T00:00:00Z",
            gender = "Male",
            contacts = new[] { new { phone = ApiFactory.UniquePhone(), contactEmail = ApiFactory.UniqueContactEmail() } },
            acceptances = new[]
            {
                new { document = "TermsOfUse", version = "2026-01-15" },
                new { document = "PrivacyPolicy", version = "2026-02-20" },
            },
        });

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task Signup_WithoutTheContactFields_IsRejected()
    {
        HttpResponseMessage response = await _factory.CreateClient().PostAsJsonAsync("/Users/signup", new
        {
            fatecEmail = $"sonda{Guid.NewGuid():N}@aluno.cps.sp.gov.br",
            password = "SenhaForte123!",
            fullName = "Mariana Alves Rocha",
            birthDate = "2000-01-01T00:00:00Z",
            gender = "Male",
        });

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
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
            phone = ApiFactory.UniquePhone(),
            contactEmail = ApiFactory.UniqueContactEmail(),
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
    public async Task Signup_WithAPhoneAlreadyRegistered_IsRejectedNamingThePhone()
    {
        string takenPhone = ApiFactory.UniquePhone();

        (HttpStatusCode first, _) = await SignupAnswerFor(SignupPayload(takenPhone, ApiFactory.UniqueContactEmail()));

        Assert.Equal(HttpStatusCode.Created, first);

        (HttpStatusCode second, string? field) = await SignupAnswerFor(SignupPayload(takenPhone, ApiFactory.UniqueContactEmail()));

        Assert.Equal(HttpStatusCode.Conflict, second);
        Assert.Equal("phone", field);
    }

    [Fact]
    public async Task Signup_WithAContactEmailAlreadyRegistered_IsRejectedNamingTheContactEmail()
    {
        string takenEmail = ApiFactory.UniqueContactEmail();

        (HttpStatusCode first, _) = await SignupAnswerFor(SignupPayload(ApiFactory.UniquePhone(), takenEmail));

        Assert.Equal(HttpStatusCode.Created, first);

        (HttpStatusCode second, string? field) = await SignupAnswerFor(SignupPayload(ApiFactory.UniquePhone(), takenEmail));

        Assert.Equal(HttpStatusCode.Conflict, second);
        Assert.Equal("contactEmail", field);
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
            phone,
            contactEmail,
            acceptances = new[]
            {
                new { document = "TermsOfUse", version = "2026-01-15" },
                new { document = "PrivacyPolicy", version = "2026-02-20" },
            },
        };

        (HttpStatusCode first, _) = await SignupAnswerFor(
            PayloadFor(ApiFactory.UniquePhone(), ApiFactory.UniqueContactEmail()));

        Assert.Equal(HttpStatusCode.Created, first);

        (HttpStatusCode second, string? field) = await SignupAnswerFor(
            PayloadFor(ApiFactory.UniquePhone(), ApiFactory.UniqueContactEmail()));

        Assert.Equal(HttpStatusCode.Conflict, second);
        Assert.Equal("fatecEmail", field);
    }

    [Fact]
    public async Task Signup_ByWhoIsUnderage_IsRejected()
    {
        (HttpStatusCode statusCode, _) = await SignupAnswerFor(SignupPayload(
            ApiFactory.UniquePhone(),
            ApiFactory.UniqueContactEmail(),
            BirthDateForAge(UnderageYears)));

        Assert.Equal(HttpStatusCode.BadRequest, statusCode);
    }
}
