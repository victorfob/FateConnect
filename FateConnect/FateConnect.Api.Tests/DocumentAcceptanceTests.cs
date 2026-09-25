using System.Net;
using System.Net.Http.Json;
using FateConnect.Api.Infrastructure.Database;
using FateConnect.Api.Modules.Users.Entities;
using FateConnect.Api.Modules.Users.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

namespace FateConnect.Api.Tests;

public sealed class DocumentAcceptanceTests : IClassFixture<ApiFactory>
{
    private const string TermsVersion = "2026-01-15";
    private const string PrivacyVersion = "2026-02-20";
    private const string BrowserUserAgent =
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36";
    private const string ForwardedIpAddress = "203.0.113.47";
    private const int UserAgentColumnLength = 512;

    private readonly ApiFactory _factory;

    public DocumentAcceptanceTests(ApiFactory factory)
    {
        _factory = factory;
    }

    private sealed record AcceptancePayload(string Document, string Version);

    private static AcceptancePayload[] BothAcceptances() =>
    [
        new(nameof(EnumDocumentType.TermsOfUse), TermsVersion),
        new(nameof(EnumDocumentType.PrivacyPolicy), PrivacyVersion),
    ];

    private static Dictionary<string, object> SignupPayload(string fatecEmail) => new()
    {
        ["fatecEmail"] = fatecEmail,
        ["password"] = "SenhaForte123!",
        ["fullName"] = "Mariana Alves Rocha",
        ["birthDate"] = "2000-01-01T00:00:00Z",
        ["gender"] = "Female",
        ["phone"] = ApiFactory.UniquePhone(),
        ["contactEmail"] = ApiFactory.UniqueContactEmail(),
        ["acceptances"] = BothAcceptances(),
    };

    private static string UniqueEmail() => $"sonda{Guid.NewGuid():N}@aluno.cps.sp.gov.br";

    private async Task<HttpResponseMessage> SignUpAsync(
        Dictionary<string, object> payload,
        string? forwardedFor = null)
    {
        HttpClient client = _factory.CreateClient();
        client.DefaultRequestHeaders.Add("User-Agent", BrowserUserAgent);

        if (forwardedFor is not null)
            client.DefaultRequestHeaders.Add("X-Forwarded-For", forwardedFor);

        return await client.PostAsJsonAsync("/Users/signup", payload);
    }

    private User ReadUser(string fatecEmail)
    {
        using IServiceScope scope = _factory.Services.CreateScope();
        FateConnectDbContext context = scope.ServiceProvider.GetRequiredService<FateConnectDbContext>();

        return context.Users
            .Include(user => user.DocumentAcceptances)
            .Include(user => user.Preferences)
            .AsNoTracking()
            .Single(user => user.FatecEmail == fatecEmail);
    }

    [Fact]
    public async Task Signup_WithBothDocuments_RecordsOneAcceptancePerDocument()
    {
        string fatecEmail = UniqueEmail();

        HttpResponseMessage response = await SignUpAsync(SignupPayload(fatecEmail));

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);

        List<DocumentAcceptance> acceptances = [.. ReadUser(fatecEmail).DocumentAcceptances
            .OrderBy(acceptance => acceptance.DocumentType)];

