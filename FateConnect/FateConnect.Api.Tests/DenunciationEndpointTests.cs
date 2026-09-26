using System.Globalization;
using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using System.Text.Json.Serialization;
using FateConnect.Api.Modules.Common.Utils;
using FateConnect.Api.Modules.Denunciations.Enums;
using FateConnect.Api.Modules.Users.Enums;

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
        string? ThumbnailUrl,
        bool HasImage,
        EnumDenunciationStatus Status,
        Contact? User,
        bool IsAnonymous,
        DateTime CreatedAt);

    private sealed record PagedDenunciations(
        IReadOnlyList<ReadDenunciation> Items,
        int Page,
        int PageSize,
        int Total);

    private static readonly DateOnly SeededDay = new(2026, 3, 15);

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

    private static ByteArrayContent ImagePayload(byte shade)
    {
        ByteArrayContent payload = new(TestImages.Png(shade: shade));
        payload.Headers.ContentType = new MediaTypeHeaderValue("image/png");

        return payload;
    }

    private static MultipartFormDataContent FormWithImage(string description = ValidDescription)
    {
        MultipartFormDataContent form = NewDenunciationForm(description: description);
        form.Add(ImagePayload(0x11), "Image", "foto.png");

        return form;
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
    public async Task CreateDenunciation_WithAnImage_AnswersTheAddressThatServesIt()
    {
        HttpClient reporter = _factory.CreateClientForNewUser("Larissa Coelho Vieira");

        ReadDenunciation created = await ReportedBy(reporter, FormWithImage());

        Assert.True(created.HasImage);
        Assert.Equal($"Denunciations/{created.Id}/image", created.ImageUrl);
        Assert.Equal($"Denunciations/{created.Id}/image/thumbnail", created.ThumbnailUrl);
    }

    [Fact]
    public async Task CreateDenunciation_WithoutAnImage_SaysSoInTheSameField()
    {
        HttpClient reporter = _factory.CreateClientForNewUser("Murilo Fontenele Braga");

        ReadDenunciation created = await ReportedBy(reporter, NewDenunciationForm());

        Assert.False(created.HasImage);
        Assert.Null(created.ImageUrl);
        Assert.Null(created.ThumbnailUrl);
    }

    [Fact]
    public async Task DenunciationImage_AskedByModeration_IsServed()
    {
        HttpClient moderation = _factory.CreateClientForNewAdministrator("Kleber Antunes Faria");
        HttpClient reporter = _factory.CreateClientForNewUser("Vitória Salgueiro Pena");
        ReadDenunciation created = await ReportedBy(reporter, FormWithImage());

        HttpResponseMessage response = await moderation.GetAsync($"/{created.ImageUrl}");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal("image/png", response.Content.Headers.ContentType?.MediaType);
    }

    [Fact]
    public async Task DenunciationImage_AskedByWhoReportedIt_IsServed()
    {
        HttpClient reporter = _factory.CreateClientForNewUser("Emerson Padilha Goulart");
        ReadDenunciation created = await ReportedBy(reporter, FormWithImage());

        HttpResponseMessage response = await reporter.GetAsync($"/{created.ImageUrl}");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal("nosniff", Assert.Single(response.Headers.GetValues("X-Content-Type-Options")));
    }

    [Fact]
    public async Task DenunciationImage_AskedByAnotherOperator_IsForbidden()
    {
        HttpClient reporter = _factory.CreateClientForNewUser("Núbia Carvalhaes Lott");
        HttpClient neighbour = _factory.CreateClientForNewUser("Wagner Teodoro Bicalho");
        ReadDenunciation created = await ReportedBy(reporter, FormWithImage());

        HttpResponseMessage response = await neighbour.GetAsync($"/{created.ImageUrl}");

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    [Fact]
    public async Task DenunciationThumbnail_AskedByModeration_IsServedAsWebp()
    {
        HttpClient moderation = _factory.CreateClientForNewAdministrator("Tânia Brasileiro Vilela");
        HttpClient reporter = _factory.CreateClientForNewUser("Otávio Queiroga Leme");
        ReadDenunciation created = await ReportedBy(reporter, FormWithImage());

        HttpResponseMessage response = await moderation.GetAsync($"/{created.ThumbnailUrl}");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal("image/webp", response.Content.Headers.ContentType?.MediaType);
    }

    [Fact]
    public async Task DenunciationThumbnail_AskedByAnotherOperator_IsForbidden()
    {
        HttpClient reporter = _factory.CreateClientForNewUser("Priscila Moreira Arruda");
        HttpClient neighbour = _factory.CreateClientForNewUser("Rui Albuquerque Seixas");
        ReadDenunciation created = await ReportedBy(reporter, FormWithImage());

        HttpResponseMessage response = await neighbour.GetAsync($"/{created.ThumbnailUrl}");

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    [Fact]
    public async Task DenunciationThumbnail_OfAReportWithoutAnImage_IsNotFound()
    {
        HttpClient reporter = _factory.CreateClientForNewUser("Silas Guimarães Neto");
        ReadDenunciation created = await ReportedBy(reporter, NewDenunciationForm());

        HttpResponseMessage response = await reporter.GetAsync($"/Denunciations/{created.Id}/image/thumbnail");

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task DenunciationImage_OfAReportWithoutAnImage_IsNotFound()
    {
        HttpClient reporter = _factory.CreateClientForNewUser("Simone Vasconcelos Aguiar");
        ReadDenunciation created = await ReportedBy(reporter, NewDenunciationForm());

        HttpResponseMessage response = await reporter.GetAsync($"/Denunciations/{created.Id}/image");

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task DenunciationImage_OfAnIdentifierThatIsNotThere_IsNotFound()
    {
        HttpClient reporter = _factory.CreateClientForNewUser("Leandro Uchôa Bandeira");

        HttpResponseMessage response = await reporter.GetAsync($"/Denunciations/{AbsentDenunciationId}/image");

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
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

    [Fact]
    public async Task StoredImage_OfADenunciationAskedByTheUploadsRoute_IsRefusedEvenToModeration()
    {
        HttpClient moderation = _factory.CreateClientForNewAdministrator("Wanda Siqueira Portugal");

        HttpResponseMessage response = await moderation.GetAsync(
            $"/uploads/denunciation/{AbsentDenunciationId}.png");

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
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

    [Theory]
    [InlineData(EnumAccountStatus.SelfDeactivated)]
    [InlineData(EnumAccountStatus.Banned)]
    public async Task ListDenunciations_AsAdministrator_KeepsWhatAnAccountNoLongerActiveReported(EnumAccountStatus status)
    {
        int reporterId = _factory.SeedUser("Joana Rezende Castro").Id;
        string subject = UniqueSubject();
        await ReportedBy(_factory.CreateClientFor(reporterId), NewDenunciationForm(description: $"{ValidDescription} {subject}"));
        HttpClient moderation = _factory.CreateClientForNewAdministrator("Lúcio Amaral Teixeira");

        _factory.SetAccountStatus(reporterId, status);
        PagedDenunciations all = (await moderation.GetFromJsonAsync<PagedDenunciations>(
            $"/Denunciations?searchTerm={subject}", JsonOptions))!;

        Assert.Equal(1, all.Total);
    }

    [Fact]
    public async Task ListMyDenunciations_AsOperator_LeavesOutWhatOthersReported()
    {
        HttpClient reporter = _factory.CreateClientForNewUser("Sabrina Toledo Marques");
        HttpClient neighbour = _factory.CreateClientForNewUser("Thiago Barroso Estrela");
        string subject = UniqueSubject();

        await ReportedBy(reporter, NewDenunciationForm(description: $"{ValidDescription} {subject} minha"));
        await ReportedBy(neighbour, NewDenunciationForm(description: $"{ValidDescription} {subject} alheia"));

        PagedDenunciations mine = (await reporter.GetFromJsonAsync<PagedDenunciations>(
            $"/Denunciations/mine?searchTerm={subject}", JsonOptions))!;

        Assert.Equal(1, mine.Total);
        Assert.EndsWith("minha", Assert.Single(mine.Items).Description, StringComparison.Ordinal);
    }

    [Fact]
    public async Task ListMyDenunciations_AsAdministrator_LeavesOutWhatOthersReported()
    {
        HttpClient moderation = _factory.CreateClientForNewAdministrator("Elisa Werneck Paranhos");
        HttpClient neighbour = _factory.CreateClientForNewUser("Danilo Ferraz Quintela");
        string subject = UniqueSubject();

        await ReportedBy(moderation, NewDenunciationForm(description: $"{ValidDescription} {subject} minha"));
        await ReportedBy(neighbour, NewDenunciationForm(description: $"{ValidDescription} {subject} alheia"));

        PagedDenunciations mine = (await moderation.GetFromJsonAsync<PagedDenunciations>(
            $"/Denunciations/mine?searchTerm={subject}", JsonOptions))!;

        Assert.Equal(1, mine.Total);
        Assert.EndsWith("minha", Assert.Single(mine.Items).Description, StringComparison.Ordinal);
    }

    [Fact]
    public async Task ListMyDenunciations_FilteredAndPaged_AnswersTheSameContractAsTheFullListing()
    {
        SeededUser reporter = _factory.SeedUser("Rosana Albuquerque Ferrão");
        HttpClient client = _factory.CreateClientFor(reporter.Id);
        string subject = UniqueSubject();

        _factory.SeedDenunciation(reporter.Id, $"{ValidDescription} {subject} antiga", SeededDay);
        _factory.SeedDenunciation(reporter.Id, $"{ValidDescription} {subject} recente", SeededDay.AddDays(1));
        _factory.SeedDenunciation(
            reporter.Id, $"{ValidDescription} {subject} encerrada", SeededDay, status: EnumDenunciationStatus.InReview);

        PagedDenunciations firstPage = (await client.GetFromJsonAsync<PagedDenunciations>(
            $"/Denunciations/mine?searchTerm={subject}&status={EnumDenunciationStatus.Open}&page=1&pageSize=1",
            JsonOptions))!;

        Assert.Equal(2, firstPage.Total);
        Assert.Equal(1, firstPage.PageSize);
        Assert.EndsWith("recente", Assert.Single(firstPage.Items).Description, StringComparison.Ordinal);
    }

    [Fact]
    public async Task ListDenunciations_AsOperator_IsForbidden()
    {
        HttpClient reporter = _factory.CreateClientForNewUser("Neusa Bittencourt Lyra");

        HttpResponseMessage response = await reporter.GetAsync("/Denunciations");

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    [Fact]
    public async Task ListDenunciations_AsAdministrator_KeepsWhatOthersReported()
    {
        HttpClient moderation = _factory.CreateClientForNewAdministrator("Cibele Maranhão Duarte");
        HttpClient neighbour = _factory.CreateClientForNewUser("Roberto Siqueira Vasques");
        string subject = UniqueSubject();

        await ReportedBy(moderation, NewDenunciationForm(description: $"{ValidDescription} {subject} minha"));
        await ReportedBy(neighbour, NewDenunciationForm(description: $"{ValidDescription} {subject} alheia"));

        PagedDenunciations everyone = (await moderation.GetFromJsonAsync<PagedDenunciations>(
            $"/Denunciations?searchTerm={subject}", JsonOptions))!;

        Assert.Equal(2, everyone.Total);
    }

    [Fact]
    public async Task ListMyDenunciations_AsOperator_KeepsTheConfidentialOnesTheyReported()
    {
        HttpClient reporter = _factory.CreateClientForNewUser("Priscila Andrade Caiado");
        string subject = UniqueSubject();

        await ReportedBy(
            reporter,
            NewDenunciationForm(description: $"{ValidDescription} {subject}", isAnonymous: true));

        PagedDenunciations mine = (await reporter.GetFromJsonAsync<PagedDenunciations>(
            $"/Denunciations/mine?searchTerm={subject}", JsonOptions))!;

        ReadDenunciation listed = Assert.Single(mine.Items);
        Assert.True(listed.IsAnonymous);
        Assert.Null(listed.User);
    }

    [Fact]
    public async Task ListDenunciations_OfAReportWithAnImage_AnswersTheSameAddressToBothSides()
    {
        HttpClient reporter = _factory.CreateClientForNewUser("Alexandre Pontes Milhomem");
        HttpClient moderation = _factory.CreateClientForNewAdministrator("Juliana Espíndola Rabelo");
        string subject = UniqueSubject();

        await ReportedBy(reporter, FormWithImage($"{ValidDescription} {subject}"));

        ReadDenunciation asReporter = Assert.Single((await reporter.GetFromJsonAsync<PagedDenunciations>(
            $"/Denunciations/mine?searchTerm={subject}", JsonOptions))!.Items);
        ReadDenunciation asModeration = Assert.Single((await moderation.GetFromJsonAsync<PagedDenunciations>(
            $"/Denunciations?searchTerm={subject}", JsonOptions))!.Items);

        Assert.True(asReporter.HasImage);
        Assert.Equal($"Denunciations/{asReporter.Id}/image", asReporter.ImageUrl);
        Assert.Equal(asReporter.ImageUrl, asModeration.ImageUrl);
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
    public async Task ListDenunciations_FilteredBySituation_LeavesTheOtherSituationsOut()
    {
        SeededUser reporter = _factory.SeedUser("Cristiane Valadão Pires");
        HttpClient moderation = _factory.CreateClientForNewAdministrator("Anderson Quirino Mota");
        string subject = UniqueSubject();

        _factory.SeedDenunciation(reporter.Id, $"{ValidDescription} {subject}", SeededDay);
        _factory.SeedDenunciation(
            reporter.Id, $"{ValidDescription} {subject}", SeededDay, status: EnumDenunciationStatus.InReview);

        PagedDenunciations open = (await moderation.GetFromJsonAsync<PagedDenunciations>(
            $"/Denunciations?searchTerm={subject}&status={EnumDenunciationStatus.Open}", JsonOptions))!;
        PagedDenunciations inReview = (await moderation.GetFromJsonAsync<PagedDenunciations>(
            $"/Denunciations?searchTerm={subject}&status={EnumDenunciationStatus.InReview}", JsonOptions))!;

        Assert.Equal(EnumDenunciationStatus.Open, Assert.Single(open.Items).Status);
        Assert.Equal(EnumDenunciationStatus.InReview, Assert.Single(inReview.Items).Status);
    }

    [Fact]
    public async Task ListDenunciations_FilteredByOnlyTheStartingDate_CoversThatWholeDay()
    {
        SeededUser reporter = _factory.SeedUser("Heloísa Sampaio Trindade");
        HttpClient moderation = _factory.CreateClientForNewAdministrator("Ubirajara Neves Fontes");
        string subject = UniqueSubject();

        _factory.SeedDenunciation(reporter.Id, $"{ValidDescription} {subject}", SeededDay);

        PagedDenunciations sameDay = (await moderation.GetFromJsonAsync<PagedDenunciations>(
            $"/Denunciations?searchTerm={subject}&dateFrom={Iso(SeededDay)}", JsonOptions))!;
        PagedDenunciations nextDay = (await moderation.GetFromJsonAsync<PagedDenunciations>(
            $"/Denunciations?searchTerm={subject}&dateFrom={Iso(SeededDay.AddDays(1))}", JsonOptions))!;

        Assert.Equal(1, sameDay.Total);
        Assert.Equal(0, nextDay.Total);
    }

    [Fact]
    public async Task ListDenunciations_WithMoreThanOnePage_CutsTheNewestFirst()
    {
        SeededUser reporter = _factory.SeedUser("Fabrício Andrade Bulhões");
        HttpClient moderation = _factory.CreateClientForNewAdministrator("Marcela Tenório Bastos");
        string subject = UniqueSubject();

        _factory.SeedDenunciation(reporter.Id, $"{ValidDescription} {subject} antiga", SeededDay);
        _factory.SeedDenunciation(reporter.Id, $"{ValidDescription} {subject} intermediária", SeededDay.AddDays(1));
        _factory.SeedDenunciation(reporter.Id, $"{ValidDescription} {subject} recente", SeededDay.AddDays(2));

        PagedDenunciations firstPage = (await moderation.GetFromJsonAsync<PagedDenunciations>(
            $"/Denunciations?searchTerm={subject}&page=1&pageSize=2", JsonOptions))!;
        PagedDenunciations secondPage = (await moderation.GetFromJsonAsync<PagedDenunciations>(
            $"/Denunciations?searchTerm={subject}&page=2&pageSize=2", JsonOptions))!;

        Assert.Equal(3, firstPage.Total);
        Assert.Equal(2, firstPage.Items.Count);
        Assert.EndsWith("recente", firstPage.Items[0].Description, StringComparison.Ordinal);
        Assert.EndsWith("intermediária", firstPage.Items[1].Description, StringComparison.Ordinal);
        Assert.EndsWith("antiga", Assert.Single(secondPage.Items).Description, StringComparison.Ordinal);
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
    public async Task UpdateStatus_ResolvingAReportUnderReview_PersistsTheNewSituation()
    {
        SeededUser reporter = _factory.SeedUser("Gustavo Amaral Peçanha");
        HttpClient moderation = _factory.CreateClientForNewAdministrator("Beatriz Nogueira Camargo");
        Guid underReview = _factory.SeedDenunciation(
            reporter.Id, ValidDescription, SeededDay, status: EnumDenunciationStatus.InReview);

        HttpResponseMessage resolution = await moderation.PatchAsJsonAsync(
            $"/Denunciations/{underReview}/status", new { status = nameof(EnumDenunciationStatus.Resolved) });

        ReadDenunciation reread = (await moderation
            .GetFromJsonAsync<ReadDenunciation>($"/Denunciations/{underReview}", JsonOptions))!;

        Assert.Equal(HttpStatusCode.OK, resolution.StatusCode);
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
