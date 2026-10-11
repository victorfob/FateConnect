using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using FateConnect.Api.Modules.Auth.DTOs;
using FateConnect.Api.Modules.Users.Enums;
using FateConnect.Api.Tests.Fixtures;

namespace FateConnect.Api.Tests.Auth;

public class PasswordResetTests(ApiFactory factory) : IClassFixture<ApiFactory>
{
    private const string KnownPassword = "SenhaForte123!";
    private const string NewPassword = "NovaSenha456!";

    private static readonly TimeSpan ResetLifetime = TimeSpan.FromMinutes(30);
    private static readonly TimeSpan ResendCooldown = TimeSpan.FromMinutes(1);

    private static async Task<SentEmail> RequestResetLinkAsync(ApiFactory api, string fatecEmail, int expectedCount = 1)
    {
        await api.CreateClient().PostAsJsonAsync("/Auth/forgot-password", new { fatecEmail });

        IReadOnlyList<SentEmail> sent = await api.Emails.WaitForAsync(fatecEmail, SentEmailKind.PasswordReset, expectedCount);

        return sent[expectedCount - 1];
    }

    private static Task<HttpResponseMessage> ResetAsync(ApiFactory api, string token, string newPassword = NewPassword) =>
        api.CreateClient().PostAsJsonAsync("/Auth/reset-password", new { token, newPassword });

    private static Task<HttpResponseMessage> LoginAsync(ApiFactory api, string fatecEmail, string password) =>
        api.CreateClient().PostAsJsonAsync("/Auth/login", new { fatecEmail, password });

    private static async Task<HttpClient> ClientWithTokenFrom(ApiFactory api, HttpResponseMessage response)
    {
        TokenResponseDto body = (await response.Content.ReadFromJsonAsync<TokenResponseDto>())!;
        HttpClient client = api.CreateClient();
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", body.Token);

        return client;
    }

