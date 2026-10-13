using System.Globalization;
using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using System.Text.Json.Serialization;
using FateConnect.Api.Modules.Common.Utils;
using FateConnect.Api.Modules.Reports.Enums;
using FateConnect.Api.Modules.Users.Enums;
using FateConnect.Api.Tests.Fixtures;

namespace FateConnect.Api.Tests.Reports;

public class ReportEndpointTests : IClassFixture<ApiFactory>
{
    private static readonly JsonSerializerOptions JsonOptions =
        new(JsonSerializerDefaults.Web) { Converters = { new JsonStringEnumConverter() } };

    private static readonly Guid AbsentReportId = new("8a1b0f2e-0000-4000-8000-000000000000");

    private const string ValidDescription = "O motorista cobrou valor acima do combinado na carona de ontem.";

    private readonly ApiFactory _factory;

    public ReportEndpointTests(ApiFactory factory)
    {
        _factory = factory;
    }

    private sealed record Contact(string Name, string Email, string Phone, string? ThumbnailUrl);

    private sealed record ReadReport(
        Guid Id,
        EnumReportCategory Category,
        string Description,
        string? ImageUrl,
        string? ThumbnailUrl,
        bool HasImage,
        EnumReportStatus Status,
        Contact? User,
        bool IsAnonymous,
        DateTime CreatedAt);

    private sealed record PagedReports(
        IReadOnlyList<ReadReport> Items,
        int Page,
        int PageSize,
        int Total);

    private static readonly DateOnly SeededDay = new(2026, 3, 15);

    private static string UniqueSubject() => $"protocolo{Guid.NewGuid():N}";

    private static MultipartFormDataContent NewReportForm(
        EnumReportCategory category = EnumReportCategory.ImproperCharging,
        string description = ValidDescription,
        bool isAnonymous = false) =>
        new()
        {
            { new StringContent(category.ToString()), "Category" },
            { new StringContent(description), "Description" },
            { new StringContent(isAnonymous.ToString(CultureInfo.InvariantCulture)), "IsAnonymous" },
        };

    private static ByteArrayContent ImagePayload(byte shade)
    {
        ByteArrayContent payload = new(TestImages.Png(shade: shade));
        payload.Headers.ContentType = new MediaTypeHeaderValue("image/png");

        return payload;
    }

    private static MultipartFormDataContent FormWithImage(string description = ValidDescription)
    {
        MultipartFormDataContent form = NewReportForm(description: description);
        form.Add(ImagePayload(0x11), "Image", "foto.png");

        return form;
    }

    private static async Task<ReadReport> ReportedBy(HttpClient reporter, MultipartFormDataContent form)
    {
        HttpResponseMessage response = await reporter.PostAsync("/Reports", form);

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);

