using System.Globalization;
using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using System.Text.Json.Serialization;
using FateConnect.Api.Modules.Common.Utils;
using FateConnect.Api.Modules.Denunciations.Enums;

namespace FateConnect.Api.Tests;

public class DenunciationEndpointTests : IClassFixture<ApiFactory>
{
    private static readonly JsonSerializerOptions JsonOptions =
        new(JsonSerializerDefaults.Web) { Converters = { new JsonStringEnumConverter() } };

    private static readonly Guid AbsentDenunciationId = new("8a1b0f2e-0000-4000-8000-000000000000");

    private const string ValidDescription = "O motorista cobrou valor acima do combinado na carona de ontem.";

    private readonly ApiFactory _factory;

    public DenunciationEndpointTests(ApiFactory factory)
    {
        _factory = factory;
    }

    private sealed record Contact(string Name, string Email, string Phone);

    private sealed record ReadDenunciation(
        Guid Id,
        EnumDenunciationCategory Category,
        string Description,
        string? ImageUrl,
        EnumDenunciationStatus Status,
        Contact? User,
        bool IsAnonymous,
        DateTime CreatedAt);

    private sealed record PagedDenunciations(
        IReadOnlyList<ReadDenunciation> Items,
        int Page,
        int PageSize,
        int Total);

    private static string UniqueSubject() => $"protocolo{Guid.NewGuid():N}";

    private static MultipartFormDataContent NewDenunciationForm(
        EnumDenunciationCategory category = EnumDenunciationCategory.ImproperCharging,
        string description = ValidDescription,
        bool isAnonymous = false) =>
        new()
        {
            { new StringContent(category.ToString()), "Category" },
            { new StringContent(description), "Description" },
            { new StringContent(isAnonymous.ToString(CultureInfo.InvariantCulture)), "IsAnonymous" },
        };

    private static ByteArrayContent ImagePayload(byte pattern)
    {
        ByteArrayContent payload = new([0x89, 0x50, 0x4E, 0x47, pattern]);
        payload.Headers.ContentType = new MediaTypeHeaderValue("image/png");

        return payload;
    }

    private static async Task<ReadDenunciation> ReportedBy(HttpClient reporter, MultipartFormDataContent form)
    {
        HttpResponseMessage response = await reporter.PostAsync("/Denunciations", form);

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);

