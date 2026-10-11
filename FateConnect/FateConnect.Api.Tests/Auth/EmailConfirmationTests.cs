using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using FateConnect.Api.Modules.Auth.DTOs;
using FateConnect.Api.Modules.Users.Enums;
using FateConnect.Api.Tests.Fixtures;

namespace FateConnect.Api.Tests.Auth;

public class EmailConfirmationTests(ApiFactory factory) : IClassFixture<ApiFactory>
{
    private const string KnownPassword = "SenhaForte123!";

    private static readonly TimeSpan ConfirmationLifetime = TimeSpan.FromHours(8);
    private static readonly TimeSpan ResendCooldown = TimeSpan.FromMinutes(1);

    private static async Task<string?> ErrorCodeOf(HttpResponseMessage response)
    {
        JsonElement body = JsonDocument.Parse(await response.Content.ReadAsStringAsync()).RootElement;

        return body.TryGetProperty("code", out JsonElement code) ? code.GetString() : null;
    }

    private static async Task<SentEmail> RequestConfirmationLinkAsync(ApiFactory api, string fatecEmail, int expectedCount = 1)
    {
        await api.CreateClient().PostAsJsonAsync("/Auth/resend-confirmation-email", new { fatecEmail });

        IReadOnlyList<SentEmail> sent = await api.Emails.WaitForAsync(fatecEmail, SentEmailKind.Confirmation, expectedCount);

        return sent[expectedCount - 1];
    }

    private static Task<HttpResponseMessage> ConfirmAsync(ApiFactory api, string token) =>
        api.CreateClient().PostAsJsonAsync("/Auth/confirm-email", new { token });

    [Fact]
    public async Task Login_OfAnUnconfirmedAccount_IsForbiddenNamingTheMissingConfirmation()
    {
        (_, string fatecEmail) = factory.SeedUserWithPassword("Lívia Moraes Prado", KnownPassword, emailConfirmed: false);

        HttpResponseMessage response = await factory.CreateClient()
            .PostAsJsonAsync("/Auth/login", new { fatecEmail, password = KnownPassword });

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
        Assert.Equal("EmailNotConfirmed", await ErrorCodeOf(response));
    }

    [Fact]
    public async Task Login_OfABannedAccount_IsForbiddenWithoutTheConfirmationCode()
    {
        (_, string fatecEmail) = factory.SeedUserWithPassword("Otávio Lins Barreto", KnownPassword, EnumAccountStatus.Banned);

        HttpResponseMessage response = await factory.CreateClient()
            .PostAsJsonAsync("/Auth/login", new { fatecEmail, password = KnownPassword });

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
        Assert.Null(await ErrorCodeOf(response));
    }

    [Fact]
    public async Task ConfirmEmail_WithTheLinkToken_AnswersATokenAndOpensTheLogin()
    {
        (_, string fatecEmail) = factory.SeedUserWithPassword("Lívia Moraes Prado", KnownPassword, emailConfirmed: false);
        SentEmail email = await RequestConfirmationLinkAsync(factory, fatecEmail);

        HttpResponseMessage confirmation = await ConfirmAsync(factory, email.Token);

        Assert.Equal(HttpStatusCode.OK, confirmation.StatusCode);

        TokenResponseDto body = (await confirmation.Content.ReadFromJsonAsync<TokenResponseDto>())!;
        HttpClient authenticated = factory.CreateClient();
        authenticated.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", body.Token);

        Assert.Equal(HttpStatusCode.NoContent, (await authenticated.GetAsync("/Auth/session")).StatusCode);

        HttpResponseMessage login = await factory.CreateClient()
            .PostAsJsonAsync("/Auth/login", new { fatecEmail, password = KnownPassword });

        Assert.Equal(HttpStatusCode.OK, login.StatusCode);
    }

    [Fact]
    public async Task ConfirmEmail_WithATokenAlreadyUsed_IsRejected()
    {
        (_, string fatecEmail) = factory.SeedUserWithPassword("Lívia Moraes Prado", KnownPassword, emailConfirmed: false);
        SentEmail email = await RequestConfirmationLinkAsync(factory, fatecEmail);

        await ConfirmAsync(factory, email.Token);
        HttpResponseMessage second = await ConfirmAsync(factory, email.Token);

        Assert.Equal(HttpStatusCode.BadRequest, second.StatusCode);
    }

    [Fact]
    public async Task ConfirmEmail_AfterTheLinkExpires_IsRejectedAndKeepsTheLoginClosed()
    {
        MovableTimeProvider clock = new(DateTimeOffset.UtcNow);
        using ApiFactory api = new() { Clock = clock };
        (_, string fatecEmail) = api.SeedUserWithPassword("Lívia Moraes Prado", KnownPassword, emailConfirmed: false);
        SentEmail email = await RequestConfirmationLinkAsync(api, fatecEmail);

        clock.Now += ConfirmationLifetime + TimeSpan.FromMinutes(1);
        HttpResponseMessage confirmation = await ConfirmAsync(api, email.Token);

        Assert.Equal(HttpStatusCode.BadRequest, confirmation.StatusCode);

        HttpResponseMessage login = await api.CreateClient()
            .PostAsJsonAsync("/Auth/login", new { fatecEmail, password = KnownPassword });

        Assert.Equal(HttpStatusCode.Forbidden, login.StatusCode);
    }