        return (await response.Content.ReadFromJsonAsync<ReadReport>(JsonOptions))!;
    }

    [Fact]
    public async Task CreateReport_AnswersCreatedPointingAtTheReportItSaved()
    {
        HttpClient reporter = _factory.CreateClientForNewUser("Mariana Alves Rocha");
        HttpClient administrator = _factory.CreateClientForNewAdministrator("Carla Mendes Lima");

        HttpResponseMessage response = await reporter.PostAsync("/Reports", NewReportForm());

        ReadReport created = (await response.Content.ReadFromJsonAsync<ReadReport>(JsonOptions))!;
        HttpResponseMessage atLocation = await administrator.GetAsync(response.Headers.Location);

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        Assert.Equal(HttpStatusCode.OK, atLocation.StatusCode);
        Assert.Equal(created.Id, (await atLocation.Content.ReadFromJsonAsync<ReadReport>(JsonOptions))!.Id);
    }

    [Fact]
    public async Task CreateReport_AsOperator_IsAcceptedAndAnswersTheReporterContact()
    {
        HttpClient reporter = _factory.CreateClientForNewUser("Mariana Alves Rocha");

        ReadReport created = await ReportedBy(reporter, NewReportForm());

        Assert.Equal(EnumReportStatus.Open, created.Status);
        Assert.Equal(ValidDescription, created.Description);
        Assert.False(created.IsAnonymous);
        Assert.Equal("Mariana Alves Rocha", created.User?.Name);
    }

    [Fact]
    public async Task CreateReport_AskingForAnonymity_OmitsTheReporterContact()
    {
        HttpClient reporter = _factory.CreateClientForNewUser("Bruno Carvalho Souza");

        ReadReport created = await ReportedBy(reporter, NewReportForm(isAnonymous: true));

        Assert.True(created.IsAnonymous);
        Assert.Null(created.User);
    }

    [Fact]
    public async Task CreateReport_WithAnImage_AnswersTheAddressThatServesIt()
    {
        HttpClient reporter = _factory.CreateClientForNewUser("Larissa Coelho Vieira");

        ReadReport created = await ReportedBy(reporter, FormWithImage());

        Assert.True(created.HasImage);
        Assert.Equal($"Reports/{created.Id}/image", created.ImageUrl);
        Assert.Equal($"Reports/{created.Id}/image/thumbnail", created.ThumbnailUrl);
    }

    [Fact]
    public async Task CreateReport_WithoutAnImage_SaysSoInTheSameField()
    {
        HttpClient reporter = _factory.CreateClientForNewUser("Murilo Fontenele Braga");

        ReadReport created = await ReportedBy(reporter, NewReportForm());

        Assert.False(created.HasImage);
        Assert.Null(created.ImageUrl);
        Assert.Null(created.ThumbnailUrl);
    }

    [Fact]
    public async Task ReportImage_AskedByModeration_IsServed()
    {
        HttpClient moderation = _factory.CreateClientForNewAdministrator("Kleber Antunes Faria");
        HttpClient reporter = _factory.CreateClientForNewUser("Vitória Salgueiro Pena");
        ReadReport created = await ReportedBy(reporter, FormWithImage());

        HttpResponseMessage response = await moderation.GetAsync($"/{created.ImageUrl}");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal("image/png", response.Content.Headers.ContentType?.MediaType);
    }

    [Fact]
    public async Task ReportImage_AskedByWhoReportedIt_IsServed()
    {
        HttpClient reporter = _factory.CreateClientForNewUser("Emerson Padilha Goulart");
        ReadReport created = await ReportedBy(reporter, FormWithImage());

        HttpResponseMessage response = await reporter.GetAsync($"/{created.ImageUrl}");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal("nosniff", Assert.Single(response.Headers.GetValues("X-Content-Type-Options")));
    }

    [Fact]
    public async Task ReportImage_AskedByAnotherOperator_IsForbidden()
    {
        HttpClient reporter = _factory.CreateClientForNewUser("Núbia Carvalhaes Lott");
        HttpClient neighbour = _factory.CreateClientForNewUser("Wagner Teodoro Bicalho");
        ReadReport created = await ReportedBy(reporter, FormWithImage());

        HttpResponseMessage response = await neighbour.GetAsync($"/{created.ImageUrl}");

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    [Fact]
    public async Task ReportThumbnail_AskedByModeration_IsServedAsWebp()
    {
        HttpClient moderation = _factory.CreateClientForNewAdministrator("Tânia Brasileiro Vilela");
        HttpClient reporter = _factory.CreateClientForNewUser("Otávio Queiroga Leme");
        ReadReport created = await ReportedBy(reporter, FormWithImage());

        HttpResponseMessage response = await moderation.GetAsync($"/{created.ThumbnailUrl}");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal("image/webp", response.Content.Headers.ContentType?.MediaType);
    }

    [Fact]
    public async Task ReportThumbnail_AskedByAnotherOperator_IsForbidden()
    {
        HttpClient reporter = _factory.CreateClientForNewUser("Priscila Moreira Arruda");
        HttpClient neighbour = _factory.CreateClientForNewUser("Rui Albuquerque Seixas");
        ReadReport created = await ReportedBy(reporter, FormWithImage());

        HttpResponseMessage response = await neighbour.GetAsync($"/{created.ThumbnailUrl}");

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    [Fact]
    public async Task ReportThumbnail_OfAReportWithoutAnImage_IsNotFound()
    {
        HttpClient reporter = _factory.CreateClientForNewUser("Silas Guimarães Neto");
        ReadReport created = await ReportedBy(reporter, NewReportForm());

        HttpResponseMessage response = await reporter.GetAsync($"/Reports/{created.Id}/image/thumbnail");

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task ReportImage_OfAReportWithoutAnImage_IsNotFound()
    {
        HttpClient reporter = _factory.CreateClientForNewUser("Simone Vasconcelos Aguiar");
        ReadReport created = await ReportedBy(reporter, NewReportForm());

        HttpResponseMessage response = await reporter.GetAsync($"/Reports/{created.Id}/image");

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task ReportImage_OfAnIdentifierThatIsNotThere_IsNotFound()
    {
        HttpClient reporter = _factory.CreateClientForNewUser("Leandro Uchôa Bandeira");

        HttpResponseMessage response = await reporter.GetAsync($"/Reports/{AbsentReportId}/image");

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task GetReport_OfAnAnonymousReport_HidesTheReporterFromModeration()
    {
        HttpClient reporter = _factory.CreateClientForNewUser("Vera Lúcia Andrade");
        HttpClient moderation = _factory.CreateClientForNewAdministrator("Sérgio Tavares Mendes");
        ReadReport created = await ReportedBy(reporter, NewReportForm(isAnonymous: true));

        ReadReport reviewed = (await moderation
            .GetFromJsonAsync<ReadReport>($"/Reports/{created.Id}", JsonOptions))!;

        Assert.True(reviewed.IsAnonymous);
        Assert.Null(reviewed.User);
    }

    [Fact]
    public async Task GetReport_OfAnIdentifiedReport_ShowsTheReporterToModeration()
    {
        HttpClient reporter = _factory.CreateClientForNewUser("Aline Bezerra Dutra");
        HttpClient moderation = _factory.CreateClientForNewAdministrator("Rogério Pinheiro Sales");
        ReadReport created = await ReportedBy(reporter, NewReportForm());

        ReadReport reviewed = (await moderation
            .GetFromJsonAsync<ReadReport>($"/Reports/{created.Id}", JsonOptions))!;

        Assert.False(reviewed.IsAnonymous);
        Assert.Equal("Aline Bezerra Dutra", reviewed.User?.Name);
    }

    [Theory]
    [InlineData("uploads/user/perfil.png", "uploads/user/thumbnails/perfil.webp")]
    [InlineData(null, null)]
    public async Task GetReport_OfAReporterWithOrWithoutAPhoto_AnswersTheThumbnailOrNull(string? imageUrl, string? thumbnailUrl)
    {
        int reporterId = _factory.SeedUser("Gisele Amaral Pontes", imageUrl: imageUrl).Id;
        Guid reportId = _factory.SeedReport(reporterId, ValidDescription, SeededDay);
        HttpClient moderation = _factory.CreateClientForNewAdministrator("Henrique Salles Dorneles");

        ReadReport reviewed = (await moderation
            .GetFromJsonAsync<ReadReport>($"/Reports/{reportId}", JsonOptions))!;

        Assert.Equal(thumbnailUrl, reviewed.User?.ThumbnailUrl);
    }

    [Theory]
    [InlineData("1", HttpStatusCode.NotFound)]
    [InlineData("2", HttpStatusCode.Forbidden)]
    public async Task StoredImage_AskedByItsNumericContainer_RefusesOnlyTheReportOne(
        string container, HttpStatusCode expected)
    {
        HttpClient reporter = _factory.CreateClientForNewUser("Diego Albuquerque Rios");

        HttpResponseMessage response = await reporter.GetAsync($"/uploads/{container}/{AbsentReportId}.png");

        Assert.Equal(expected, response.StatusCode);
    }

    [Fact]
    public async Task StoredImage_OfAReportAskedByTheUploadsRoute_IsRefusedEvenToModeration()
    {
        HttpClient moderation = _factory.CreateClientForNewAdministrator("Wanda Siqueira Portugal");

        HttpResponseMessage response = await moderation.GetAsync(
            $"/uploads/report/{AbsentReportId}.png");

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    [Theory]
    [InlineData("Curta")]
    [InlineData("         x")]
    public async Task CreateReport_WithADescriptionShorterThanTenCharacters_NamesTheField(string description)
    {
        HttpClient reporter = _factory.CreateClientForNewUser("Carla Menezes Dias");

        HttpResponseMessage response = await reporter.PostAsync(
            "/Reports", NewReportForm(description: description));
        string body = await response.Content.ReadAsStringAsync();

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        Assert.Contains("Description", body, StringComparison.Ordinal);
    }

    [Fact]
    public async Task CreateReport_AsAdministrator_IsAcceptedBecauseTheProfileContainsTheOperator()
    {
        HttpClient moderation = _factory.CreateClientForNewAdministrator("Renata Villela Prado");

        HttpResponseMessage response = await moderation.PostAsync("/Reports", NewReportForm());

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
    }

    [Theory]
    [InlineData(EnumAccountStatus.SelfDeactivated)]
    [InlineData(EnumAccountStatus.Banned)]
    public async Task ListReports_AsAdministrator_KeepsWhatAnAccountNoLongerActiveReported(EnumAccountStatus status)
    {
        int reporterId = _factory.SeedUser("Joana Rezende Castro").Id;
        string subject = UniqueSubject();
        await ReportedBy(_factory.CreateClientFor(reporterId), NewReportForm(description: $"{ValidDescription} {subject}"));
        HttpClient moderation = _factory.CreateClientForNewAdministrator("Lúcio Amaral Teixeira");

        _factory.SetAccountStatus(reporterId, status);
        PagedReports all = (await moderation.GetFromJsonAsync<PagedReports>(
            $"/Reports?searchTerm={subject}", JsonOptions))!;

        Assert.Equal(1, all.Total);
    }

    [Fact]
    public async Task ListMyReports_AsOperator_LeavesOutWhatOthersReported()
    {
        HttpClient reporter = _factory.CreateClientForNewUser("Sabrina Toledo Marques");
        HttpClient neighbour = _factory.CreateClientForNewUser("Thiago Barroso Estrela");
        string subject = UniqueSubject();

        await ReportedBy(reporter, NewReportForm(description: $"{ValidDescription} {subject} minha"));
        await ReportedBy(neighbour, NewReportForm(description: $"{ValidDescription} {subject} alheia"));

        PagedReports mine = (await reporter.GetFromJsonAsync<PagedReports>(
            $"/Reports/mine?searchTerm={subject}", JsonOptions))!;

        Assert.Equal(1, mine.Total);
        Assert.EndsWith("minha", Assert.Single(mine.Items).Description, StringComparison.Ordinal);
    }

    [Fact]
    public async Task ListMyReports_AsAdministrator_LeavesOutWhatOthersReported()
    {
        HttpClient moderation = _factory.CreateClientForNewAdministrator("Elisa Werneck Paranhos");
        HttpClient neighbour = _factory.CreateClientForNewUser("Danilo Ferraz Quintela");
        string subject = UniqueSubject();

        await ReportedBy(moderation, NewReportForm(description: $"{ValidDescription} {subject} minha"));
        await ReportedBy(neighbour, NewReportForm(description: $"{ValidDescription} {subject} alheia"));

        PagedReports mine = (await moderation.GetFromJsonAsync<PagedReports>(
            $"/Reports/mine?searchTerm={subject}", JsonOptions))!;

        Assert.Equal(1, mine.Total);
        Assert.EndsWith("minha", Assert.Single(mine.Items).Description, StringComparison.Ordinal);
    }

    [Fact]
    public async Task ListMyReports_FilteredAndPaged_AnswersTheSameContractAsTheFullListing()
    {
        SeededUser reporter = _factory.SeedUser("Rosana Albuquerque Ferrão");
        HttpClient client = _factory.CreateClientFor(reporter.Id);
        string subject = UniqueSubject();

        _factory.SeedReport(reporter.Id, $"{ValidDescription} {subject} antiga", SeededDay);
        _factory.SeedReport(reporter.Id, $"{ValidDescription} {subject} recente", SeededDay.AddDays(1));
        _factory.SeedReport(
            reporter.Id, $"{ValidDescription} {subject} encerrada", SeededDay, status: EnumReportStatus.InReview);

        PagedReports firstPage = (await client.GetFromJsonAsync<PagedReports>(
            $"/Reports/mine?searchTerm={subject}&status={EnumReportStatus.Open}&page=1&pageSize=1",
            JsonOptions))!;

        Assert.Equal(2, firstPage.Total);
        Assert.Equal(1, firstPage.PageSize);
        Assert.EndsWith("recente", Assert.Single(firstPage.Items).Description, StringComparison.Ordinal);
    }

    [Fact]
    public async Task ListReports_AsOperator_IsForbidden()
    {
        HttpClient reporter = _factory.CreateClientForNewUser("Neusa Bittencourt Lyra");

        HttpResponseMessage response = await reporter.GetAsync("/Reports");

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    [Fact]
    public async Task ListReports_AsAdministrator_KeepsWhatOthersReported()
    {
        HttpClient moderation = _factory.CreateClientForNewAdministrator("Cibele Maranhão Duarte");
        HttpClient neighbour = _factory.CreateClientForNewUser("Roberto Siqueira Vasques");
        string subject = UniqueSubject();

        await ReportedBy(moderation, NewReportForm(description: $"{ValidDescription} {subject} minha"));
        await ReportedBy(neighbour, NewReportForm(description: $"{ValidDescription} {subject} alheia"));

        PagedReports everyone = (await moderation.GetFromJsonAsync<PagedReports>(
            $"/Reports?searchTerm={subject}", JsonOptions))!;

        Assert.Equal(2, everyone.Total);
    }

    [Fact]
    public async Task ListMyReports_AsOperator_KeepsTheConfidentialOnesTheyReported()
    {
        HttpClient reporter = _factory.CreateClientForNewUser("Priscila Andrade Caiado");
        string subject = UniqueSubject();

        await ReportedBy(
            reporter,
            NewReportForm(description: $"{ValidDescription} {subject}", isAnonymous: true));

        PagedReports mine = (await reporter.GetFromJsonAsync<PagedReports>(
            $"/Reports/mine?searchTerm={subject}", JsonOptions))!;

        ReadReport listed = Assert.Single(mine.Items);
        Assert.True(listed.IsAnonymous);
        Assert.Null(listed.User);
    }

    [Fact]
    public async Task ListReports_OfAReportWithAnImage_AnswersTheSameAddressToBothSides()
    {
        HttpClient reporter = _factory.CreateClientForNewUser("Alexandre Pontes Milhomem");
        HttpClient moderation = _factory.CreateClientForNewAdministrator("Juliana Espíndola Rabelo");
        string subject = UniqueSubject();

        await ReportedBy(reporter, FormWithImage($"{ValidDescription} {subject}"));

        ReadReport asReporter = Assert.Single((await reporter.GetFromJsonAsync<PagedReports>(
            $"/Reports/mine?searchTerm={subject}", JsonOptions))!.Items);
        ReadReport asModeration = Assert.Single((await moderation.GetFromJsonAsync<PagedReports>(
            $"/Reports?searchTerm={subject}", JsonOptions))!.Items);

        Assert.True(asReporter.HasImage);
        Assert.Equal($"Reports/{asReporter.Id}/image", asReporter.ImageUrl);
        Assert.Equal(asReporter.ImageUrl, asModeration.ImageUrl);
    }

    [Fact]
    public async Task ListReports_AsAdministrator_AnswersThePageOfWhatWasReported()
    {
        HttpClient reporter = _factory.CreateClientForNewUser("Joana Peixoto Lima");
        HttpClient moderation = _factory.CreateClientForNewAdministrator("Marcos Teixeira Pinho");
        string subject = UniqueSubject();

        await ReportedBy(reporter, NewReportForm(description: $"{ValidDescription} {subject}"));
        PagedReports page = (await moderation
            .GetFromJsonAsync<PagedReports>($"/Reports?searchTerm={subject}", JsonOptions))!;

        Assert.Equal(1, page.Total);
        Assert.Contains(subject, Assert.Single(page.Items).Description, StringComparison.Ordinal);
    }

    [Fact]
    public async Task ListReports_FilteredByCategory_LeavesTheOtherCategoriesOut()
    {
        HttpClient reporter = _factory.CreateClientForNewUser("Rafael Moreira Pinto");
        HttpClient moderation = _factory.CreateClientForNewAdministrator("Helena Braga Quintana");
        string subject = UniqueSubject();

        await ReportedBy(reporter, NewReportForm(
            category: EnumReportCategory.Spam, description: $"{ValidDescription} {subject}"));

        PagedReports matching = (await moderation.GetFromJsonAsync<PagedReports>(
            $"/Reports?searchTerm={subject}&category={EnumReportCategory.Spam}", JsonOptions))!;
        PagedReports other = (await moderation.GetFromJsonAsync<PagedReports>(
            $"/Reports?searchTerm={subject}&category={EnumReportCategory.FakeProfile}", JsonOptions))!;

        Assert.Equal(1, matching.Total);
        Assert.Equal(0, other.Total);
    }

    [Fact]
    public async Task ListReports_FilteredBySituation_LeavesTheOtherSituationsOut()
    {
        SeededUser reporter = _factory.SeedUser("Cristiane Valadão Pires");
        HttpClient moderation = _factory.CreateClientForNewAdministrator("Anderson Quirino Mota");
        string subject = UniqueSubject();

        _factory.SeedReport(reporter.Id, $"{ValidDescription} {subject}", SeededDay);
        _factory.SeedReport(
            reporter.Id, $"{ValidDescription} {subject}", SeededDay, status: EnumReportStatus.InReview);

        PagedReports open = (await moderation.GetFromJsonAsync<PagedReports>(
            $"/Reports?searchTerm={subject}&status={EnumReportStatus.Open}", JsonOptions))!;
        PagedReports inReview = (await moderation.GetFromJsonAsync<PagedReports>(
            $"/Reports?searchTerm={subject}&status={EnumReportStatus.InReview}", JsonOptions))!;

        Assert.Equal(EnumReportStatus.Open, Assert.Single(open.Items).Status);
        Assert.Equal(EnumReportStatus.InReview, Assert.Single(inReview.Items).Status);
    }

    [Fact]
    public async Task ListReports_FilteredByOnlyTheStartingDate_CoversThatWholeDay()
    {
        SeededUser reporter = _factory.SeedUser("Heloísa Sampaio Trindade");
        HttpClient moderation = _factory.CreateClientForNewAdministrator("Ubirajara Neves Fontes");
        string subject = UniqueSubject();

        _factory.SeedReport(reporter.Id, $"{ValidDescription} {subject}", SeededDay);

        PagedReports sameDay = (await moderation.GetFromJsonAsync<PagedReports>(
            $"/Reports?searchTerm={subject}&dateFrom={Iso(SeededDay)}", JsonOptions))!;
        PagedReports nextDay = (await moderation.GetFromJsonAsync<PagedReports>(
            $"/Reports?searchTerm={subject}&dateFrom={Iso(SeededDay.AddDays(1))}", JsonOptions))!;

        Assert.Equal(1, sameDay.Total);
        Assert.Equal(0, nextDay.Total);
    }

    [Fact]
    public async Task ListReports_WithMoreThanOnePage_CutsTheNewestFirst()
    {
        SeededUser reporter = _factory.SeedUser("Fabrício Andrade Bulhões");
        HttpClient moderation = _factory.CreateClientForNewAdministrator("Marcela Tenório Bastos");
        string subject = UniqueSubject();

        _factory.SeedReport(reporter.Id, $"{ValidDescription} {subject} antiga", SeededDay);
        _factory.SeedReport(reporter.Id, $"{ValidDescription} {subject} intermediária", SeededDay.AddDays(1));
        _factory.SeedReport(reporter.Id, $"{ValidDescription} {subject} recente", SeededDay.AddDays(2));

        PagedReports firstPage = (await moderation.GetFromJsonAsync<PagedReports>(
            $"/Reports?searchTerm={subject}&page=1&pageSize=2", JsonOptions))!;
        PagedReports secondPage = (await moderation.GetFromJsonAsync<PagedReports>(
            $"/Reports?searchTerm={subject}&page=2&pageSize=2", JsonOptions))!;

        Assert.Equal(3, firstPage.Total);
        Assert.Equal(2, firstPage.Items.Count);
        Assert.EndsWith("recente", firstPage.Items[0].Description, StringComparison.Ordinal);
        Assert.EndsWith("intermediária", firstPage.Items[1].Description, StringComparison.Ordinal);
        Assert.EndsWith("antiga", Assert.Single(secondPage.Items).Description, StringComparison.Ordinal);
    }

    [Fact]
    public async Task ListReports_FilteredByTheDayItWasReported_KeepsTheReportOfToday()
    {
        HttpClient reporter = _factory.CreateClientForNewUser("Paulo Sérgio Ramalho");
        HttpClient moderation = _factory.CreateClientForNewAdministrator("Tatiana Lopes Ferreira");
        string subject = UniqueSubject();
        DateOnly today = DateOnly.FromDateTime(DateTimeUtils.NowInProductTimeZone(TimeProvider.System));

        await ReportedBy(reporter, NewReportForm(description: $"{ValidDescription} {subject}"));

        PagedReports aroundToday = (await moderation.GetFromJsonAsync<PagedReports>(
            $"/Reports?searchTerm={subject}&dateFrom={Iso(today.AddDays(-1))}&dateTo={Iso(today.AddDays(1))}",
            JsonOptions))!;
        PagedReports weekBefore = (await moderation.GetFromJsonAsync<PagedReports>(
            $"/Reports?searchTerm={subject}&dateFrom={Iso(today.AddDays(-7))}&dateTo={Iso(today.AddDays(-6))}",
            JsonOptions))!;

        Assert.Equal(1, aroundToday.Total);
        Assert.Equal(0, weekBefore.Total);
    }

    [Fact]
    public async Task GetReport_AsOperator_IsForbiddenEvenForWhoReportedIt()
    {
        HttpClient reporter = _factory.CreateClientForNewUser("Fernanda Quadros Alencar");

        ReadReport created = await ReportedBy(reporter, NewReportForm());
        HttpResponseMessage response = await reporter.GetAsync($"/Reports/{created.Id}");

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    [Fact]
    public async Task GetReport_OfAnIdentifierThatIsNotThere_IsNotFound()
    {
        HttpClient moderation = _factory.CreateClientForNewAdministrator("Vinícius Prado Salgado");

        HttpResponseMessage response = await moderation.GetAsync($"/Reports/{AbsentReportId}");

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task UpdateStatus_AsOperator_IsForbidden()
    {
        HttpClient reporter = _factory.CreateClientForNewUser("Camila Rezende Barros");

        ReadReport created = await ReportedBy(reporter, NewReportForm());
        HttpResponseMessage response = await reporter.PatchAsJsonAsync(
            $"/Reports/{created.Id}/status", new { status = nameof(EnumReportStatus.InReview) });

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    [Fact]
    public async Task UpdateStatus_ResolvingAReportUnderReview_PersistsTheNewSituation()
    {
        SeededUser reporter = _factory.SeedUser("Gustavo Amaral Peçanha");
        HttpClient moderation = _factory.CreateClientForNewAdministrator("Beatriz Nogueira Camargo");
        Guid underReview = _factory.SeedReport(
            reporter.Id, ValidDescription, SeededDay, status: EnumReportStatus.InReview);

        HttpResponseMessage resolution = await moderation.PatchAsJsonAsync(
            $"/Reports/{underReview}/status", new { status = nameof(EnumReportStatus.Resolved) });

        ReadReport reread = (await moderation
            .GetFromJsonAsync<ReadReport>($"/Reports/{underReview}", JsonOptions))!;

        Assert.Equal(HttpStatusCode.OK, resolution.StatusCode);
        Assert.Equal(EnumReportStatus.Resolved, reread.Status);
    }

    [Fact]
    public async Task UpdateStatus_SkippingTheReviewToResolve_IsRefused()
    {
        HttpClient reporter = _factory.CreateClientForNewUser("Otávio Bastos Rodrigues");
        HttpClient moderation = _factory.CreateClientForNewAdministrator("Isabela Cunha Martins");

        ReadReport created = await ReportedBy(reporter, NewReportForm());
        HttpResponseMessage response = await moderation.PatchAsJsonAsync(
            $"/Reports/{created.Id}/status", new { status = nameof(EnumReportStatus.Resolved) });

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task UpdateStatus_OfAnIdentifierThatIsNotThere_IsNotFound()
    {
        HttpClient moderation = _factory.CreateClientForNewAdministrator("Eduardo Pacheco Lemos");

        HttpResponseMessage response = await moderation.PatchAsJsonAsync(
            $"/Reports/{AbsentReportId}/status",
            new { status = nameof(EnumReportStatus.InReview) });

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    private static string Iso(DateOnly date) => date.ToString("yyyy-MM-dd", CultureInfo.InvariantCulture);
}