        return (await response.Content.ReadFromJsonAsync<ReadDenunciation>(JsonOptions))!;
    }

    [Fact]
    public async Task CreateDenunciation_AsOperator_IsAcceptedAndAnswersTheReporterContact()
    {
        HttpClient reporter = _factory.CreateClientForNewUser("Mariana Alves Rocha");

        ReadDenunciation created = await ReportedBy(reporter, NewDenunciationForm());

        Assert.Equal(EnumDenunciationStatus.Open, created.Status);
        Assert.Equal(ValidDescription, created.Description);
        Assert.False(created.IsAnonymous);
        Assert.Equal("Mariana Alves Rocha", created.User?.Name);
    }

    [Fact]
    public async Task CreateDenunciation_AskingForAnonymity_OmitsTheReporterContact()
    {
        HttpClient reporter = _factory.CreateClientForNewUser("Bruno Carvalho Souza");

        ReadDenunciation created = await ReportedBy(reporter, NewDenunciationForm(isAnonymous: true));

        Assert.True(created.IsAnonymous);
        Assert.Null(created.User);
    }

    [Fact]
    public async Task CreateDenunciation_WithAnImage_DoesNotHandTheReporterAnAddressOnlyModerationOpens()
    {
        HttpClient reporter = _factory.CreateClientForNewUser("Larissa Coelho Vieira");
        HttpClient moderation = _factory.CreateClientForNewAdministrator("Kleber Antunes Faria");

        MultipartFormDataContent form = NewDenunciationForm();
        form.Add(ImagePayload(0x11), "Image", "foto.png");

        ReadDenunciation created = await ReportedBy(reporter, form);
        ReadDenunciation reviewed = (await moderation
            .GetFromJsonAsync<ReadDenunciation>($"/Denunciations/{created.Id}", JsonOptions))!;

        Assert.Null(created.ImageUrl);
        Assert.NotNull(reviewed.ImageUrl);
        Assert.Equal(HttpStatusCode.OK, (await moderation.GetAsync($"/{reviewed.ImageUrl}")).StatusCode);
        Assert.Equal(HttpStatusCode.Forbidden, (await reporter.GetAsync($"/{reviewed.ImageUrl}")).StatusCode);
    }

    [Fact]
    public async Task GetDenunciation_OfAnAnonymousReport_HidesTheReporterFromModeration()
    {
        HttpClient reporter = _factory.CreateClientForNewUser("Vera Lúcia Andrade");
        HttpClient moderation = _factory.CreateClientForNewAdministrator("Sérgio Tavares Mendes");
        ReadDenunciation created = await ReportedBy(reporter, NewDenunciationForm(isAnonymous: true));

        ReadDenunciation reviewed = (await moderation
            .GetFromJsonAsync<ReadDenunciation>($"/Denunciations/{created.Id}", JsonOptions))!;

        Assert.True(reviewed.IsAnonymous);
        Assert.Null(reviewed.User);
    }

    [Fact]
    public async Task GetDenunciation_OfAnIdentifiedReport_ShowsTheReporterToModeration()
    {
        HttpClient reporter = _factory.CreateClientForNewUser("Aline Bezerra Dutra");
        HttpClient moderation = _factory.CreateClientForNewAdministrator("Rogério Pinheiro Sales");
        ReadDenunciation created = await ReportedBy(reporter, NewDenunciationForm());

        ReadDenunciation reviewed = (await moderation
            .GetFromJsonAsync<ReadDenunciation>($"/Denunciations/{created.Id}", JsonOptions))!;

        Assert.False(reviewed.IsAnonymous);
        Assert.Equal("Aline Bezerra Dutra", reviewed.User?.Name);
    }

    [Theory]
    [InlineData("1", HttpStatusCode.NotFound)]
    [InlineData("2", HttpStatusCode.Forbidden)]
    public async Task StoredImage_AskedByItsNumericContainer_RefusesOnlyTheDenunciationOne(
        string container, HttpStatusCode expected)
    {
        HttpClient reporter = _factory.CreateClientForNewUser("Diego Albuquerque Rios");

        HttpResponseMessage response = await reporter.GetAsync($"/uploads/{container}/{AbsentDenunciationId}.png");

        Assert.Equal(expected, response.StatusCode);
    }

    [Theory]
    [InlineData("Curta")]
    [InlineData("         x")]
    public async Task CreateDenunciation_WithADescriptionShorterThanTenCharacters_NamesTheField(string description)
    {
        HttpClient reporter = _factory.CreateClientForNewUser("Carla Menezes Dias");

        HttpResponseMessage response = await reporter.PostAsync(
            "/Denunciations", NewDenunciationForm(description: description));
        string body = await response.Content.ReadAsStringAsync();

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        Assert.Contains("Description", body, StringComparison.Ordinal);
    }

    [Fact]
    public async Task CreateDenunciation_AsAdministrator_IsAcceptedBecauseTheProfileContainsTheOperator()
    {
        HttpClient moderation = _factory.CreateClientForNewAdministrator("Renata Villela Prado");

        HttpResponseMessage response = await moderation.PostAsync("/Denunciations", NewDenunciationForm());

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
    }

    [Fact]
    public async Task ListDenunciations_AsOperator_IsForbidden()
    {
        HttpClient reporter = _factory.CreateClientForNewUser("Lucas Ferraz Bianchi");

        HttpResponseMessage response = await reporter.GetAsync("/Denunciations");

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    [Fact]
    public async Task ListDenunciations_AsAdministrator_AnswersThePageOfWhatWasReported()
    {
        HttpClient reporter = _factory.CreateClientForNewUser("Joana Peixoto Lima");
        HttpClient moderation = _factory.CreateClientForNewAdministrator("Marcos Teixeira Pinho");
        string subject = UniqueSubject();

        await ReportedBy(reporter, NewDenunciationForm(description: $"{ValidDescription} {subject}"));
        PagedDenunciations page = (await moderation
            .GetFromJsonAsync<PagedDenunciations>($"/Denunciations?searchTerm={subject}", JsonOptions))!;

        Assert.Equal(1, page.Total);
        Assert.Contains(subject, Assert.Single(page.Items).Description, StringComparison.Ordinal);
    }

    [Fact]
    public async Task ListDenunciations_FilteredByCategory_LeavesTheOtherCategoriesOut()
    {
        HttpClient reporter = _factory.CreateClientForNewUser("Rafael Moreira Pinto");
        HttpClient moderation = _factory.CreateClientForNewAdministrator("Helena Braga Quintana");
        string subject = UniqueSubject();

        await ReportedBy(reporter, NewDenunciationForm(
            category: EnumDenunciationCategory.Spam, description: $"{ValidDescription} {subject}"));

        PagedDenunciations matching = (await moderation.GetFromJsonAsync<PagedDenunciations>(
            $"/Denunciations?searchTerm={subject}&category={EnumDenunciationCategory.Spam}", JsonOptions))!;
        PagedDenunciations other = (await moderation.GetFromJsonAsync<PagedDenunciations>(
            $"/Denunciations?searchTerm={subject}&category={EnumDenunciationCategory.FakeProfile}", JsonOptions))!;

        Assert.Equal(1, matching.Total);
        Assert.Equal(0, other.Total);
    }

    [Fact]
    public async Task ListDenunciations_FilteredByTheDayItWasReported_KeepsTheReportOfToday()
    {
        HttpClient reporter = _factory.CreateClientForNewUser("Paulo Sérgio Ramalho");
        HttpClient moderation = _factory.CreateClientForNewAdministrator("Tatiana Lopes Ferreira");
        string subject = UniqueSubject();
        DateOnly today = DateOnly.FromDateTime(DateTimeUtils.NowInProductTimeZone());

        await ReportedBy(reporter, NewDenunciationForm(description: $"{ValidDescription} {subject}"));

        PagedDenunciations aroundToday = (await moderation.GetFromJsonAsync<PagedDenunciations>(
            $"/Denunciations?searchTerm={subject}&dateFrom={Iso(today.AddDays(-1))}&dateTo={Iso(today.AddDays(1))}",
            JsonOptions))!;
        PagedDenunciations weekBefore = (await moderation.GetFromJsonAsync<PagedDenunciations>(
            $"/Denunciations?searchTerm={subject}&dateFrom={Iso(today.AddDays(-7))}&dateTo={Iso(today.AddDays(-6))}",
            JsonOptions))!;

        Assert.Equal(1, aroundToday.Total);
        Assert.Equal(0, weekBefore.Total);
    }

    [Fact]
    public async Task GetDenunciation_AsOperator_IsForbiddenEvenForWhoReportedIt()
    {
        HttpClient reporter = _factory.CreateClientForNewUser("Fernanda Quadros Alencar");

        ReadDenunciation created = await ReportedBy(reporter, NewDenunciationForm());
        HttpResponseMessage response = await reporter.GetAsync($"/Denunciations/{created.Id}");

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    [Fact]
    public async Task GetDenunciation_OfAnIdentifierThatIsNotThere_IsNotFound()
    {
        HttpClient moderation = _factory.CreateClientForNewAdministrator("Vinícius Prado Salgado");

        HttpResponseMessage response = await moderation.GetAsync($"/Denunciations/{AbsentDenunciationId}");

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task UpdateStatus_AsOperator_IsForbidden()
    {
        HttpClient reporter = _factory.CreateClientForNewUser("Camila Rezende Barros");

        ReadDenunciation created = await ReportedBy(reporter, NewDenunciationForm());
        HttpResponseMessage response = await reporter.PatchAsJsonAsync(
            $"/Denunciations/{created.Id}/status", new { status = nameof(EnumDenunciationStatus.InReview) });

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    [Fact]
    public async Task UpdateStatus_AsAdministrator_WalksTheReportThroughTheReview()
    {
        HttpClient reporter = _factory.CreateClientForNewUser("Gustavo Amaral Peçanha");
        HttpClient moderation = _factory.CreateClientForNewAdministrator("Beatriz Nogueira Camargo");

        ReadDenunciation created = await ReportedBy(reporter, NewDenunciationForm());
        await moderation.PatchAsJsonAsync(
            $"/Denunciations/{created.Id}/status", new { status = nameof(EnumDenunciationStatus.InReview) });
        HttpResponseMessage resolution = await moderation.PatchAsJsonAsync(
            $"/Denunciations/{created.Id}/status", new { status = nameof(EnumDenunciationStatus.Resolved) });

        ReadDenunciation resolved = (await resolution.Content
            .ReadFromJsonAsync<ReadDenunciation>(JsonOptions))!;
        ReadDenunciation reread = (await moderation
            .GetFromJsonAsync<ReadDenunciation>($"/Denunciations/{created.Id}", JsonOptions))!;

        Assert.Equal(HttpStatusCode.OK, resolution.StatusCode);
        Assert.Equal(EnumDenunciationStatus.Resolved, resolved.Status);
        Assert.Equal(EnumDenunciationStatus.Resolved, reread.Status);
    }

    [Fact]
    public async Task UpdateStatus_SkippingTheReviewToResolve_IsRefused()
    {
        HttpClient reporter = _factory.CreateClientForNewUser("Otávio Bastos Rodrigues");
        HttpClient moderation = _factory.CreateClientForNewAdministrator("Isabela Cunha Martins");

        ReadDenunciation created = await ReportedBy(reporter, NewDenunciationForm());
        HttpResponseMessage response = await moderation.PatchAsJsonAsync(
            $"/Denunciations/{created.Id}/status", new { status = nameof(EnumDenunciationStatus.Resolved) });

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task UpdateStatus_OfAnIdentifierThatIsNotThere_IsNotFound()
    {
        HttpClient moderation = _factory.CreateClientForNewAdministrator("Eduardo Pacheco Lemos");

        HttpResponseMessage response = await moderation.PatchAsJsonAsync(
            $"/Denunciations/{AbsentDenunciationId}/status",
            new { status = nameof(EnumDenunciationStatus.InReview) });

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    private static string Iso(DateOnly date) => date.ToString("yyyy-MM-dd", CultureInfo.InvariantCulture);
}
