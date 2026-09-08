using System.Globalization;
using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using System.Text.Json.Serialization;
using FateConnect.Api.Modules.LostAndFound.Enums;

namespace FateConnect.Api.Tests;

public class LostAndFoundEndpointTests : IClassFixture<ApiFactory>
{
    private static readonly JsonSerializerOptions JsonOptions =
        new(JsonSerializerDefaults.Web) { Converters = { new JsonStringEnumConverter() } };

    private static readonly DateOnly Yesterday = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(-1));

    private static readonly Guid AbsentItemId = new("8a1b0f2e-0000-4000-8000-000000000000");

    private readonly ApiFactory _factory;

    public LostAndFoundEndpointTests(ApiFactory factory)
    {
        _factory = factory;
    }

    private sealed record Contact(string Name, string? Email, string? Phone);

    private sealed record ReadItem(
        Guid Id,
        string Name,
        EnumLostAndFoundType LostAndFoundType,
        string Place,
        DateOnly OcurredOn,
        string? Description,
        string? ImageUrl,
        Contact Contact,
        bool IsOwner,
        EnumStatusLostAndFound Status,
        EnumDeletionReason? DeletionReason);

    private static MultipartFormDataContent NewItemForm(
        string name = "Garrafa térmica azul",
        EnumLostAndFoundType type = EnumLostAndFoundType.Lost,
        string place = "Biblioteca do bloco B",
        string? description = "Ficou na mesa do fundo.",
        DateOnly? ocurredOn = null)
    {
        MultipartFormDataContent form = new()
        {
            { new StringContent(name), "Name" },
            { new StringContent(type.ToString()), "LostAndFoundType" },
            { new StringContent(place), "Place" },
            { new StringContent((ocurredOn ?? Yesterday).ToString("yyyy-MM-dd", CultureInfo.InvariantCulture)), "OcurredOn" },
        };

        if (description is not null)
            form.Add(new StringContent(description), "Description");

        return form;
    }

    private static MultipartFormDataContent StatusForm(EnumStatusLostAndFound status) =>
        new() { { new StringContent(status.ToString()), "Status" } };

    private async Task<(ReadItem Item, int ReporterId, int OtherUserId)> ReportItemAsync(string name)
    {
        SeededUser reporter = _factory.SeedUser("Ana Beatriz Nogueira");
        SeededUser otherUser = _factory.SeedUser("Bruno Carvalho Souza");

        HttpResponseMessage response = await _factory
            .CreateClientFor(reporter.Id)
            .PostAsync("/LostAndFound", NewItemForm(name));

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);

        ReadItem item = (await response.Content.ReadFromJsonAsync<ReadItem>(JsonOptions))!;

        return (item, reporter.Id, otherUser.Id);
    }

    [Fact]
    public async Task CreateItem_AnswersCreatedPointingAtTheItemItSaved()
    {
        SeededUser reporter = _factory.SeedUser("Ana Beatriz Nogueira");
        HttpClient client = _factory.CreateClientFor(reporter.Id);

        HttpResponseMessage response = await client.PostAsync("/LostAndFound", NewItemForm());

        ReadItem created = (await response.Content.ReadFromJsonAsync<ReadItem>(JsonOptions))!;
        HttpResponseMessage atLocation = await client.GetAsync(response.Headers.Location);

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        Assert.Equal(HttpStatusCode.OK, atLocation.StatusCode);
        Assert.Equal(created.Id, (await atLocation.Content.ReadFromJsonAsync<ReadItem>(JsonOptions))!.Id);
    }

    [Fact]
    public async Task CreateItem_RecordsTheAuthenticatedUserAsTheReporter()
    {
        (ReadItem item, _, _) = await ReportItemAsync("Garrafa térmica azul");

        Assert.Equal("Ana Beatriz Nogueira", item.Contact.Name);
        Assert.True(item.IsOwner);
        Assert.Equal(EnumStatusLostAndFound.Open, item.Status);
        Assert.Null(item.DeletionReason);
    }

    [Fact]
    public async Task ReadItem_FlagsOwnershipForEachReader()
    {
        (ReadItem item, int reporterId, int otherUserId) = await ReportItemAsync("Guarda-chuva preto");

        ReadItem asReporter = (await _factory.CreateClientFor(reporterId)
            .GetFromJsonAsync<ReadItem>($"/LostAndFound/{item.Id}", JsonOptions))!;

        ReadItem asOther = (await _factory.CreateClientFor(otherUserId)
            .GetFromJsonAsync<ReadItem>($"/LostAndFound/{item.Id}", JsonOptions))!;

        Assert.True(asReporter.IsOwner);
        Assert.False(asOther.IsOwner);
        Assert.Equal("Ana Beatriz Nogueira", asOther.Contact.Name);
    }

    [Fact]
    public async Task ReadItem_ThatDoesNotExist_IsNotFound()
    {
        HttpClient client = _factory.CreateClientForNewUser("Carla Menezes Duarte");

        HttpResponseMessage response = await client.GetAsync($"/LostAndFound/{AbsentItemId}");

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task UpdateItem_ThatDoesNotExist_IsNotFound()
    {
        HttpClient client = _factory.CreateClientForNewUser("Carla Menezes Duarte");

        HttpResponseMessage response = await client.PatchAsync(
            $"/LostAndFound/{AbsentItemId}", StatusForm(EnumStatusLostAndFound.Resolved));

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task DeleteItem_ThatDoesNotExist_IsNotFound()
    {
        HttpClient client = _factory.CreateClientForNewUser("Carla Menezes Duarte");

        HttpResponseMessage response = await client.DeleteAsync($"/LostAndFound/{AbsentItemId}");

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task UpdateItem_ByAnotherUser_IsForbidden()
    {
        (ReadItem item, _, int otherUserId) = await ReportItemAsync("Caderno de cálculo");

        HttpResponseMessage response = await _factory.CreateClientFor(otherUserId)
            .PatchAsync($"/LostAndFound/{item.Id}", StatusForm(EnumStatusLostAndFound.Resolved));

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    [Fact]
    public async Task DeleteItem_ByAnotherUser_IsForbidden()
    {
        (ReadItem item, _, int otherUserId) = await ReportItemAsync("Carregador de notebook");

        HttpResponseMessage response = await _factory.CreateClientFor(otherUserId)
            .DeleteAsync($"/LostAndFound/{item.Id}");

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    [Fact]
    public async Task UpdateAndDeleteItem_ByTheReporter_Succeed()
    {
        (ReadItem item, int reporterId, _) = await ReportItemAsync("Óculos de grau");
        HttpClient reporter = _factory.CreateClientFor(reporterId);

        HttpResponseMessage update = await reporter.PatchAsync(
            $"/LostAndFound/{item.Id}", StatusForm(EnumStatusLostAndFound.Resolved));

        HttpResponseMessage delete = await reporter.DeleteAsync($"/LostAndFound/{item.Id}");

        Assert.Equal(HttpStatusCode.OK, update.StatusCode);
        Assert.Equal(HttpStatusCode.NoContent, delete.StatusCode);
    }

    [Fact]
    public async Task DeleteItem_ByTheReporter_MarksItDeletedNamingTheReason()
    {
        (ReadItem item, int reporterId, _) = await ReportItemAsync("Chave com chaveiro vermelho");
        HttpClient reporter = _factory.CreateClientFor(reporterId);

        await reporter.DeleteAsync($"/LostAndFound/{item.Id}");

        ReadItem deleted = (await reporter.GetFromJsonAsync<ReadItem>($"/LostAndFound/{item.Id}", JsonOptions))!;
        Assert.Equal(EnumStatusLostAndFound.Deleted, deleted.Status);
        Assert.Equal(EnumDeletionReason.User, deleted.DeletionReason);
    }

    [Fact]
    public async Task UpdateItem_RestoringADeletedItem_ClearsTheDeletionReason()
    {
        (ReadItem item, int reporterId, _) = await ReportItemAsync("Fone de ouvido sem fio");
        HttpClient reporter = _factory.CreateClientFor(reporterId);
        await reporter.DeleteAsync($"/LostAndFound/{item.Id}");

        ReadItem restored = (await (await reporter.PatchAsync(
            $"/LostAndFound/{item.Id}", StatusForm(EnumStatusLostAndFound.Open)))
            .Content.ReadFromJsonAsync<ReadItem>(JsonOptions))!;

        Assert.Equal(EnumStatusLostAndFound.Open, restored.Status);
        Assert.Null(restored.DeletionReason);
    }

    [Fact]
    public async Task UpdateItem_WithAnEmptyDescription_IsAccepted()
    {
        (ReadItem item, int reporterId, _) = await ReportItemAsync("Mochila cinza");

        MultipartFormDataContent form = new() { { new StringContent(string.Empty), "Description" } };

        HttpResponseMessage response = await _factory.CreateClientFor(reporterId)
            .PatchAsync($"/LostAndFound/{item.Id}", form);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal(string.Empty, (await response.Content.ReadFromJsonAsync<ReadItem>(JsonOptions))!.Description);
    }

    [Fact]
    public async Task CreateItem_WithoutADescription_IsAccepted()
    {
        HttpClient client = _factory.CreateClientForNewUser("Daniela Prado Vieira");

        HttpResponseMessage response = await client.PostAsync("/LostAndFound", NewItemForm(description: null));

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        Assert.Null((await response.Content.ReadFromJsonAsync<ReadItem>(JsonOptions))!.Description);
    }

    [Fact]
    public async Task CreateItem_WithAnOccurrenceInTheFuture_IsRejectedWithTheDomainMessage()
    {
        HttpClient client = _factory.CreateClientForNewUser("Eduardo Ramos Lima");
        DateOnly tomorrow = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(2));

        HttpResponseMessage response = await client.PostAsync("/LostAndFound", NewItemForm(ocurredOn: tomorrow));

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        Assert.Contains("A data do ocorrido não pode ser no futuro.", await response.Content.ReadAsStringAsync());
    }

    [Fact]
    public async Task CreateItem_WithAFileThatIsNotAnImage_IsRejected()
    {
        HttpClient client = _factory.CreateClientForNewUser("Fernanda Lopes Teixeira");

        MultipartFormDataContent form = NewItemForm();
        ByteArrayContent payload = new([0x3C, 0x21, 0x64, 0x6F, 0x63]);
        payload.Headers.ContentType = new MediaTypeHeaderValue("text/html");
        form.Add(payload, "Image", "payload.html");

        HttpResponseMessage response = await client.PostAsync("/LostAndFound", form);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        Assert.Contains("Formato de imagem não suportado", await response.Content.ReadAsStringAsync());
    }
}