        Assert.Equal(2, acceptances.Count);
        Assert.Equal(EnumDocumentType.TermsOfUse, acceptances[0].DocumentType);
        Assert.Equal(TermsVersion, acceptances[0].Version);
        Assert.Equal(EnumDocumentType.PrivacyPolicy, acceptances[1].DocumentType);
        Assert.Equal(PrivacyVersion, acceptances[1].Version);
    }

    [Fact]
    public async Task Signup_WithBothDocuments_RecordsWhatTheServerObserved()
    {
        string fatecEmail = UniqueEmail();

        await SignUpAsync(SignupPayload(fatecEmail));

        DocumentAcceptance acceptance = ReadUser(fatecEmail).DocumentAcceptances.First();

        Assert.Equal(BrowserUserAgent, acceptance.UserAgent);
        Assert.NotEqual(default, acceptance.AcceptedAt);
    }

    [Fact]
    public async Task Signup_BehindAProxy_RecordsTheAddressTheProxyForwarded()
    {
        string fatecEmail = UniqueEmail();

        await SignUpAsync(SignupPayload(fatecEmail), ForwardedIpAddress);

        DocumentAcceptance acceptance = ReadUser(fatecEmail).DocumentAcceptances.First();

        Assert.Equal(ForwardedIpAddress, acceptance.IpAddress);
    }

    [Fact]
    public async Task Signup_WithoutAProxyHeader_DoesNotInventAnAddress()
    {
        string fatecEmail = UniqueEmail();

        await SignUpAsync(SignupPayload(fatecEmail));

        DocumentAcceptance acceptance = ReadUser(fatecEmail).DocumentAcceptances.First();

        Assert.NotEqual(ForwardedIpAddress, acceptance.IpAddress);
    }

    [Fact]
    public async Task Signup_WithoutTheAcceptances_IsRejected()
    {
        Dictionary<string, object> payload = SignupPayload(UniqueEmail());
        payload.Remove("acceptances");

        HttpResponseMessage response = await SignUpAsync(payload);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task Signup_WithAnEmptyAcceptanceList_IsRejected()
    {
        Dictionary<string, object> payload = SignupPayload(UniqueEmail());
        payload["acceptances"] = Array.Empty<object>();

        HttpResponseMessage response = await SignUpAsync(payload);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task Signup_WithoutThePreferences_LeavesThemOff()
    {
        string fatecEmail = UniqueEmail();

        HttpResponseMessage response = await SignUpAsync(SignupPayload(fatecEmail));

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);

        User user = ReadUser(fatecEmail);

        Assert.False(user.Preferences.ReceiveEmails);
        Assert.False(user.Preferences.ReceiveNotifications);
    }

    [Fact]
    public async Task Signup_WithThePreferencesChosen_StoresBothOfThem()
    {
        string fatecEmail = UniqueEmail();
        Dictionary<string, object> payload = SignupPayload(fatecEmail);
        payload["receiveEmails"] = true;
        payload["receiveNotifications"] = true;

        await SignUpAsync(payload);

        User user = ReadUser(fatecEmail);

        Assert.Equal(user.Id, user.Preferences.UserId);
        Assert.True(user.Preferences.ReceiveEmails);
        Assert.True(user.Preferences.ReceiveNotifications);
    }

    [Fact]
    public async Task Signup_WithAnOverlongUserAgent_StoresItWithinTheColumn()
    {
        string fatecEmail = UniqueEmail();
        string overlongUserAgent = new('u', UserAgentColumnLength * 2);

        HttpClient client = _factory.CreateClient();
        client.DefaultRequestHeaders.Add("User-Agent", overlongUserAgent);

        HttpResponseMessage response = await client.PostAsJsonAsync("/Users/signup", SignupPayload(fatecEmail));

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);

        DocumentAcceptance acceptance = ReadUser(fatecEmail).DocumentAcceptances.First();

        Assert.Equal(UserAgentColumnLength, acceptance.UserAgent.Length);
    }

    [Fact]
    public async Task Signup_WithBothDocuments_TiesEachAcceptanceToWhoSignedUp()
    {
        string fatecEmail = UniqueEmail();

        await SignUpAsync(SignupPayload(fatecEmail));

        using IServiceScope scope = _factory.Services.CreateScope();
        FateConnectDbContext context = scope.ServiceProvider.GetRequiredService<FateConnectDbContext>();

        DocumentAcceptance acceptance = context.DocumentAcceptances
            .Include(record => record.User)
            .AsNoTracking()
            .First(record => record.User.FatecEmail == fatecEmail);

        Assert.Equal(fatecEmail, acceptance.User.FatecEmail);
        Assert.NotEqual(0, acceptance.UserId);
        Assert.NotEqual(0, acceptance.Id);
    }

    [Fact]
    public async Task Signup_WithOnlyOneDocument_RecordsOnlyThatOne()
    {
        string fatecEmail = UniqueEmail();
        Dictionary<string, object> payload = SignupPayload(fatecEmail);
        payload["acceptances"] = new AcceptancePayload[] { new(nameof(EnumDocumentType.TermsOfUse), TermsVersion) };

        await SignUpAsync(payload);

        DocumentAcceptance acceptance = Assert.Single(ReadUser(fatecEmail).DocumentAcceptances);

        Assert.Equal(EnumDocumentType.TermsOfUse, acceptance.DocumentType);
    }
}
