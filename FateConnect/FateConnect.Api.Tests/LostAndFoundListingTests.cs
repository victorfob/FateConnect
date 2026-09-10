using System.Globalization;
using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using System.Text.Json.Serialization;
using FateConnect.Api.Modules.LostAndFound.Enums;

namespace FateConnect.Api.Tests;

public class LostAndFoundListingTests : IClassFixture<ApiFactory>
{
    private static readonly JsonSerializerOptions JsonOptions =
        new(JsonSerializerDefaults.Web) { Converters = { new JsonStringEnumConverter() } };

    private static readonly DateOnly Yesterday = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(-1));

    private readonly ApiFactory _factory;

    public LostAndFoundListingTests(ApiFactory factory)
    {
        _factory = factory;
    }

    private sealed record ListedItem(Guid Id, string Name, string? Description, EnumStatusLostAndFound Status, bool IsOwner);

    private sealed record PagedItems(IReadOnlyList<ListedItem> Items, int Page, int PageSize, int Total);

    private static MultipartFormDataContent ItemForm(
        string name,
        EnumLostAndFoundType type = EnumLostAndFoundType.Lost,
        string? description = null,
        DateOnly? ocurredOn = null)
    {
        MultipartFormDataContent form = new()
        {
            { new StringContent(name), "Name" },
            { new StringContent(type.ToString()), "LostAndFoundType" },
            { new StringContent("Biblioteca do bloco B"), "Place" },
            { new StringContent((ocurredOn ?? Yesterday).ToString("yyyy-MM-dd", CultureInfo.InvariantCulture)), "OcurredOn" },
        };

        if (description is not null)
            form.Add(new StringContent(description), "Description");

        return form;
    }

    private static async Task<Guid> ReportAsync(HttpClient client, MultipartFormDataContent form)
    {
        HttpResponseMessage response = await client.PostAsync("/LostAndFound", form);

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);

        return (await response.Content.ReadFromJsonAsync<ListedItem>(JsonOptions))!.Id;
    }

    private static async Task<PagedItems> ListAsync(HttpClient client, string query) =>
        (await client.GetFromJsonAsync<PagedItems>($"/LostAndFound{query}", JsonOptions))!;

    [Theory]
    [InlineData("Cachecol de lã cinza", "cachecol de la")]
    [InlineData("Cachecol de la cinza", "cachecol de lã")]
    public async Task GetItems_FilteredBySearchTerm_IgnoresAccentsAndCase(string name, string search)
    {
        HttpClient client = _factory.CreateClientForNewUser("Ana Beatriz Nogueira");
        Guid id = await ReportAsync(client, ItemForm(name));

        PagedItems page = await ListAsync(client, $"?SearchTerm={Uri.EscapeDataString(search.ToUpperInvariant())}");

        Assert.Contains(page.Items, item => item.Id == id);
    }

    [Fact]
    public async Task GetItems_FilteredBySearchTerm_AlsoMatchesTheDescription()
    {
        HttpClient client = _factory.CreateClientForNewUser("Bruno Carvalho Souza");
        Guid id = await ReportAsync(client, ItemForm("Estojo azul", description: "Tinha um adesivo do grêmio."));

        PagedItems page = await ListAsync(client, "?SearchTerm=gremio");

        Assert.Contains(page.Items, item => item.Id == id);
    }

    [Fact]
    public async Task GetItems_FilteredBySearchTerm_LeavesOutWhatDoesNotMatch()
    {
        HttpClient client = _factory.CreateClientForNewUser("Carla Menezes Duarte");
        Guid matching = await ReportAsync(client, ItemForm("Caneca de porcelana"));
        Guid other = await ReportAsync(client, ItemForm("Tênis de corrida"));

        PagedItems page = await ListAsync(client, "?SearchTerm=caneca");

        Assert.Contains(page.Items, item => item.Id == matching);
        Assert.DoesNotContain(page.Items, item => item.Id == other);
    }

    [Fact]
    public async Task GetItems_FilteredByType_KeepsOnlyTheItemsOfThatType()
    {
        HttpClient client = _factory.CreateClientForNewUser("Daniela Prado Vieira");
        Guid lost = await ReportAsync(client, ItemForm("Pulseira dourada Daniela", EnumLostAndFoundType.Lost));
        Guid found = await ReportAsync(client, ItemForm("Pulseira prateada Daniela", EnumLostAndFoundType.Found));

        PagedItems page = await ListAsync(client, "?SearchTerm=Daniela&LostAndFoundType=Found");

        Assert.Contains(page.Items, item => item.Id == found);
        Assert.DoesNotContain(page.Items, item => item.Id == lost);
    }

    [Fact]
    public async Task GetItems_FilteredByOccurrenceDate_KeepsOnlyWhatHappenedThatDay()
    {
        HttpClient client = _factory.CreateClientForNewUser("Eduardo Ramos Lima");
        DateOnly lastWeek = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(-7));
        Guid yesterday = await ReportAsync(client, ItemForm("Boné do Eduardo"));
        Guid older = await ReportAsync(client, ItemForm("Cinto do Eduardo", ocurredOn: lastWeek));

        PagedItems page = await ListAsync(
            client, $"?SearchTerm=Eduardo&DateFrom={lastWeek:yyyy-MM-dd}&DateTo={lastWeek:yyyy-MM-dd}");

        Assert.Contains(page.Items, item => item.Id == older);
        Assert.DoesNotContain(page.Items, item => item.Id == yesterday);
    }

    [Fact]
    public async Task GetItems_FilteredByStatus_KeepsOnlyTheItemsInThatStatus()
    {
        HttpClient client = _factory.CreateClientForNewUser("Fernanda Lopes Teixeira");
        Guid open = await ReportAsync(client, ItemForm("Agenda da Fernanda"));
        Guid deleted = await ReportAsync(client, ItemForm("Marcador da Fernanda"));
        await client.DeleteAsync($"/LostAndFound/{deleted}");

        PagedItems page = await ListAsync(client, "?SearchTerm=Fernanda&Status=Deleted");

        Assert.Contains(page.Items, item => item.Id == deleted);
        Assert.DoesNotContain(page.Items, item => item.Id == open);
    }

    [Fact]
    public async Task GetItems_WithoutAStatus_ReturnsEveryStatus()
    {
        HttpClient client = _factory.CreateClientForNewUser("Gabriel Moreira Pinto");
        Guid open = await ReportAsync(client, ItemForm("Squeeze do Gabriel"));
        Guid deleted = await ReportAsync(client, ItemForm("Toalha do Gabriel"));
        await client.DeleteAsync($"/LostAndFound/{deleted}");

        PagedItems page = await ListAsync(client, "?SearchTerm=Gabriel");

        Assert.Contains(page.Items, item => item.Id == open);
        Assert.Contains(page.Items, item => item.Id == deleted);
    }

    [Fact]
    public async Task GetItems_WithOnlyMine_LeavesOutWhatOtherPeopleReported()
    {
        HttpClient mine = _factory.CreateClientForNewUser("Helena Souza Braga");
        HttpClient theirs = _factory.CreateClientForNewUser("Igor Fontenele Alves");
        Guid myItem = await ReportAsync(mine, ItemForm("Umbrella compartilhada Helena"));
        Guid theirItem = await ReportAsync(theirs, ItemForm("Umbrella compartilhada Igor"));

        PagedItems page = await ListAsync(mine, "?SearchTerm=Umbrella compartilhada&OnlyMine=true");

        Assert.Contains(page.Items, item => item.Id == myItem);
        Assert.DoesNotContain(page.Items, item => item.Id == theirItem);
    }

    [Fact]
    public async Task GetItems_WithoutOnlyMine_ReturnsWhatOtherPeopleReported()
    {
        HttpClient mine = _factory.CreateClientForNewUser("Joana Ribeiro Castro");
        HttpClient theirs = _factory.CreateClientForNewUser("Kleber Antunes Faria");
        Guid theirItem = await ReportAsync(theirs, ItemForm("Estojo compartilhado Kleber"));

        PagedItems page = await ListAsync(mine, "?SearchTerm=Estojo compartilhado");

        Assert.Contains(page.Items, item => item.Id == theirItem);
        Assert.DoesNotContain(page.Items, item => item.IsOwner);
    }

    [Fact]
    public async Task GetItems_WithAPageSize_CutsThePageAndKeepsTheTotal()
    {
        HttpClient client = _factory.CreateClientForNewUser("Larissa Nunes Peixoto");
        await ReportAsync(client, ItemForm("Chaveiro numerado Larissa um"));
        await ReportAsync(client, ItemForm("Chaveiro numerado Larissa dois"));
        await ReportAsync(client, ItemForm("Chaveiro numerado Larissa tres"));

        PagedItems page = await ListAsync(client, "?SearchTerm=Chaveiro numerado Larissa&PageSize=2");

        Assert.Equal(2, page.Items.Count);
        Assert.Equal(2, page.PageSize);
        Assert.Equal(1, page.Page);
        Assert.Equal(3, page.Total);
    }

    [Fact]
    public async Task GetItems_WithASecondPage_ReturnsWhatFollowsTheFirst()
    {
        HttpClient client = _factory.CreateClientForNewUser("Marcos Vinicius Prado");
        await ReportAsync(client, ItemForm("Cartão numerado Marcos um"));
        await ReportAsync(client, ItemForm("Cartão numerado Marcos dois"));
        await ReportAsync(client, ItemForm("Cartão numerado Marcos tres"));

        PagedItems first = await ListAsync(client, "?SearchTerm=Cartão numerado Marcos&PageSize=2");
        PagedItems second = await ListAsync(client, "?SearchTerm=Cartão numerado Marcos&PageSize=2&Page=2");

        Assert.Single(second.Items);
        Assert.DoesNotContain(second.Items, item => first.Items.Any(previous => previous.Id == item.Id));
    }

    [Fact]
    public async Task GetItems_FilteredByAClosedDateRange_KeepsBothEndsOfTheRange()
    {
        HttpClient client = _factory.CreateClientForNewUser("Camila Duarte Prado");
        DateOnly threeDaysAgo = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(-3));
        DateOnly twoDaysAgo = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(-2));
        DateOnly lastWeek = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(-7));
        Guid inside = await ReportAsync(client, ItemForm("Guarda-chuva da Camila", ocurredOn: threeDaysAgo));
        Guid alsoInside = await ReportAsync(client, ItemForm("Caderno da Camila", ocurredOn: twoDaysAgo));
        Guid outside = await ReportAsync(client, ItemForm("Chaveiro da Camila", ocurredOn: lastWeek));

        PagedItems page = await ListAsync(
            client, $"?SearchTerm=Camila&DateFrom={threeDaysAgo:yyyy-MM-dd}&DateTo={twoDaysAgo:yyyy-MM-dd}");

        Assert.Contains(page.Items, item => item.Id == inside);
        Assert.Contains(page.Items, item => item.Id == alsoInside);
        Assert.DoesNotContain(page.Items, item => item.Id == outside);
    }

    [Fact]
    public async Task GetItems_FilteredByOnlyTheEndDate_KeepsThatDayAlone()
    {
        HttpClient client = _factory.CreateClientForNewUser("Rafael Antunes Vieira");
        DateOnly lastWeek = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(-7));
        Guid yesterday = await ReportAsync(client, ItemForm("Mochila do Rafael"));
        Guid older = await ReportAsync(client, ItemForm("Fone do Rafael", ocurredOn: lastWeek));

        PagedItems page = await ListAsync(client, $"?SearchTerm=Rafael&DateTo={lastWeek:yyyy-MM-dd}");

        Assert.Contains(page.Items, item => item.Id == older);
        Assert.DoesNotContain(page.Items, item => item.Id == yesterday);
    }

    [Fact]
    public async Task GetItems_WithoutAnyDate_KeepsEveryItem()
    {
        HttpClient client = _factory.CreateClientForNewUser("Larissa Moreira Pinto");
        DateOnly lastWeek = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(-7));
        Guid yesterday = await ReportAsync(client, ItemForm("Cachecol da Larissa"));
        Guid older = await ReportAsync(client, ItemForm("Luva da Larissa", ocurredOn: lastWeek));

        PagedItems page = await ListAsync(client, "?SearchTerm=Larissa");

        Assert.Contains(page.Items, item => item.Id == yesterday);
        Assert.Contains(page.Items, item => item.Id == older);
    }

    [Fact]
    public async Task GetItems_WithTheEndDateBeforeTheStartDate_IsRejected()
    {
        HttpClient client = _factory.CreateClientForNewUser("Thiago Barros Mendes");
        DateOnly lastWeek = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(-7));
        DateOnly yesterday = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(-1));

        HttpResponseMessage response = await client.GetAsync(
            $"/LostAndFound?DateFrom={yesterday:yyyy-MM-dd}&DateTo={lastWeek:yyyy-MM-dd}");

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        Assert.Contains(
            "anterior à data inicial",
            await response.Content.ReadAsStringAsync(),
            StringComparison.Ordinal);
    }
}
