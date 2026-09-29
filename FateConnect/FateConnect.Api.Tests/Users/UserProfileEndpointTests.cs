using System.Globalization;
using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using System.Text.Json.Serialization;
using FateConnect.Api.Modules.Auth.DTOs;
using FateConnect.Api.Modules.Users.Enums;
using FateConnect.Api.Tests.Fixtures;

namespace FateConnect.Api.Tests.Users;

public class UserProfileEndpointTests(ApiFactory factory) : IClassFixture<ApiFactory>
{
    private const string KnownPassword = "SenhaForte123!";
    private const string NewPassword = "OutraSenha456!";
    private const string WrongPassword = "SenhaErrada789!";
    private const int UnderageYears = 10;

    private static readonly JsonSerializerOptions JsonOptions =
        new(JsonSerializerDefaults.Web) { Converters = { new JsonStringEnumConverter() } };

    private sealed record ReadUser(
        int Id,
        string FatecEmail,
        string FullName,
        string Phone,
        string ContactEmail,
        string? Neighborhood,
        string? ImageUrl,
        EnumProfileType ProfileType,
        EnumAccountStatus Status);

    private sealed record ReadPreferences(bool ReceiveEmails, bool ReceiveNotifications);

    private sealed record SignedInUser(int Id, string FatecEmail, HttpClient Client);

    private HttpClient ClientWith(string token)
    {
        HttpClient client = factory.CreateClient();
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

        return client;
    }

    private async Task<HttpResponseMessage> LoginAsync(string fatecEmail, string password) =>
        await factory.CreateClient().PostAsJsonAsync("/Auth/login", new { fatecEmail, password });

    private async Task<string> TokenFromLoginAsync(string fatecEmail, string password)
    {
        HttpResponseMessage login = await LoginAsync(fatecEmail, password);
        TokenResponseDto body = (await login.Content.ReadFromJsonAsync<TokenResponseDto>())!;

        return body.Token;
    }

    private async Task<SignedInUser> SignedInAsync(string fullName)
    {
        (int id, string fatecEmail) = factory.SeedUserWithPassword(fullName, KnownPassword);

        return new SignedInUser(id, fatecEmail, ClientWith(await TokenFromLoginAsync(fatecEmail, KnownPassword)));
    }

    private static MultipartFormDataContent FormWith(string field, string value) =>
        new() { { new StringContent(value), field } };

    private static MultipartFormDataContent FormWithPhoto()
    {
        ByteArrayContent image = new(TestImages.Png());
        image.Headers.ContentType = new MediaTypeHeaderValue("image/png");

        return new MultipartFormDataContent { { image, "Image", "perfil.png" } };
    }

    private static async Task<ReadUser> ReadUserFrom(HttpResponseMessage response) =>
        (await response.Content.ReadFromJsonAsync<ReadUser>(JsonOptions))!;

    [Fact]
    public async Task GetProfile_WithAValidToken_AnswersTheOwnAccount()
    {
        SignedInUser person = await SignedInAsync("Mariana Alves Rocha");

        HttpResponseMessage response = await person.Client.GetAsync("/Users/me");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        ReadUser body = await ReadUserFrom(response);
        Assert.Equal(person.Id, body.Id);
        Assert.Equal("Mariana Alves Rocha", body.FullName);
        Assert.Equal(EnumAccountStatus.Active, body.Status);
    }

    [Fact]
    public async Task UpdateProfile_WithANewName_KeepsItForTheNextRead()
    {
        SignedInUser person = await SignedInAsync("Bruno Carvalho Souza");
        await person.Client.PatchAsync("/Users/me", FormWith("FullName", "Bruno Carvalho Souza Filho"));

        HttpResponseMessage response = await person.Client.GetAsync("/Users/me");

        Assert.Equal("Bruno Carvalho Souza Filho", (await ReadUserFrom(response)).FullName);
    }

