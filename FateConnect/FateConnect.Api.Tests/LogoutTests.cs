using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using FateConnect.Api.Modules.Auth.DTOs;

namespace FateConnect.Api.Tests;

public class LogoutTests : IClassFixture<ApiFactory>
{
    private const string LogoutRoute = "/Auth/logout";
    private const string SessionRoute = "/Auth/session";
    private const int VersionAfterOneLogout = 1;
    private const string KnownPassword = "SenhaForte123!";

    private readonly ApiFactory _factory;

    public LogoutTests(ApiFactory factory)
    {
        _factory = factory;
    }

    [Fact]
    public async Task Logout_WithoutToken_RespondsUnauthorized()
    {
        HttpResponseMessage response = await _factory.CreateClient().PostAsync(LogoutRoute, null);

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task Logout_WithAValidToken_RespondsNoContent()
    {
        HttpClient client = _factory.CreateClientForNewUser("Mariana Alves Rocha");

        HttpResponseMessage response = await client.PostAsync(LogoutRoute, null);

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
    }

    [Fact]
    public async Task Session_WithTheSameToken_IsAcceptedBeforeLogout()
    {
        HttpClient client = _factory.CreateClientForNewUser("Bruno Carvalho Souza");

        HttpResponseMessage response = await client.GetAsync(SessionRoute);

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
    }

    [Fact]
    public async Task Session_WithTheSameToken_IsRefusedAfterLogout()
    {
        HttpClient client = _factory.CreateClientForNewUser("Ana Beatriz Nogueira");
        await client.PostAsync(LogoutRoute, null);

        HttpResponseMessage response = await client.GetAsync(SessionRoute);

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task Session_WithAnotherTokenOfTheSamePerson_IsRefusedAfterLogout()
    {
        SeededUser person = _factory.SeedUser("Carla Ribeiro Matos");
        HttpClient laptop = _factory.CreateClientFor(person.Id);
        HttpClient phone = _factory.CreateClientFor(person.Id);
        await phone.PostAsync(LogoutRoute, null);

        HttpResponseMessage response = await laptop.GetAsync(SessionRoute);

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task Session_WithATokenIssuedAfterLogout_IsAccepted()
    {
        SeededUser person = _factory.SeedUser("Diego Nunes Peixoto");
        await _factory.CreateClientFor(person.Id).PostAsync(LogoutRoute, null);

        HttpClient afterSigningInAgain = _factory.CreateClientFor(person.Id, VersionAfterOneLogout);

        HttpResponseMessage response = await afterSigningInAgain.GetAsync(SessionRoute);

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
    }

    [Fact]
    public async Task Session_WithATokenFromSigningInAgainAfterLogout_IsAccepted()
    {
        (_, string fatecEmail) = _factory.SeedUserWithPassword("Helena Braga Vieira", KnownPassword);
        HttpClient before = await ClientBySigningIn(fatecEmail);
        await before.PostAsync(LogoutRoute, null);

        HttpClient after = await ClientBySigningIn(fatecEmail);

        HttpResponseMessage response = await after.GetAsync(SessionRoute);

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
    }

    [Fact]
    public async Task Session_WithTheTokenFromBeforeSigningInAgain_StaysRefused()
    {
        (_, string fatecEmail) = _factory.SeedUserWithPassword("Igor Salgado Ferraz", KnownPassword);
        HttpClient before = await ClientBySigningIn(fatecEmail);
        await before.PostAsync(LogoutRoute, null);
        await ClientBySigningIn(fatecEmail);

        HttpResponseMessage response = await before.GetAsync(SessionRoute);

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task Logout_CalledTwiceWithTheSameToken_RespondsUnauthorizedOnTheSecondCall()
    {
        HttpClient client = _factory.CreateClientForNewUser("Eduardo Prado Lima");
        await client.PostAsync(LogoutRoute, null);

        HttpResponseMessage response = await client.PostAsync(LogoutRoute, null);

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task Session_WithATokenCarryingNoVersion_IsRefused()
    {
        SeededUser person = _factory.SeedUser("Fernanda Alves Pinto");
        HttpClient client = _factory.CreateClient();
        client.DefaultRequestHeaders.Authorization =
            new System.Net.Http.Headers.AuthenticationHeaderValue(
                "Bearer", ApiFactory.IssueTokenWithoutVersion(person.Id));

        HttpResponseMessage response = await client.GetAsync(SessionRoute);

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task Session_WithATokenOfSomeoneWhoNoLongerExists_IsRefused()
    {
        const int nobody = 987654;
        HttpClient client = _factory.CreateClientFor(nobody);

        HttpResponseMessage response = await client.GetAsync(SessionRoute);

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    private async Task<HttpClient> ClientBySigningIn(string fatecEmail)
    {
        HttpResponseMessage response = await _factory.CreateClient()
            .PostAsJsonAsync("/Auth/login", new { fatecEmail, password = KnownPassword });

        TokenResponseDto body = (await response.Content.ReadFromJsonAsync<TokenResponseDto>())!;

        HttpClient client = _factory.CreateClient();
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", body.Token);

        return client;
    }
}
