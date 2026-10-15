using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using System.Text.Json.Serialization;
using FateConnect.Api.Modules.Common.DTOs;
using FateConnect.Api.Modules.Users.DTOs;
using FateConnect.Api.Modules.Users.Entities;
using FateConnect.Api.Modules.Users.Enums;
using FateConnect.Api.Modules.Users.Interfaces;
using FateConnect.Api.Modules.Users.Services;
using FateConnect.Api.Tests.Fixtures;
using Microsoft.Extensions.DependencyInjection;

namespace FateConnect.Api.Tests.Users;

public class LegalDocumentAcceptanceTests(ApiFactory factory) : IClassFixture<ApiFactory>
{
    private const string LegalDocumentsPath = "/Users/me/legal-documents";
    private const string AcceptancesPath = "/Users/me/legal-documents/acceptances";
    private const string OutdatedVersion = "2026-01-15";
    private const string RaisedPrivacyVersion = "2026-12-01";
    private const string ForwardedIpAddress = "203.0.113.82";
    private const string BrowserUserAgent =
        "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1";
    private const int MissingUserId = int.MaxValue;

    private static readonly JsonSerializerOptions JsonOptions =
        new(JsonSerializerDefaults.Web) { Converters = { new JsonStringEnumConverter() } };

    private sealed record LegalDocumentStatus(EnumDocumentType Document, string CurrentVersion, bool AcceptedCurrentVersion);

    private static object AcceptancesBody(params (EnumDocumentType Document, string Version)[] acceptances) => new
    {
        acceptances = acceptances.Select(acceptance => new
        {
            document = acceptance.Document.ToString(),
            version = acceptance.Version,
        }),
    };

    private static async Task<List<LegalDocumentStatus>> StatusOfAsync(HttpClient client)
    {
        HttpResponseMessage response = await client.GetAsync(LegalDocumentsPath);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        return (await response.Content.ReadFromJsonAsync<List<LegalDocumentStatus>>(JsonOptions))!;
    }

    private static void AcceptBoth(ApiFactory api, int userId)
    {
        api.SeedDocumentAcceptance(userId, EnumDocumentType.TermsOfUse, CurrentLegalVersions.TermsOfUse);
        api.SeedDocumentAcceptance(userId, EnumDocumentType.PrivacyPolicy, CurrentLegalVersions.PrivacyPolicy);
    }

    [Fact]
    public async Task GetLegalDocuments_AfterAcceptingTheCurrentVersions_ReportsNothingPending()
    {
        int userId = factory.SeedUser("Mariana Alves Rocha").Id;
        AcceptBoth(factory, userId);

        List<LegalDocumentStatus> documents = await StatusOfAsync(factory.CreateClientFor(userId));

        Assert.Equal(
            [
                new LegalDocumentStatus(EnumDocumentType.TermsOfUse, CurrentLegalVersions.TermsOfUse, true),
                new LegalDocumentStatus(EnumDocumentType.PrivacyPolicy, CurrentLegalVersions.PrivacyPolicy, true),
            ],
            documents);
    }

    [Fact]
    public async Task GetLegalDocuments_WithAnOlderPrivacyAcceptance_ReportsOnlyThePrivacyPolicyPending()
    {
        int userId = factory.SeedUser("Rafael Nogueira Lima").Id;
        factory.SeedDocumentAcceptance(userId, EnumDocumentType.TermsOfUse, CurrentLegalVersions.TermsOfUse);
        factory.SeedDocumentAcceptance(userId, EnumDocumentType.PrivacyPolicy, OutdatedVersion);

        List<LegalDocumentStatus> documents = await StatusOfAsync(factory.CreateClientFor(userId));

        Assert.True(documents.Single(status => status.Document == EnumDocumentType.TermsOfUse).AcceptedCurrentVersion);
        Assert.False(documents.Single(status => status.Document == EnumDocumentType.PrivacyPolicy).AcceptedCurrentVersion);
    }

    [Fact]
    public async Task GetLegalDocuments_ForAnAccountThatNeverAcceptedThePrivacyPolicy_ReportsItPending()
    {
        int userId = factory.SeedUser("Beatriz Campos Moreira").Id;
        factory.SeedDocumentAcceptance(userId, EnumDocumentType.TermsOfUse, CurrentLegalVersions.TermsOfUse);

        List<LegalDocumentStatus> documents = await StatusOfAsync(factory.CreateClientFor(userId));

        LegalDocumentStatus privacy = documents.Single(status => status.Document == EnumDocumentType.PrivacyPolicy);

        Assert.False(privacy.AcceptedCurrentVersion);
        Assert.Equal(CurrentLegalVersions.PrivacyPolicy, privacy.CurrentVersion);
    }

