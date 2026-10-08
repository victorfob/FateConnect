using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using System.Text.Json.Serialization;
using FateConnect.Api.Modules.Auth.DTOs;
using FateConnect.Api.Modules.Users.Enums;
using FateConnect.Api.Tests.Fixtures;

namespace FateConnect.Api.Tests.Users;

public class UserManagementEndpointTests(ApiFactory factory) : IClassFixture<ApiFactory>
{
    private const string KnownPassword = "SenhaForte123!";
    private const int AbsentUserId = 987654;

    private static readonly JsonSerializerOptions JsonOptions =
        new(JsonSerializerDefaults.Web) { Converters = { new JsonStringEnumConverter() } };

    private sealed record ReadUser(
        int Id,
        string FatecEmail,
        string FullName,
        string Phone,
        string ContactEmail,
        string? ImageUrl,
        string? ThumbnailUrl,
        EnumProfileType ProfileType,
        EnumAccountStatus Status);

    private sealed record UserSummary(
        int Id,
        string FullName,
        string ContactEmail,
        string? Phone,
        string? ImageUrl,
        string? ThumbnailUrl,
        EnumAccountStatus Status);

    private sealed record PagedUsers(List<UserSummary> Items, int Total);

    private HttpClient ClientWith(string token)
    {
        HttpClient client = factory.CreateClient();
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

        return client;
    }

    private async Task<HttpResponseMessage> LoginAsync(string fatecEmail) =>
        await factory.CreateClient().PostAsJsonAsync("/Auth/login", new { fatecEmail, password = KnownPassword });

    private async Task<HttpClient> SignedInClientOf(string fatecEmail)
    {
        HttpResponseMessage login = await LoginAsync(fatecEmail);
        TokenResponseDto body = (await login.Content.ReadFromJsonAsync<TokenResponseDto>())!;

        return ClientWith(body.Token);
    }

    private (int Id, HttpClient Client) SignedInAdministrator(string fullName)
    {
        int administratorId = factory.SeedUser(fullName, EnumProfileType.Administrator).Id;

        return (administratorId, factory.CreateClientFor(administratorId, profileType: EnumProfileType.Administrator));
    }

    private static async Task<PagedUsers> PageFrom(HttpResponseMessage response) =>
        (await response.Content.ReadFromJsonAsync<PagedUsers>(JsonOptions))!;

    private static async Task<ReadUser> ReadUserFrom(HttpResponseMessage response) =>
        (await response.Content.ReadFromJsonAsync<ReadUser>(JsonOptions))!;

