using System.Net;
using System.Net.Http.Json;
using FateConnect.Api.Modules.Users.Entities;
using FateConnect.Api.Modules.Users.Enums;
using FateConnect.Api.Tests.Fixtures;

namespace FateConnect.Api.Tests.Users;

public class AdministrativeActionTests(ApiFactory factory) : IClassFixture<ApiFactory>
{
    private const string KnownPassword = "SenhaForte123!";

    private (int Id, HttpClient Client) SignedInAdministrator(string fullName)
    {
        int administratorId = factory.SeedUser(fullName, EnumProfileType.Administrator).Id;

        return (administratorId, factory.CreateClientFor(administratorId, profileType: EnumProfileType.Administrator));
    }

    private static Task<HttpResponseMessage> ChangeProfileAsync(HttpClient administrator, int targetId, string profileType) =>
        administrator.PatchAsJsonAsync($"/Users/{targetId}/profile", new { profileType });

    private static Task<HttpResponseMessage> ChangeStatusAsync(HttpClient administrator, int targetId, string status) =>
        administrator.PatchAsJsonAsync($"/Users/{targetId}/status", new { status });

    [Fact]
    public async Task ChangeProfile_PromotingAndDemoting_RecordsWhoDidEachOnWhom()
    {
        (int targetId, _) = factory.SeedUserWithPassword("Aurélio Campos Neto", KnownPassword);
        (int administratorId, HttpClient administrator) = SignedInAdministrator("Beatriz Lacerda Pires");

        await ChangeProfileAsync(administrator, targetId, "Administrator");
        await ChangeProfileAsync(administrator, targetId, "Operator");

        IReadOnlyList<AdministrativeAction> actions = factory.AdministrativeActionsOn(targetId);
        Assert.Equal([EnumAdministrativeAction.Promoted, EnumAdministrativeAction.Demoted], actions.Select(action => action.Action));
        Assert.All(actions, action => Assert.Equal(administratorId, action.ActorId));
    }

    [Fact]
    public async Task ChangeStatus_BanningAndReverting_RecordsBothWithTheirTime()
    {
        (int targetId, _) = factory.SeedUserWithPassword("Caetano Vilela Prado", KnownPassword);
        (int administratorId, HttpClient administrator) = SignedInAdministrator("Denise Coutinho Araújo");
        DateTime before = DateTime.UtcNow;

        await ChangeStatusAsync(administrator, targetId, "Banned");
        await ChangeStatusAsync(administrator, targetId, "Active");

        IReadOnlyList<AdministrativeAction> actions = factory.AdministrativeActionsOn(targetId);
        Assert.Equal([EnumAdministrativeAction.Banned, EnumAdministrativeAction.BanReverted], actions.Select(action => action.Action));
        Assert.All(actions, action =>
        {
            Assert.Equal(administratorId, action.ActorId);
            Assert.InRange(action.PerformedAt, before, DateTime.UtcNow);
        });
    }

    [Fact]
    public async Task ChangeProfile_ToTheProfileTheAccountAlreadyHas_RecordsNothing()
    {
        (int targetId, _) = factory.SeedUserWithPassword("Emílio Barros Tavares", KnownPassword);
        (_, HttpClient administrator) = SignedInAdministrator("Fabiana Quintão Leite");

        HttpResponseMessage response = await ChangeProfileAsync(administrator, targetId, "Operator");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Empty(factory.AdministrativeActionsOn(targetId));
    }

    [Fact]
    public async Task ChangeStatus_BanningAnAccountAlreadyBanned_RecordsNothing()
    {
        (int targetId, _) = factory.SeedUserWithPassword("Lúcio Rezende Paiva", KnownPassword, EnumAccountStatus.Banned);
        (_, HttpClient administrator) = SignedInAdministrator("Marta Figueira Dias");

        HttpResponseMessage response = await ChangeStatusAsync(administrator, targetId, "Banned");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Empty(factory.AdministrativeActionsOn(targetId));
    }

    [Fact]
    public async Task ChangeStatus_ThatIsRefused_RecordsNothing()
    {
        (int targetId, _) = factory.SeedUserWithPassword("Gilberto Assunção Melo", KnownPassword);
        (_, HttpClient administrator) = SignedInAdministrator("Helena Viana Castro");

        HttpResponseMessage response = await ChangeStatusAsync(administrator, targetId, "SelfDeactivated");

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        Assert.Empty(factory.AdministrativeActionsOn(targetId));
    }

    [Fact]
    public async Task ChangeProfile_OfTheOwnAccount_RecordsNothing()
    {
        (int administratorId, HttpClient administrator) = SignedInAdministrator("Iolanda Freitas Moura");

        HttpResponseMessage response = await ChangeProfileAsync(administrator, administratorId, "Operator");

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        Assert.Empty(factory.AdministrativeActionsOn(administratorId));
    }

    [Fact]
    public async Task AdministrativeActions_OfAnAccountThatIsDeleted_Remain()
    {
        (int targetId, _) = factory.SeedUserWithPassword("Jonas Albuquerque Siqueira", KnownPassword);
        (_, HttpClient administrator) = SignedInAdministrator("Karina Moreira Lopes");
        await ChangeStatusAsync(administrator, targetId, "Banned");

        factory.DeleteUser(targetId);

        AdministrativeAction remaining = Assert.Single(factory.AdministrativeActionsOn(targetId));
        Assert.Equal(EnumAdministrativeAction.Banned, remaining.Action);
    }
}