    [Fact]
    public async Task ForgotPassword_ForAnEmailWithoutAccount_AnswersNotFound()
    {
        HttpResponseMessage response = await factory.CreateClient().PostAsJsonAsync(
            "/Auth/forgot-password",
            new { fatecEmail = $"ninguem{Guid.NewGuid():N}@aluno.cps.sp.gov.br" });

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task ForgotPassword_SendsTheLinkToTheLoginEmail()
    {
        (_, string fatecEmail) = factory.SeedUserWithPassword("Renato Faria Campos", KnownPassword);

        SentEmail email = await RequestResetLinkAsync(factory, fatecEmail);

        Assert.StartsWith("https://fateconnect.test/redefinir-senha?", email.Link);
        Assert.Equal(HttpStatusCode.NoContent, (await factory.CreateClient()
            .GetAsync($"/Auth/verify-reset-token?token={email.Token}")).StatusCode);
    }

    [Fact]
    public async Task ForgotPassword_OfABannedAccount_AnswersLikeAnyAccountAndSendsNothing()
    {
        (_, string fatecEmail) = factory.SeedUserWithPassword("Renato Faria Campos", KnownPassword, EnumAccountStatus.Banned);

        HttpResponseMessage response = await factory.CreateClient()
            .PostAsJsonAsync("/Auth/forgot-password", new { fatecEmail });

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        Assert.Equal(0, factory.TokenCountOf(fatecEmail, EnumTokenType.PasswordReset));
    }

    [Fact]
    public async Task ForgotPassword_WithinTheCooldown_SendsNothingNew()
    {
        (_, string fatecEmail) = factory.SeedUserWithPassword("Renato Faria Campos", KnownPassword);
        await RequestResetLinkAsync(factory, fatecEmail);

        HttpResponseMessage again = await factory.CreateClient()
            .PostAsJsonAsync("/Auth/forgot-password", new { fatecEmail });

        Assert.Equal(HttpStatusCode.NoContent, again.StatusCode);
        Assert.Equal(1, factory.TokenCountOf(fatecEmail, EnumTokenType.PasswordReset));
    }

    [Fact]
    public async Task ForgotPassword_AfterTheCooldown_RetiresTheOldLink()
    {
        MovableTimeProvider clock = new(DateTimeOffset.UtcNow);
        using ApiFactory api = new() { Clock = clock };
        (_, string fatecEmail) = api.SeedUserWithPassword("Renato Faria Campos", KnownPassword);
        SentEmail first = await RequestResetLinkAsync(api, fatecEmail);

        clock.Now += ResendCooldown + TimeSpan.FromSeconds(1);
        SentEmail second = await RequestResetLinkAsync(api, fatecEmail, expectedCount: 2);

        Assert.Equal(HttpStatusCode.BadRequest, (await ResetAsync(api, first.Token)).StatusCode);
        Assert.Equal(HttpStatusCode.OK, (await ResetAsync(api, second.Token)).StatusCode);
    }

    [Fact]
    public async Task VerifyResetToken_WithATokenThatDoesNotExist_IsRejected()
    {
        HttpResponseMessage response = await factory.CreateClient().GetAsync("/Auth/verify-reset-token?token=inexistente");

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task ResetPassword_WithTheLink_LetsOnlyTheNewPasswordInAndEndsTheOpenSessions()
    {
        (_, string fatecEmail) = factory.SeedUserWithPassword("Renato Faria Campos", KnownPassword);
        HttpClient openSession = await ClientWithTokenFrom(factory, await LoginAsync(factory, fatecEmail, KnownPassword));
        SentEmail email = await RequestResetLinkAsync(factory, fatecEmail);

        HttpResponseMessage reset = await ResetAsync(factory, email.Token);

        Assert.Equal(HttpStatusCode.OK, reset.StatusCode);
        Assert.Equal(HttpStatusCode.NoContent, (await (await ClientWithTokenFrom(factory, reset)).GetAsync("/Auth/session")).StatusCode);
        Assert.Equal(HttpStatusCode.Unauthorized, (await openSession.GetAsync("/Auth/session")).StatusCode);
        Assert.Equal(HttpStatusCode.OK, (await LoginAsync(factory, fatecEmail, NewPassword)).StatusCode);
        Assert.Equal(HttpStatusCode.Unauthorized, (await LoginAsync(factory, fatecEmail, KnownPassword)).StatusCode);
    }

    [Fact]
    public async Task ResetPassword_TwiceWithTheSameLink_IsRejected()
    {
        (_, string fatecEmail) = factory.SeedUserWithPassword("Renato Faria Campos", KnownPassword);
        SentEmail email = await RequestResetLinkAsync(factory, fatecEmail);

        await ResetAsync(factory, email.Token);
        HttpResponseMessage second = await ResetAsync(factory, email.Token, "OutraSenha789!");

        Assert.Equal(HttpStatusCode.BadRequest, second.StatusCode);
        Assert.Equal(HttpStatusCode.OK, (await LoginAsync(factory, fatecEmail, NewPassword)).StatusCode);
    }

    [Fact]
    public async Task ResetPassword_AfterTheLinkExpires_IsRejectedAndKeepsThePassword()
    {
        MovableTimeProvider clock = new(DateTimeOffset.UtcNow);
        using ApiFactory api = new() { Clock = clock };
        (_, string fatecEmail) = api.SeedUserWithPassword("Renato Faria Campos", KnownPassword);
        SentEmail email = await RequestResetLinkAsync(api, fatecEmail);

        clock.Now += ResetLifetime + TimeSpan.FromMinutes(1);

        Assert.Equal(HttpStatusCode.BadRequest, (await ResetAsync(api, email.Token)).StatusCode);
        Assert.Equal(HttpStatusCode.OK, (await LoginAsync(api, fatecEmail, KnownPassword)).StatusCode);
    }

    [Fact]
    public async Task ResetPassword_OfAnAccountBannedAfterTheRequest_IsForbiddenAndKeepsThePassword()
    {
        (int userId, string fatecEmail) = factory.SeedUserWithPassword("Renato Faria Campos", KnownPassword);
        SentEmail email = await RequestResetLinkAsync(factory, fatecEmail);

        factory.SetAccountStatus(userId, EnumAccountStatus.Banned);
        HttpResponseMessage reset = await ResetAsync(factory, email.Token);

        Assert.Equal(HttpStatusCode.Forbidden, reset.StatusCode);

        factory.SetAccountStatus(userId, EnumAccountStatus.Active);

        Assert.Equal(HttpStatusCode.OK, (await LoginAsync(factory, fatecEmail, KnownPassword)).StatusCode);
    }

    [Fact]
    public async Task ResetPassword_OfADeactivatedAccount_ChangesThePasswordAndSendsItToReactivation()
    {
        (_, string fatecEmail) = factory.SeedUserWithPassword("Renato Faria Campos", KnownPassword, EnumAccountStatus.SelfDeactivated);
        SentEmail email = await RequestResetLinkAsync(factory, fatecEmail);

        HttpResponseMessage reset = await ResetAsync(factory, email.Token);

        Assert.Equal(HttpStatusCode.Conflict, reset.StatusCode);

        HttpResponseMessage reactivation = await factory.CreateClient()
            .PostAsJsonAsync("/Auth/reactivate", new { fatecEmail, password = NewPassword });

        Assert.Equal(HttpStatusCode.OK, reactivation.StatusCode);
    }

    [Fact]
    public async Task ResetPassword_OfAnUnconfirmedAccount_ConfirmsTheEmail()
    {
        (_, string fatecEmail) = factory.SeedUserWithPassword("Renato Faria Campos", KnownPassword, emailConfirmed: false);
        SentEmail email = await RequestResetLinkAsync(factory, fatecEmail);

        await ResetAsync(factory, email.Token);

        Assert.Equal(HttpStatusCode.OK, (await LoginAsync(factory, fatecEmail, NewPassword)).StatusCode);
    }
}