    [Fact]
    public async Task ListUsers_AsOperator_IsForbidden()
    {
        HttpClient client = factory.CreateClientForNewUser("Sérgio Pacheco Neves");

        HttpResponseMessage response = await client.GetAsync("/Users");

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    [Fact]
    public async Task ListUsers_SearchedByName_FindsOnlyWhoMatches()
    {
        SeededUser matching = factory.SeedUser("Tatiana Quintela Vargas");
        factory.SeedUser("Ulisses Moreira Braga");
        HttpClient administrator = factory.CreateClientForNewAdministrator("Vanessa Lacerda Fontes");

        HttpResponseMessage response = await administrator.GetAsync("/Users?Search=Quintela");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        UserSummary found = Assert.Single((await PageFrom(response)).Items);
        Assert.Equal(matching.Id, found.Id);
        Assert.Equal(matching.ContactEmail, found.ContactEmail);
    }

    [Theory]
    [InlineData("uploads/user/perfil.png", "uploads/user/thumbnails/perfil.webp")]
    [InlineData(null, null)]
    public async Task ListUsers_OfAPersonWithOrWithoutAPhoto_AnswersTheOriginalAndTheThumbnailOrNull(string? imageUrl, string? thumbnailUrl)
    {
        SeededUser person = factory.SeedUser("Jussara Leme Antunes", imageUrl: imageUrl);
        HttpClient administrator = factory.CreateClientForNewAdministrator("Karina Bueno Siqueira");

        HttpResponseMessage response = await administrator.GetAsync($"/Users?Search={person.ContactEmail}");

        UserSummary found = Assert.Single((await PageFrom(response)).Items);
        Assert.Equal(imageUrl, found.ImageUrl);
        Assert.Equal(thumbnailUrl, found.ThumbnailUrl);
    }

    [Fact]
    public async Task ListUsers_FilteredByStatus_LeavesTheOtherStatusesOut()
    {
        (int bannedId, _) = factory.SeedUserWithPassword("Wagner Esteves Lobato", KnownPassword, EnumAccountStatus.Banned);
        factory.SeedUserWithPassword("Xênia Esteves Lobato", KnownPassword);
        HttpClient administrator = factory.CreateClientForNewAdministrator("Yara Figueiredo Assis");

        HttpResponseMessage response = await administrator.GetAsync("/Users?Search=Lobato&Status=Banned");

        UserSummary found = Assert.Single((await PageFrom(response)).Items);
        Assert.Equal(bannedId, found.Id);
    }

    [Fact]
    public async Task GetUser_AsAdministrator_AnswersTheContact()
    {
        SeededUser person = factory.SeedUser("Zeca Albuquerque Rosa");
        HttpClient administrator = factory.CreateClientForNewAdministrator("Alice Monteiro Brandão");

        HttpResponseMessage response = await administrator.GetAsync($"/Users/{person.Id}");

        ReadUser body = await ReadUserFrom(response);
        Assert.Equal(person.Phone, body.Phone);
        Assert.Equal(person.ContactEmail, body.ContactEmail);
    }

    [Theory]
    [InlineData("uploads/user/perfil.png", "uploads/user/thumbnails/perfil.webp")]
    [InlineData(null, null)]
    public async Task GetUser_WithOrWithoutAPhoto_AnswersTheOriginalAndTheThumbnailOrNull(string? imageUrl, string? thumbnailUrl)
    {
        SeededUser person = factory.SeedUser("Lauro Pacheco Diniz", imageUrl: imageUrl);
        HttpClient administrator = factory.CreateClientForNewAdministrator("Míriam Couto Esteves");

        HttpResponseMessage response = await administrator.GetAsync($"/Users/{person.Id}");

        ReadUser body = await ReadUserFrom(response);
        Assert.Equal(imageUrl, body.ImageUrl);
        Assert.Equal(thumbnailUrl, body.ThumbnailUrl);
    }

    [Fact]
    public async Task GetUser_OfAnIdentifierThatIsNotThere_IsNotFound()
    {
        HttpClient administrator = factory.CreateClientForNewAdministrator("Bernardo Siqueira Pinto");

        HttpResponseMessage response = await administrator.GetAsync($"/Users/{AbsentUserId}");

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task UpdateUser_WithANewInstitutionalEmail_LetsItSignIn()
    {
        (int id, _) = factory.SeedUserWithPassword("Camila Vasconcelos Reis", KnownPassword);
        string newEmail = $"{Guid.NewGuid():N}@aluno.cps.sp.gov.br";
        HttpClient administrator = factory.CreateClientForNewAdministrator("Daniel Portela Arruda");
        await administrator.PatchAsJsonAsync($"/Users/{id}", new { fatecEmail = newEmail });

        HttpResponseMessage response = await LoginAsync(newEmail);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    [Fact]
    public async Task UpdateUser_WithTheInstitutionalEmailOfAnotherAccount_IsAConflictOnThatField()
    {
        (int id, _) = factory.SeedUserWithPassword("Eduarda Salgado Viana", KnownPassword);
        (_, string takenEmail) = factory.SeedUserWithPassword("Felipe Cardoso Amaral", KnownPassword);
        HttpClient administrator = factory.CreateClientForNewAdministrator("Giovana Teles Barreto");

        HttpResponseMessage response = await administrator.PatchAsJsonAsync($"/Users/{id}", new { fatecEmail = takenEmail });

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
        using JsonDocument body = JsonDocument.Parse(await response.Content.ReadAsStringAsync());
        Assert.Equal("fatecEmail", body.RootElement.GetProperty("field").GetString());
    }

    [Fact]
    public async Task ChangeProfile_Promoting_TakesEffectAtTheNextLogin()
    {
        (int id, string fatecEmail) = factory.SeedUserWithPassword("Hugo Batista Correia", KnownPassword);
        HttpClient administrator = factory.CreateClientForNewAdministrator("Ingrid Lemos Faria");
        await administrator.PatchAsJsonAsync($"/Users/{id}/profile", new { profileType = "Administrator" });
        HttpClient promoted = await SignedInClientOf(fatecEmail);

        HttpResponseMessage response = await promoted.GetAsync("/Users");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    [Fact]
    public async Task ChangeProfile_Demoting_EndsTheSessionOfTheTarget()
    {
        (int id, string fatecEmail) = factory.SeedUserWithPassword("Júlia Nogueira Sampaio", KnownPassword);
        HttpClient administrator = factory.CreateClientForNewAdministrator("Kleber Aragão Motta");
        await administrator.PatchAsJsonAsync($"/Users/{id}/profile", new { profileType = "Administrator" });
        HttpClient target = await SignedInClientOf(fatecEmail);
        await administrator.PatchAsJsonAsync($"/Users/{id}/profile", new { profileType = "Operator" });

        HttpResponseMessage response = await target.GetAsync("/Auth/session");

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task ChangeProfile_OfTheOwnAccount_IsRefused()
    {
        (int ownId, HttpClient administrator) = SignedInAdministrator("Larissa Peixoto Bastos");

        HttpResponseMessage response = await administrator.PatchAsJsonAsync($"/Users/{ownId}/profile", new { profileType = "Operator" });

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task ChangeStatus_OfTheOwnAccount_IsRefused()
    {
        (int ownId, HttpClient administrator) = SignedInAdministrator("Lívia Monteiro Galvão");

        HttpResponseMessage response = await administrator.PatchAsJsonAsync($"/Users/{ownId}/status", new { status = "Banned" });

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task ChangeStatus_Banning_RefusesTheNextLogin()
    {
        (int id, string fatecEmail) = factory.SeedUserWithPassword("Márcio Quaresma Dantas", KnownPassword);
        HttpClient administrator = factory.CreateClientForNewAdministrator("Natália Rios Carvalho");
        await administrator.PatchAsJsonAsync($"/Users/{id}/status", new { status = "Banned" });

        HttpResponseMessage response = await LoginAsync(fatecEmail);

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    [Fact]
    public async Task ChangeStatus_Banning_EndsTheSessionOfTheTarget()
    {
        (int id, string fatecEmail) = factory.SeedUserWithPassword("Otávio Resende Lins", KnownPassword);
        HttpClient target = await SignedInClientOf(fatecEmail);
        HttpClient administrator = factory.CreateClientForNewAdministrator("Priscila Amorim Tavares");
        await administrator.PatchAsJsonAsync($"/Users/{id}/status", new { status = "Banned" });

        HttpResponseMessage response = await target.GetAsync("/Auth/session");

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task ChangeStatus_RevertingTheBan_LetsTheAccountSignInAgain()
    {
        (int id, string fatecEmail) = factory.SeedUserWithPassword("Quitéria Lobo Fernandes", KnownPassword, EnumAccountStatus.Banned);
        HttpClient administrator = factory.CreateClientForNewAdministrator("Rafael Couto Magalhães");
        await administrator.PatchAsJsonAsync($"/Users/{id}/status", new { status = "Active" });

        HttpResponseMessage response = await LoginAsync(fatecEmail);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    [Theory]
    [InlineData(EnumAccountStatus.SelfDeactivated, "Active")]
    [InlineData(EnumAccountStatus.Active, "Active")]
    [InlineData(EnumAccountStatus.Active, "SelfDeactivated")]
    public async Task ChangeStatus_OutsideBanningAndItsReversal_IsRefused(EnumAccountStatus current, string requested)
    {
        (int id, _) = factory.SeedUserWithPassword("Sabrina Toledo Ferraz", KnownPassword, current);
        HttpClient administrator = factory.CreateClientForNewAdministrator("Thiago Sarmento Borges");

        HttpResponseMessage response = await administrator.PatchAsJsonAsync($"/Users/{id}/status", new { status = requested });

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }
}
