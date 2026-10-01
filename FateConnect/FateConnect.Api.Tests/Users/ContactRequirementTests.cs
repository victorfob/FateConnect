using System.Globalization;
using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using FateConnect.Api.Modules.Users.Exceptions;
using FateConnect.Api.Tests.Fixtures;

namespace FateConnect.Api.Tests.Users;

public class ContactRequirementTests(ApiFactory factory) : IClassFixture<ApiFactory>
{
    private const string KeptPhone = "15990001111";

    private static object NewRidePayload() => new
    {
        destination = "Sorocaba centro",
        departureDate = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(7)).ToString("yyyy-MM-dd", CultureInfo.InvariantCulture),
        departureTime = "08:30:00",
        rideType = "Solidarity",
        vehicleType = "Car",
        description = "Vaga para quem sai do campus.",
    };

    private static MultipartFormDataContent NewItemForm() => new()
    {
        { new StringContent("Garrafa térmica azul"), "Name" },
        { new StringContent("Lost"), "LostAndFoundType" },
        { new StringContent("Biblioteca do bloco B"), "Place" },
        { new StringContent(DateOnly.FromDateTime(DateTime.UtcNow.AddDays(-1)).ToString("yyyy-MM-dd", CultureInfo.InvariantCulture)), "OcurredOn" },
    };

    private static MultipartFormDataContent NewDenunciationForm(bool isAnonymous) => new()
    {
        { new StringContent("ImproperCharging"), "Category" },
        { new StringContent("O motorista cobrou valor acima do combinado na carona de ontem."), "Description" },
        { new StringContent(isAnonymous.ToString(CultureInfo.InvariantCulture)), "IsAnonymous" },
    };

    private static MultipartFormDataContent ContactForm(string? phone, string? contactEmail)
    {
        MultipartFormDataContent form = [];

        if (phone is not null)
            form.Add(new StringContent(phone), "Phone");

        if (contactEmail is not null)
            form.Add(new StringContent(contactEmail), "ContactEmail");

        return form;
    }

    private static async Task<(string? Code, string? Error)> ErrorOf(HttpResponseMessage response)
    {
        using JsonDocument body = JsonDocument.Parse(await response.Content.ReadAsStringAsync());

        return (body.RootElement.GetProperty("code").GetString(), body.RootElement.GetProperty("error").GetString());
    }

    private static async Task<JsonElement> ProfileOf(HttpClient client) =>
        JsonDocument.Parse(await client.GetStringAsync("/Users/me")).RootElement;

    [Fact]
    public async Task CreateRide_WithoutContact_IsForbiddenNamingTheMissingContact()
    {
        HttpClient client = factory.CreateClientFor(factory.SeedUserWithoutContact("Mariana Alves Rocha"));

        HttpResponseMessage response = await client.PostAsJsonAsync("/Rides", NewRidePayload());

        (string? code, string? error) = await ErrorOf(response);
        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
        Assert.Equal(ContactRequiredException.ErrorCode, code);
        Assert.Equal("Para ofertar carona, cadastre telefone e e-mail para contato em Meu perfil.", error);
    }

    [Fact]
    public async Task CreateItem_WithoutContact_IsForbiddenNamingTheMissingContact()
    {
        HttpClient client = factory.CreateClientFor(factory.SeedUserWithoutContact("Bruno Carvalho Souza"));

        HttpResponseMessage response = await client.PostAsync("/LostAndFound", NewItemForm());

        (string? code, string? error) = await ErrorOf(response);
        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
        Assert.Equal(ContactRequiredException.ErrorCode, code);
        Assert.Equal("Para cadastrar um item, cadastre telefone e e-mail para contato em Meu perfil.", error);
    }

    [Fact]
    public async Task CreateRideAndItem_WithContact_AreCreated()
    {
        HttpClient client = factory.CreateClientForNewUser("Carla Dias Mendes");

        HttpResponseMessage ride = await client.PostAsJsonAsync("/Rides", NewRidePayload());
        HttpResponseMessage item = await client.PostAsync("/LostAndFound", NewItemForm());

        Assert.Equal(HttpStatusCode.Created, ride.StatusCode);
        Assert.Equal(HttpStatusCode.Created, item.StatusCode);
    }

    [Fact]
    public async Task CreateDenunciation_WithoutSecrecyAndWithoutContact_IsForbiddenOfferingTheSecretOne()
    {
        HttpClient client = factory.CreateClientFor(factory.SeedUserWithoutContact("Otávio Lins Barreto"));

        HttpResponseMessage response = await client.PostAsync("/Denunciations", NewDenunciationForm(isAnonymous: false));

        (string? code, string? error) = await ErrorOf(response);
        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
        Assert.Equal(ContactRequiredException.ErrorCode, code);
        Assert.Equal(
            "Para enviar uma denúncia sem sigilo, cadastre telefone e e-mail para contato em Meu perfil, ou marque a denúncia como sigilosa.",
            error);
    }

    [Fact]
    public async Task CreateDenunciation_WithoutSecrecyAndWithContact_IsCreated()
    {
        HttpClient client = factory.CreateClientForNewUser("Paula Siqueira Rios");

        HttpResponseMessage response = await client.PostAsync("/Denunciations", NewDenunciationForm(isAnonymous: false));

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
    }

    [Fact]
    public async Task WithoutContact_ListingAndTheSecretDenunciation_KeepWorking()
    {
        HttpClient client = factory.CreateClientFor(factory.SeedUserWithoutContact("Diego Nunes Peixoto"));

        HttpResponseMessage rides = await client.GetAsync("/Rides");
        HttpResponseMessage items = await client.GetAsync("/LostAndFound");
        HttpResponseMessage denunciation = await client.PostAsync("/Denunciations", NewDenunciationForm(isAnonymous: true));

        Assert.Equal(HttpStatusCode.OK, rides.StatusCode);
        Assert.Equal(HttpStatusCode.OK, items.StatusCode);
        Assert.Equal(HttpStatusCode.Created, denunciation.StatusCode);
    }

    [Fact]
    public async Task UpdateProfile_CompletingBothContacts_LiftsTheRestriction()
    {
        HttpClient client = factory.CreateClientFor(factory.SeedUserWithoutContact("Elisa Moura Campos"));

        HttpResponseMessage update = await client.PatchAsync(
            "/Users/me",
            ContactForm(ApiFactory.UniquePhone(), ApiFactory.UniqueContactEmail()));
        HttpResponseMessage ride = await client.PostAsJsonAsync("/Rides", NewRidePayload());

        Assert.Equal(HttpStatusCode.OK, update.StatusCode);
        Assert.Equal(HttpStatusCode.Created, ride.StatusCode);
    }

    [Theory]
    [InlineData(KeptPhone, null)]
    [InlineData(null, "fabio.lima@gmail.com")]
    public async Task UpdateProfile_WithOnlyOneContactField_WithoutContact_IsRejected(string? phone, string? contactEmail)
    {
        HttpClient client = factory.CreateClientFor(factory.SeedUserWithoutContact("Fábio Tavares Lima"));

        HttpResponseMessage response = await client.PatchAsync("/Users/me", ContactForm(phone, contactEmail));

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        Assert.Equal(JsonValueKind.Null, (await ProfileOf(client)).GetProperty("phone").ValueKind);
    }

    [Fact]
    public async Task UpdateProfile_WithoutContact_ChangingOnlyTheName_StaysWithoutContact()
    {
        HttpClient client = factory.CreateClientFor(factory.SeedUserWithoutContact("Laura Pimentel Assis"));
        MultipartFormDataContent form = new() { { new StringContent("Laura Pimentel Assis Neto"), "FullName" } };

        HttpResponseMessage response = await client.PatchAsync("/Users/me", form);

        JsonElement profile = await ProfileOf(client);
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal("Laura Pimentel Assis Neto", profile.GetProperty("fullName").GetString());
        Assert.Equal(JsonValueKind.Null, profile.GetProperty("phone").ValueKind);
    }

    [Fact]
    public async Task UpdateProfile_WithEmptyContactFields_KeepsTheContact()
    {
        SeededUser person = factory.SeedUser("Gabriela Freitas Rocha");
        HttpClient client = factory.CreateClientFor(person.Id);

        HttpResponseMessage response = await client.PatchAsync("/Users/me", ContactForm(string.Empty, string.Empty));

        JsonElement profile = await ProfileOf(client);
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal(person.Phone, profile.GetProperty("phone").GetString());
        Assert.Equal(person.ContactEmail, profile.GetProperty("contactEmail").GetString());
    }

    [Fact]
    public async Task UpdateUser_WithOnlyThePhone_OfAnAccountWithoutContact_IsRejected()
    {
        int personId = factory.SeedUserWithoutContact("Heitor Barros Queiroz");
        HttpClient administrator = factory.CreateClientForNewAdministrator("Isabela Prado Martins");

        HttpResponseMessage response = await administrator.PatchAsJsonAsync($"/Users/{personId}", new { phone = KeptPhone });

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task UpdateUser_ClearingThePhone_KeepsTheContact()
    {
        SeededUser person = factory.SeedUser("João Ribeiro Costa");
        HttpClient administrator = factory.CreateClientForNewAdministrator("Kátia Lemos Barros");

        HttpResponseMessage response = await administrator.PatchAsJsonAsync($"/Users/{person.Id}", new { phone = string.Empty });

        JsonElement stored = JsonDocument.Parse(await administrator.GetStringAsync($"/Users/{person.Id}")).RootElement;
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        Assert.Equal(person.Phone, stored.GetProperty("phone").GetString());
    }
}