    [Theory]
    [InlineData("Jo")]
    [InlineData("  Jo  ")]
    public async Task UpdateProfile_WithANameShorterThanThreeCharacters_IsRefused(string fullName)
    {
        SignedInUser person = await SignedInAsync("Carla Dias Mendes");

        HttpResponseMessage response = await person.Client.PatchAsync("/Users/me", FormWith("FullName", fullName));

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task UpdateProfile_ClearingTheNeighborhood_ForgetsIt()
    {
        SignedInUser person = await SignedInAsync("Diego Nunes Peixoto");
        await person.Client.PatchAsync("/Users/me", FormWith("Neighborhood", "Jardim Vergueiro"));

        HttpResponseMessage response = await person.Client.PatchAsync("/Users/me", FormWith("Neighborhood", string.Empty));

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Null((await ReadUserFrom(response)).Neighborhood);
    }

    [Fact]
    public async Task UpdateProfile_WithTheBirthDateOfAMinor_IsRefused()
    {
        SignedInUser person = await SignedInAsync("Elisa Moura Campos");
        string minorBirthDate = DateTime.UtcNow.Date.AddYears(-UnderageYears).ToString("yyyy-MM-dd", CultureInfo.InvariantCulture);

        HttpResponseMessage response = await person.Client.PatchAsync("/Users/me", FormWith("BirthDate", minorBirthDate));

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task UpdateProfile_KeepingTheOwnPhone_IsAccepted()
    {
        SignedInUser person = await SignedInAsync("Fábio Tavares Lima");
        string ownPhone = (await ReadUserFrom(await person.Client.GetAsync("/Users/me"))).Phone;

        HttpResponseMessage response = await person.Client.PatchAsync("/Users/me", FormWith("Phone", ownPhone));

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    [Fact]
    public async Task UpdateProfile_WithThePhoneOfAnotherAccount_IsAConflictOnThatField()
    {
        SignedInUser person = await SignedInAsync("Gabriela Freitas Rocha");
        SeededUser other = factory.SeedUser("Heitor Barros Queiroz");

        HttpResponseMessage response = await person.Client.PatchAsync("/Users/me", FormWith("Phone", other.Phone));

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
        using JsonDocument body = JsonDocument.Parse(await response.Content.ReadAsStringAsync());
        Assert.Equal("phone", body.RootElement.GetProperty("field").GetString());
    }

    [Fact]
    public async Task UpdateProfile_WithAPhoto_AnswersAnAddressThatServesIt()
    {
        SignedInUser person = await SignedInAsync("Isabela Prado Martins");
        ReadUser updated = await ReadUserFrom(await person.Client.PatchAsync("/Users/me", FormWithPhoto()));

        HttpResponseMessage response = await person.Client.GetAsync($"/{updated.ImageUrl}");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    [Fact]
    public async Task RemoveProfileImage_WithAPhoto_ForgetsItOnTheProfile()
    {
        SignedInUser person = await SignedInAsync("Renata Moura Figueiredo");
        await person.Client.PatchAsync("/Users/me", FormWithPhoto());

        HttpResponseMessage response = await person.Client.DeleteAsync("/Users/me/image");

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        Assert.Null((await ReadUserFrom(await person.Client.GetAsync("/Users/me"))).ImageUrl);
    }

    [Fact]
    public async Task RemoveProfileImage_WithAPhoto_StopsServingTheFile()
    {
        SignedInUser person = await SignedInAsync("Otávio Lins Barreto");
        ReadUser updated = await ReadUserFrom(await person.Client.PatchAsync("/Users/me", FormWithPhoto()));
        await person.Client.DeleteAsync("/Users/me/image");

        HttpResponseMessage response = await person.Client.GetAsync($"/{updated.ImageUrl}");

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task RemoveProfileImage_WithoutAPhoto_IsAccepted()
    {
        SignedInUser person = await SignedInAsync("Letícia Campos Arantes");

        HttpResponseMessage response = await person.Client.DeleteAsync("/Users/me/image");

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
    }

    [Fact]
    public async Task GetPreferences_OfANewAccount_AnswersBothOff()
    {
        SignedInUser person = await SignedInAsync("João Ribeiro Costa");

        HttpResponseMessage response = await person.Client.GetAsync("/Users/me/preferences");

        Assert.Equal(new ReadPreferences(false, false), await response.Content.ReadFromJsonAsync<ReadPreferences>());
    }

    [Fact]
    public async Task UpdatePreferences_WithOnlyOneField_KeepsTheOther()
    {
        SignedInUser person = await SignedInAsync("Karina Moraes Dutra");
        await person.Client.PatchAsJsonAsync("/Users/me/preferences", new { receiveNotifications = true });

        HttpResponseMessage response = await person.Client.GetAsync("/Users/me/preferences");

        Assert.Equal(new ReadPreferences(false, true), await response.Content.ReadFromJsonAsync<ReadPreferences>());
    }

    [Fact]
    public async Task ChangePassword_WithTheWrongCurrentPassword_IsRefused()
    {
        SignedInUser person = await SignedInAsync("Lucas Andrade Pires");

        HttpResponseMessage response = await person.Client.PatchAsJsonAsync(
            "/Users/me/password", new { currentPassword = WrongPassword, newPassword = NewPassword });

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task ChangePassword_WithTheWrongCurrentPassword_KeepsTheSession()
    {
        SignedInUser person = await SignedInAsync("Letícia Rezende Gomes");
        await person.Client.PatchAsJsonAsync(
            "/Users/me/password", new { currentPassword = WrongPassword, newPassword = NewPassword });

        HttpResponseMessage response = await person.Client.GetAsync("/Auth/session");

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
    }

    [Fact]
    public async Task ChangePassword_WithTheCurrentPassword_AnswersATokenThatKeepsTheSession()
    {
        SignedInUser person = await SignedInAsync("Marina Coelho Siqueira");
        HttpResponseMessage changed = await person.Client.PatchAsJsonAsync(
            "/Users/me/password", new { currentPassword = KnownPassword, newPassword = NewPassword });
        TokenResponseDto body = (await changed.Content.ReadFromJsonAsync<TokenResponseDto>())!;

        HttpResponseMessage response = await ClientWith(body.Token).GetAsync("/Auth/session");

        Assert.Equal(HttpStatusCode.OK, changed.StatusCode);
        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
    }

    [Fact]
    public async Task ChangePassword_WithTheCurrentPassword_EndsTheTokenItWasCalledWith()
    {
        SignedInUser person = await SignedInAsync("Nicolas Farias Leal");
        await person.Client.PatchAsJsonAsync(
            "/Users/me/password", new { currentPassword = KnownPassword, newPassword = NewPassword });

        HttpResponseMessage response = await person.Client.GetAsync("/Auth/session");

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Theory]
    [InlineData(NewPassword, HttpStatusCode.OK)]
    [InlineData(KnownPassword, HttpStatusCode.Unauthorized)]
    public async Task ChangePassword_WithTheCurrentPassword_LetsOnlyTheNewPasswordSignIn(string password, HttpStatusCode expected)
    {
        SignedInUser person = await SignedInAsync("Olívia Castro Menezes");
        await person.Client.PatchAsJsonAsync(
            "/Users/me/password", new { currentPassword = KnownPassword, newPassword = NewPassword });

        HttpResponseMessage response = await LoginAsync(person.FatecEmail, password);

        Assert.Equal(expected, response.StatusCode);
    }

    [Fact]
    public async Task DeactivateAccount_EndsTheSession()
    {
        SignedInUser person = await SignedInAsync("Paulo Henrique Duarte");
        await person.Client.PostAsync("/Users/me/deactivate", null);

        HttpResponseMessage response = await person.Client.GetAsync("/Auth/session");

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task DeactivateAccount_LeavesTheAccountToReactivateAtTheNextLogin()
    {
        SignedInUser person = await SignedInAsync("Renata Guimarães Lopes");
        await person.Client.PostAsync("/Users/me/deactivate", null);

        HttpResponseMessage response = await LoginAsync(person.FatecEmail, KnownPassword);

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
    }
}
