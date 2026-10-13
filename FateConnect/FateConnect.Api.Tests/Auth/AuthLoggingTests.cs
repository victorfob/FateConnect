using System.Net;
using System.Net.Http.Json;
using FateConnect.Api.Modules.Users.Enums;
using FateConnect.Api.Tests.Fixtures;
using Microsoft.Extensions.Logging.Testing;

namespace FateConnect.Api.Tests.Auth;

public class AuthLoggingTests(ApiFactory factory) : IClassFixture<ApiFactory>
{
    private const string KnownPassword = "SenhaForte123!";

    private Task<HttpResponseMessage> LoginAsync(string fatecEmail, string password) =>
        factory.CreateClient().PostAsJsonAsync("/Auth/login", new { fatecEmail, password });

    private Task<HttpResponseMessage> RequestPasswordResetAsync(string fatecEmail) =>
        factory.CreateClient().PostAsJsonAsync("/Auth/forgot-password", new { fatecEmail });

    [Fact]
    public async Task Login_WithAWrongPassword_LogsTheRefusalWithTheId()
    {
        (int userId, string fatecEmail) = factory.SeedUserWithPassword("Renata Moura Salles", KnownPassword);

        HttpResponseMessage response = await LoginAsync(fatecEmail, "SenhaErrada123!");

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
        Assert.Contains($"Login refused for user ID {userId}: WrongPassword.", factory.LogMessages);
    }

    [Fact]
    public async Task ALogOfTheRequest_CarriesTheRequestIdentifier()
    {
        (int userId, string fatecEmail) = factory.SeedUserWithPassword("Davi Soares Pacheco", KnownPassword);

        await LoginAsync(fatecEmail, "SenhaErrada123!");

        FakeLogRecord refusal = factory.LogRecords.Single(record => record.Message == $"Login refused for user ID {userId}: WrongPassword.");
        Assert.Contains(refusal.Scopes.OfType<IEnumerable<KeyValuePair<string, object?>>>().SelectMany(scope => scope),
            entry => entry.Key == "RequestId" && entry.Value is string { Length: > 0 });
    }

    [Fact]
    public async Task Login_OfABannedAccount_LogsTheRefusalWithTheId()
    {
        (int userId, string fatecEmail) = factory.SeedUserWithPassword("Sérgio Antunes Brito", KnownPassword, EnumAccountStatus.Banned);

        HttpResponseMessage response = await LoginAsync(fatecEmail, KnownPassword);

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
        Assert.Contains($"Login refused for user ID {userId}: Banned.", factory.LogMessages);
    }

    [Fact]
    public async Task Login_WithAnEmailWithoutAccount_LogsTheRefusalWithoutTheEmail()
    {
        string fatecEmail = $"{Guid.NewGuid():N}@aluno.cps.sp.gov.br";

        await LoginAsync(fatecEmail, KnownPassword);

        Assert.Contains("Login refused: no account for the email.", factory.LogMessages);
        Assert.DoesNotContain(factory.LogMessages, message => message.Contains(fatecEmail, StringComparison.OrdinalIgnoreCase));
    }

    [Fact]
    public async Task Login_ThatSucceeds_LogsNoRefusal()
    {
        (int userId, string fatecEmail) = factory.SeedUserWithPassword("Tânia Bezerra Lopes", KnownPassword);

        HttpResponseMessage response = await LoginAsync(fatecEmail, KnownPassword);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Contains($"User ID {userId} successfully started a new session.", factory.LogMessages);
        Assert.DoesNotContain(factory.LogMessages, message => message.StartsWith($"Login refused for user ID {userId}:", StringComparison.Ordinal));
    }

    [Fact]
    public async Task ForgotPassword_TwiceInARow_LogsTheSecondAsSkipped()
    {
        (int userId, string fatecEmail) = factory.SeedUserWithPassword("Ulisses Prado Viana", KnownPassword);

        await RequestPasswordResetAsync(fatecEmail);
        await RequestPasswordResetAsync(fatecEmail);

        Assert.Contains($"User ID {userId} requested a password reset link.", factory.LogMessages);
        Assert.Contains($"PasswordReset link request skipped for user ID {userId}: Cooldown.", factory.LogMessages);
    }

    [Fact]
    public async Task ForgotPassword_OfABannedAccount_LogsItAsSkipped()
    {
        (int userId, string fatecEmail) = factory.SeedUserWithPassword("Valéria Guedes Pinto", KnownPassword, EnumAccountStatus.Banned);

        await RequestPasswordResetAsync(fatecEmail);

        Assert.Contains($"PasswordReset link request skipped for user ID {userId}: Banned.", factory.LogMessages);
    }

    [Fact]
    public async Task ResendConfirmation_OfAConfirmedAccount_LogsItAsSkipped()
    {
        (int userId, string fatecEmail) = factory.SeedUserWithPassword("Wesley Barros Lima", KnownPassword);

        await factory.CreateClient().PostAsJsonAsync("/Auth/resend-confirmation-email", new { fatecEmail });

        Assert.Contains($"EmailConfirmation link request skipped for user ID {userId}: AlreadyConfirmed.", factory.LogMessages);
    }

    [Fact]
    public async Task ARequestWithASessionAlreadyEnded_LogsTheRefusedToken()
    {
        int userId = factory.SeedUser("Xavier Ramos Coelho").Id;
        HttpClient client = factory.CreateClientFor(userId);
        await client.PostAsync("/Auth/logout", null);

        HttpResponseMessage response = await client.GetAsync("/Users/me");

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
        Assert.Contains($"Token refused for user ID {userId}: its session was ended.", factory.LogMessages);
    }
}