    [Fact]
    public async Task GetLegalDocuments_AfterThePrivacyDateRises_ReportsItPendingUntilAccepted()
    {
        using ApiFactory raisedFactory = new()
        {
            DocumentVersions = new LegalDocumentVersions(new Dictionary<EnumDocumentType, string>
            {
                [EnumDocumentType.TermsOfUse] = CurrentLegalVersions.TermsOfUse,
                [EnumDocumentType.PrivacyPolicy] = RaisedPrivacyVersion,
            }),
        };
        int userId = raisedFactory.SeedUser("Lucas Ferreira Bastos").Id;
        AcceptBoth(raisedFactory, userId);
        HttpClient client = raisedFactory.CreateClientFor(userId);

        List<LegalDocumentStatus> before = await StatusOfAsync(client);
        HttpResponseMessage acceptance = await client.PostAsJsonAsync(
            AcceptancesPath,
            AcceptancesBody((EnumDocumentType.PrivacyPolicy, RaisedPrivacyVersion)));
        List<LegalDocumentStatus> after = await StatusOfAsync(client);

        Assert.Equal(
            new LegalDocumentStatus(EnumDocumentType.PrivacyPolicy, RaisedPrivacyVersion, false),
            before.Single(status => status.Document == EnumDocumentType.PrivacyPolicy));
        Assert.True(before.Single(status => status.Document == EnumDocumentType.TermsOfUse).AcceptedCurrentVersion);
        Assert.Equal(HttpStatusCode.NoContent, acceptance.StatusCode);
        Assert.All(after, status => Assert.True(status.AcceptedCurrentVersion));
    }

    [Fact]
    public async Task Accept_WithTheCurrentVersion_RecordsItWithTheAddressAndTheBrowser()
    {
        int userId = factory.SeedUser("Juliana Prado Teixeira").Id;
        HttpClient client = factory.CreateClientFor(userId);
        client.DefaultRequestHeaders.Add("User-Agent", BrowserUserAgent);
        client.DefaultRequestHeaders.Add("X-Forwarded-For", ForwardedIpAddress);

        HttpResponseMessage response = await client.PostAsJsonAsync(
            AcceptancesPath,
            AcceptancesBody((EnumDocumentType.PrivacyPolicy, CurrentLegalVersions.PrivacyPolicy)));

        DocumentAcceptance acceptance = Assert.Single(factory.DocumentAcceptancesOf(userId));

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        Assert.Equal(EnumDocumentType.PrivacyPolicy, acceptance.DocumentType);
        Assert.Equal(CurrentLegalVersions.PrivacyPolicy, acceptance.Version);
        Assert.Equal(ForwardedIpAddress, acceptance.IpAddress);
        Assert.Equal(BrowserUserAgent, acceptance.UserAgent);
        Assert.NotEqual(default, acceptance.AcceptedAt);
        Assert.Contains(
            $"User ID {userId} accepted PrivacyPolicy version {CurrentLegalVersions.PrivacyPolicy}.",
            factory.LogMessages);
    }

    [Fact]
    public async Task Accept_WithAnOutdatedVersion_IsRejectedAndRecordsNothing()
    {
        int userId = factory.SeedUser("Gustavo Ribeiro Antunes").Id;

        HttpResponseMessage response = await factory.CreateClientFor(userId).PostAsJsonAsync(
            AcceptancesPath,
            AcceptancesBody((EnumDocumentType.PrivacyPolicy, OutdatedVersion)));

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        Assert.Empty(factory.DocumentAcceptancesOf(userId));
    }

    [Fact]
    public async Task Accept_TheSameVersionTwice_RecordsItOnce()
    {
        int userId = factory.SeedUser("Camila Duarte Siqueira").Id;
        HttpClient client = factory.CreateClientFor(userId);
        object body = AcceptancesBody(
            (EnumDocumentType.TermsOfUse, CurrentLegalVersions.TermsOfUse),
            (EnumDocumentType.TermsOfUse, CurrentLegalVersions.TermsOfUse));

        HttpResponseMessage first = await client.PostAsJsonAsync(AcceptancesPath, body);
        HttpResponseMessage second = await client.PostAsJsonAsync(AcceptancesPath, body);

        Assert.Equal(HttpStatusCode.NoContent, first.StatusCode);
        Assert.Equal(HttpStatusCode.NoContent, second.StatusCode);
        Assert.Single(factory.DocumentAcceptancesOf(userId));
    }

    [Fact]
    public async Task Accept_WithAnEmptyList_IsRejected()
    {
        int userId = factory.SeedUser("Felipe Moura Cardoso").Id;

        HttpResponseMessage response = await factory.CreateClientFor(userId)
            .PostAsJsonAsync(AcceptancesPath, AcceptancesBody());

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task Service_ForAMissingUser_ReadsAndRecordsNothing()
    {
        using IServiceScope scope = factory.Services.CreateScope();
        ILegalDocumentService service = scope.ServiceProvider.GetRequiredService<ILegalDocumentService>();
        AcceptDocumentsDto dto = new()
        {
            Acceptances =
            [
                new DocumentAcceptanceDto
                {
                    Document = EnumDocumentType.TermsOfUse,
                    Version = CurrentLegalVersions.TermsOfUse,
                },
            ],
        };

        IReadOnlyList<ReadLegalDocumentDto>? status = await service.GetStatusAsync(MissingUserId);
        bool recorded = await service.AcceptAsync(MissingUserId, dto, new RequestOrigin("198.51.100.7", "Mozilla/5.0"));

        Assert.Null(status);
        Assert.False(recorded);
    }
}
