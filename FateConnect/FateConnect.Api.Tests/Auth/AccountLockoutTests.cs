using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using FateConnect.Api.Modules.Users.Enums;
using FateConnect.Api.Tests.Fixtures;

namespace FateConnect.Api.Tests.Auth;

public class AccountLockoutTests(ApiFactory factory) : IClassFixture<ApiFactory>
{
    private const string KnownPassword = "SenhaForte123!";
    private const string WrongPassword = "OutraSenha456!";

    private static readonly TimeSpan LockDuration = TimeSpan.FromMinutes(30);

    private static Task<HttpResponseMessage> LoginAsync(ApiFactory api, string fatecEmail, string password) =>
        api.CreateClient().PostAsJsonAsync("/Auth/login", new { fatecEmail, password });

    private static async Task LockAsync(ApiFactory api, string fatecEmail)
    {
        for (int attempt = 0; attempt < 3; attempt++)
            await LoginAsync(api, fatecEmail, WrongPassword);
    }

    private static async Task<JsonElement> BodyOf(HttpResponseMessage response) =>
        JsonDocument.Parse(await response.Content.ReadAsStringAsync()).RootElement;

    [Fact]
    public async Task Login_WithTwoWrongPasswords_DoesNotLockAndTheRightOneStartsTheCountOver()
    {
        (_, string fatecEmail) = factory.SeedUserWithPassword("Helena Duarte Pires", KnownPassword);

        Assert.Equal(HttpStatusCode.Unauthorized, (await LoginAsync(factory, fatecEmail, WrongPassword)).StatusCode);
        Assert.Equal(HttpStatusCode.Unauthorized, (await LoginAsync(factory, fatecEmail, WrongPassword)).StatusCode);
        Assert.Equal(HttpStatusCode.OK, (await LoginAsync(factory, fatecEmail, KnownPassword)).StatusCode);
        Assert.Equal(HttpStatusCode.Unauthorized, (await LoginAsync(factory, fatecEmail, WrongPassword)).StatusCode);
        Assert.Equal(HttpStatusCode.Unauthorized, (await LoginAsync(factory, fatecEmail, WrongPassword)).StatusCode);
    }

    [Fact]
    public async Task Login_WithTheThirdWrongPassword_LocksAndSaysHowLongTheLockLasts()
    {
        (_, string fatecEmail) = factory.SeedUserWithPassword("Helena Duarte Pires", KnownPassword);
        await LoginAsync(factory, fatecEmail, WrongPassword);
        await LoginAsync(factory, fatecEmail, WrongPassword);

        HttpResponseMessage third = await LoginAsync(factory, fatecEmail, WrongPassword);
        JsonElement body = await BodyOf(third);

        Assert.Equal(HttpStatusCode.TooManyRequests, third.StatusCode);
        Assert.Equal("AccountLocked", body.GetProperty("code").GetString());
        Assert.Equal(30, body.GetProperty("minutesRemaining").GetInt32());
        Assert.Equal(
            "Conta bloqueada por 3 senhas erradas. Use o link enviado ao e-mail Fatec ou tente de novo daqui a 30 minutos.",
            body.GetProperty("error").GetString());
    }

    [Fact]
    public async Task Login_DuringTheLock_RefusesEvenTheRightPassword()
    {
        (_, string fatecEmail) = factory.SeedUserWithPassword("Helena Duarte Pires", KnownPassword);
        await LockAsync(factory, fatecEmail);

        Assert.Equal(HttpStatusCode.TooManyRequests, (await LoginAsync(factory, fatecEmail, KnownPassword)).StatusCode);
    }

    [Fact]
    public async Task Reactivate_CountsTowardsTheLockLikeTheLogin()
    {
        (_, string fatecEmail) = factory.SeedUserWithPassword("Helena Duarte Pires", KnownPassword, EnumAccountStatus.SelfDeactivated);
        await LoginAsync(factory, fatecEmail, WrongPassword);
        await LoginAsync(factory, fatecEmail, WrongPassword);

        HttpResponseMessage reactivation = await factory.CreateClient()
            .PostAsJsonAsync("/Auth/reactivate", new { fatecEmail, password = WrongPassword });

        Assert.Equal(HttpStatusCode.TooManyRequests, reactivation.StatusCode);
    }