    [Theory]
    [InlineData("token-que-nunca-existiu")]
    [InlineData("")]
    public async Task ConfirmEmail_WithATokenThatDoesNotExist_IsRejected(string token)
    {
        HttpResponseMessage confirmation = await ConfirmAsync(factory, token);

        Assert.Equal(HttpStatusCode.BadRequest, confirmation.StatusCode);
    }

    [Fact]
    public async Task ConfirmEmail_WithAPasswordResetToken_IsRejectedAsAnInvalidLink()
    {
        (_, string fatecEmail) = factory.SeedUserWithPassword("Lívia Moraes Prado", KnownPassword);

        await factory.CreateClient().PostAsJsonAsync("/Auth/forgot-password", new { fatecEmail });
        IReadOnlyList<SentEmail> reset = await factory.Emails.WaitForAsync(fatecEmail, SentEmailKind.PasswordReset);

        HttpResponseMessage confirmation = await ConfirmAsync(factory, reset[0].Token);

        Assert.Equal(HttpStatusCode.BadRequest, confirmation.StatusCode);
    }

    [Fact]
    public async Task ConfirmEmail_OfAnAccountBannedBeforeConfirming_IsForbidden()
    {
        (int userId, string fatecEmail) = factory.SeedUserWithPassword("Lívia Moraes Prado", KnownPassword, emailConfirmed: false);
        SentEmail email = await RequestConfirmationLinkAsync(factory, fatecEmail);

        factory.SetAccountStatus(userId, EnumAccountStatus.Banned);
        HttpResponseMessage confirmation = await ConfirmAsync(factory, email.Token);

        Assert.Equal(HttpStatusCode.Forbidden, confirmation.StatusCode);
    }

    [Fact]
    public async Task ResendConfirmation_WithinTheCooldown_SendsNothingNew()
    {
        (_, string fatecEmail) = factory.SeedUserWithPassword("Lívia Moraes Prado", KnownPassword, emailConfirmed: false);
        await RequestConfirmationLinkAsync(factory, fatecEmail);

        HttpResponseMessage again = await factory.CreateClient()
            .PostAsJsonAsync("/Auth/resend-confirmation-email", new { fatecEmail });

        Assert.Equal(HttpStatusCode.NoContent, again.StatusCode);
        Assert.Equal(1, factory.TokenCountOf(fatecEmail, EnumTokenType.EmailConfirmation));
    }

    [Fact]
    public async Task ResendConfirmation_AfterTheCooldown_SendsANewLinkAndRetiresTheOldOne()
    {
        MovableTimeProvider clock = new(DateTimeOffset.UtcNow);
        using ApiFactory api = new() { Clock = clock };
        (_, string fatecEmail) = api.SeedUserWithPassword("Lívia Moraes Prado", KnownPassword, emailConfirmed: false);
        SentEmail first = await RequestConfirmationLinkAsync(api, fatecEmail);

        clock.Now += ResendCooldown + TimeSpan.FromSeconds(1);
        SentEmail second = await RequestConfirmationLinkAsync(api, fatecEmail, expectedCount: 2);

        Assert.Equal(HttpStatusCode.BadRequest, (await ConfirmAsync(api, first.Token)).StatusCode);
        Assert.Equal(HttpStatusCode.OK, (await ConfirmAsync(api, second.Token)).StatusCode);
    }

    [Fact]
    public async Task ResendConfirmation_ForAnUnknownOrConfirmedEmail_AnswersTheSameAndSendsNothing()
    {
        string unknownEmail = $"ninguem{Guid.NewGuid():N}@aluno.cps.sp.gov.br";
        (_, string confirmedEmail) = factory.SeedUserWithPassword("Lívia Moraes Prado", KnownPassword);

        HttpResponseMessage unknown = await factory.CreateClient()
            .PostAsJsonAsync("/Auth/resend-confirmation-email", new { fatecEmail = unknownEmail });
        HttpResponseMessage confirmed = await factory.CreateClient()
            .PostAsJsonAsync("/Auth/resend-confirmation-email", new { fatecEmail = confirmedEmail });

        Assert.Equal(HttpStatusCode.NoContent, unknown.StatusCode);
        Assert.Equal(HttpStatusCode.NoContent, confirmed.StatusCode);
        Assert.Equal(0, factory.TokenCountOf(confirmedEmail, EnumTokenType.EmailConfirmation));
    }
}
