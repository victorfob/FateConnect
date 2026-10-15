using System.Net;
using System.Net.Http.Json;
using FateConnect.Api.Modules.Users.Enums;
using FateConnect.Api.Tests.Fixtures;

namespace FateConnect.Api.Tests.Users;

public class UserLoggingTests(ApiFactory factory) : IClassFixture<ApiFactory>
{
    private const string KnownPassword = "SenhaForte123!";

    [Fact]
    public async Task ChangeStatus_ByAnAdministrator_LogsWhoActedOnWhom()
    {
        (int targetId, _) = factory.SeedUserWithPassword("Yara Fontes Rangel", KnownPassword);
        int administratorId = factory.SeedUser("Zeca Moreira Dantas", EnumProfileType.Administrator).Id;
        HttpClient administrator = factory.CreateClientFor(administratorId, profileType: EnumProfileType.Administrator);

        await administrator.PatchAsJsonAsync($"/Users/{targetId}/status", new { status = "Banned" });
        await administrator.PatchAsJsonAsync($"/Users/{targetId}/profile", new { profileType = "Administrator" });
        await administrator.PatchAsJsonAsync($"/Users/{targetId}", new { fullName = "Yara Fontes Rangel Filha" });

        Assert.Contains($"Administrator user ID {administratorId} changed the status of user ID {targetId} to Banned.", factory.LogMessages);
        Assert.Contains($"Administrator user ID {administratorId} changed the profile of user ID {targetId} to Administrator.", factory.LogMessages);
        Assert.Contains($"Administrator user ID {administratorId} updated the data of user ID {targetId}.", factory.LogMessages);
    }

    [Fact]
    public async Task ChangePassword_WithTheWrongCurrentPassword_LogsTheRefusal()
    {
        (int userId, _) = factory.SeedUserWithPassword("Abel Quintino Reis", KnownPassword);

        HttpResponseMessage response = await factory.CreateClientFor(userId)
            .PatchAsJsonAsync("/Users/me/password", new { currentPassword = "SenhaErrada123!", newPassword = "OutraSenha456!" });

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        Assert.Contains($"User ID {userId} was refused a password change: wrong current password.", factory.LogMessages);
    }

    [Fact]
    public async Task UpdatePreferences_LogsTheChange()
    {
        int userId = factory.SeedUser("Bianca Telles Ramos").Id;

        HttpResponseMessage response = await factory.CreateClientFor(userId)
            .PatchAsJsonAsync("/Users/me/preferences", new { receiveNotifications = true });

        Assert.True(response.IsSuccessStatusCode);
        Assert.Contains($"User ID {userId} preferences updated successfully.", factory.LogMessages);
    }

    [Fact]
    public async Task AFieldTheValidationRefuses_IsLoggedByNameAndNeverByValue()
    {
        int userId = factory.SeedUser("Caio Medeiros Assis").Id;
        string tooLong = new('x', 101);

        HttpResponseMessage response = await factory.CreateClientFor(userId)
            .PatchAsync("/Users/me", new MultipartFormDataContent { { new StringContent(tooLong), "Neighborhood" } });

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        Assert.Contains($"Validation refused PATCH Users/me for user ID {userId}, on the fields: Neighborhood.", factory.LogMessages);
        Assert.DoesNotContain(factory.LogMessages, message => message.Contains(tooLong, StringComparison.Ordinal));
    }
}