    [Fact]
    public async Task Lock_SendsOneUnlockEmailPerLock()
    {
        (_, string fatecEmail) = factory.SeedUserWithPassword("Helena Duarte Pires", KnownPassword);
        await LockAsync(factory, fatecEmail);
        await LoginAsync(factory, fatecEmail, WrongPassword);
        await LoginAsync(factory, fatecEmail, KnownPassword);

        SentEmail email = Assert.Single(await factory.Emails.WaitForAsync(fatecEmail, SentEmailKind.AccountLocked));

        Assert.StartsWith("https://fateconnect.test/desbloquear-conta?", email.Link);
        Assert.Equal(1, factory.TokenCountOf(fatecEmail, EnumTokenType.AccountUnlock));
    }

    [Fact]
    public async Task Unlock_WithTheLink_OpensTheLoginAndServesOnlyOnce()
    {
        (_, string fatecEmail) = factory.SeedUserWithPassword("Helena Duarte Pires", KnownPassword);
        await LockAsync(factory, fatecEmail);
        IReadOnlyList<SentEmail> sent = await factory.Emails.WaitForAsync(fatecEmail, SentEmailKind.AccountLocked);

        HttpResponseMessage unlock = await factory.CreateClient().PostAsJsonAsync("/Auth/unlock", new { token = sent[0].Token });
        HttpResponseMessage again = await factory.CreateClient().PostAsJsonAsync("/Auth/unlock", new { token = sent[0].Token });

        Assert.Equal(HttpStatusCode.NoContent, unlock.StatusCode);
        Assert.Equal(HttpStatusCode.BadRequest, again.StatusCode);
        Assert.Equal(HttpStatusCode.OK, (await LoginAsync(factory, fatecEmail, KnownPassword)).StatusCode);
    }

    [Fact]
    public async Task Unlock_WithATokenThatDoesNotExist_IsRejected()
    {
        HttpResponseMessage unlock = await factory.CreateClient().PostAsJsonAsync("/Auth/unlock", new { token = "inexistente" });

        Assert.Equal(HttpStatusCode.BadRequest, unlock.StatusCode);
    }

    [Fact]
    public async Task Lock_AfterThirtyMinutes_OpensByItselfAndStartsTheCountOver()
    {
        MovableTimeProvider clock = new(DateTimeOffset.UtcNow);
        using ApiFactory api = new() { Clock = clock };
        (_, string fatecEmail) = api.SeedUserWithPassword("Helena Duarte Pires", KnownPassword);
        await LockAsync(api, fatecEmail);

        clock.Now += LockDuration + TimeSpan.FromSeconds(1);

        Assert.Equal(HttpStatusCode.Unauthorized, (await LoginAsync(api, fatecEmail, WrongPassword)).StatusCode);
        Assert.Equal(HttpStatusCode.OK, (await LoginAsync(api, fatecEmail, KnownPassword)).StatusCode);
    }

    [Fact]
    public async Task Lock_WithLessThanAMinuteLeft_SaysOneMinute()
    {
        MovableTimeProvider clock = new(DateTimeOffset.UtcNow);
        using ApiFactory api = new() { Clock = clock };
        (_, string fatecEmail) = api.SeedUserWithPassword("Helena Duarte Pires", KnownPassword);
        await LockAsync(api, fatecEmail);

        clock.Now += LockDuration - TimeSpan.FromSeconds(30);
        JsonElement body = await BodyOf(await LoginAsync(api, fatecEmail, KnownPassword));

        Assert.Equal(1, body.GetProperty("minutesRemaining").GetInt32());
        Assert.EndsWith("tente de novo daqui a 1 minuto.", body.GetProperty("error").GetString());
    }

    [Fact]
    public async Task Unlock_AfterTheLockEnds_IsRejectedAsExpired()
    {
        MovableTimeProvider clock = new(DateTimeOffset.UtcNow);
        using ApiFactory api = new() { Clock = clock };
        (_, string fatecEmail) = api.SeedUserWithPassword("Helena Duarte Pires", KnownPassword);
        await LockAsync(api, fatecEmail);
        IReadOnlyList<SentEmail> sent = await api.Emails.WaitForAsync(fatecEmail, SentEmailKind.AccountLocked);

        clock.Now += LockDuration + TimeSpan.FromMinutes(1);
        HttpResponseMessage unlock = await api.CreateClient().PostAsJsonAsync("/Auth/unlock", new { token = sent[0].Token });

        Assert.Equal(HttpStatusCode.BadRequest, unlock.StatusCode);
    }
}
