using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using FateConnect.Api.Infrastructure.Database;
using FateConnect.Api.Modules.Auth.DTOs;
using FateConnect.Api.Modules.Users.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

namespace FateConnect.Api.Tests;

public class AccountStatusLoginTests(ApiFactory factory) : IClassFixture<ApiFactory>
{
    private const string KnownPassword = "SenhaForte123!";
    private const string WrongPassword = "OutraSenha456!";

    [Theory]
    [InlineData(KnownPassword)]
    [InlineData(WrongPassword)]
    public async Task Login_OfABannedAccount_IsForbiddenWhateverThePassword(string password)
    {
        (_, string fatecEmail) = factory.SeedUserWithPassword("Bruno Carvalho Souza", KnownPassword, EnumAccountStatus.Banned);

        HttpResponseMessage response = await PostAsync("/Auth/login", fatecEmail, password);

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    [Fact]
    public async Task Login_OfADeactivatedAccount_WithTheRightPassword_AnswersConflict()
    {
        (_, string fatecEmail) = factory.SeedUserWithPassword("Carla Dias Mendes", KnownPassword, EnumAccountStatus.SelfDeactivated);

        HttpResponseMessage response = await PostAsync("/Auth/login", fatecEmail, KnownPassword);

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
    }

    [Fact]
    public async Task Login_OfADeactivatedAccount_WithTheWrongPassword_IsRejectedAsInvalidCredentials()
    {
        (_, string fatecEmail) = factory.SeedUserWithPassword("Carla Dias Mendes", KnownPassword, EnumAccountStatus.SelfDeactivated);

        HttpResponseMessage response = await PostAsync("/Auth/login", fatecEmail, WrongPassword);

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task Reactivate_ADeactivatedAccount_WithTheRightPassword_ReopensTheAccount()
    {
        (int userId, string fatecEmail) = factory.SeedUserWithPassword("Carla Dias Mendes", KnownPassword, EnumAccountStatus.SelfDeactivated);

        HttpResponseMessage response = await PostAsync("/Auth/reactivate", fatecEmail, KnownPassword);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal(EnumAccountStatus.Active, await ReadStatusAsync(userId));

        TokenResponseDto body = (await response.Content.ReadFromJsonAsync<TokenResponseDto>())!;
        HttpClient authenticated = factory.CreateClient();
        authenticated.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", body.Token);

        Assert.Equal(HttpStatusCode.OK, (await authenticated.GetAsync("/Rides")).StatusCode);
        Assert.Equal(HttpStatusCode.OK, (await PostAsync("/Auth/login", fatecEmail, KnownPassword)).StatusCode);
    }

    [Fact]
    public async Task Reactivate_WithTheWrongPassword_IsRejectedAndKeepsTheAccountDeactivated()
    {
        (int userId, string fatecEmail) = factory.SeedUserWithPassword("Carla Dias Mendes", KnownPassword, EnumAccountStatus.SelfDeactivated);

        HttpResponseMessage response = await PostAsync("/Auth/reactivate", fatecEmail, WrongPassword);

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
        Assert.Equal(EnumAccountStatus.SelfDeactivated, await ReadStatusAsync(userId));
    }

    [Fact]
    public async Task Reactivate_ABannedAccount_IsForbiddenAndKeepsItBanned()
    {
        (int userId, string fatecEmail) = factory.SeedUserWithPassword("Bruno Carvalho Souza", KnownPassword, EnumAccountStatus.Banned);

        HttpResponseMessage response = await PostAsync("/Auth/reactivate", fatecEmail, KnownPassword);

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
        Assert.Equal(EnumAccountStatus.Banned, await ReadStatusAsync(userId));
    }

    [Fact]
    public async Task Reactivate_AnActiveAccount_AnswersATokenLikeTheLogin()
    {
        (int userId, string fatecEmail) = factory.SeedUserWithPassword("Mariana Alves Rocha", KnownPassword);

        HttpResponseMessage response = await PostAsync("/Auth/reactivate", fatecEmail, KnownPassword);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal(EnumAccountStatus.Active, await ReadStatusAsync(userId));
    }

    private Task<HttpResponseMessage> PostAsync(string route, string fatecEmail, string password) =>
        factory.CreateClient().PostAsJsonAsync(route, new { fatecEmail, password });

    private async Task<EnumAccountStatus> ReadStatusAsync(int userId)
    {
        using IServiceScope scope = factory.Services.CreateScope();
        FateConnectDbContext context = scope.ServiceProvider.GetRequiredService<FateConnectDbContext>();

        return await context.Users
            .Where(user => user.Id == userId)
            .Select(user => user.Status)
            .SingleAsync();
    }
}
