using System.Net;
using System.Net.Http.Json;
using FateConnect.Api.Modules.Common.Events;
using FateConnect.Api.Modules.InAppNotifications.Constants;
using FateConnect.Api.Modules.InAppNotifications.Entities;
using FateConnect.Api.Modules.InAppNotifications.Enums;
using FateConnect.Api.Modules.LostAndFound.Enums;
using FateConnect.Api.Modules.Users.Entities;
using FateConnect.Api.Modules.Users.Enums;
using FateConnect.Api.Tests.Fixtures;
using MassTransit.Testing;
using Microsoft.Extensions.DependencyInjection;

namespace FateConnect.Api.Tests.Users;

public class PublicationRemovalTests(ApiFactory factory) : IClassFixture<ApiFactory>
{
    private const string RideDestination = "Jardim Toledo, Votorantim";
    private const string ItemName = "Garrafa térmica azul";

    private ITestHarness Harness => factory.Services.GetRequiredService<ITestHarness>();

    private Guid SeedPublication(EnumPublication publication, int ownerId)
    {
        if (publication == EnumPublication.Ride)
            return factory.SeedRide(
                ownerId,
                DateOnly.FromDateTime(DateTime.UtcNow.AddDays(10)),
                new TimeOnly(7, 30),
                RideDestination);

        return factory.SeedLostAndFoundRecord(ownerId);
    }

    private static string PathOf(EnumPublication publication, Guid publicationId)
    {
        if (publication == EnumPublication.Ride)
            return $"/Rides/{publicationId}";

        return $"/LostAndFound/{publicationId}";
    }

    private static string TitleOf(EnumPublication publication)
    {
        if (publication == EnumPublication.Ride)
            return RideDestination;

        return ItemName;
    }

    private static Task<HttpResponseMessage> RemoveAsync(
        HttpClient client,
        EnumPublication publication,
        Guid publicationId,
        object body) =>
        client.PostAsJsonAsync($"{PathOf(publication, publicationId)}/remove", body);

    [Theory]
    [InlineData(EnumPublication.Ride)]
    [InlineData(EnumPublication.LostAndFoundItem)]
    public async Task Remove_ByAnAdministrator_HidesItAndNotifiesTheAuthorWithNotificationsOff(EnumPublication publication)
    {
        int ownerId = factory.SeedUser("Mariana Alves Rocha").Id;
        Guid publicationId = SeedPublication(publication, ownerId);
        HttpClient administrator = factory.CreateClientForNewAdministrator("Renato Dias Fontoura");

        HttpResponseMessage response = await RemoveAsync(
            administrator, publication, publicationId, new { reason = "Commercial" });

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        HttpResponseMessage ownerView = await factory.CreateClientFor(ownerId).GetAsync(PathOf(publication, publicationId));
        Assert.Equal(HttpStatusCode.NotFound, ownerView.StatusCode);
        InAppNotification notification = Assert.Single(await factory.WaitForNotificationsAsync(ownerId));
        Assert.Equal(EnumInAppNotificationType.PublicationRemoved, notification.Type);
        Assert.Equal(publicationId.ToString(), notification.ReferenceId);
        Assert.Equal(
            NotificationContents.PublicationRemoved(publication, TitleOf(publication), EnumRemovalReason.Commercial),
            notification.Content);
    }

    [Theory]
    [InlineData(EnumPublication.Ride, EnumAdministrativeAction.RideRemoved)]
    [InlineData(EnumPublication.LostAndFoundItem, EnumAdministrativeAction.LostAndFoundItemRemoved)]
    public async Task Remove_ByAnAdministrator_RecordsWhoRemovedWhatAndWhy(
        EnumPublication publication,
        EnumAdministrativeAction expectedAction)
    {
        int ownerId = factory.SeedUser("Paulo Henrique Saldanha").Id;
        Guid publicationId = SeedPublication(publication, ownerId);
        int administratorId = factory.SeedUser("Cecília Brandão Torres", EnumProfileType.Administrator).Id;
        HttpClient administrator = factory.CreateClientFor(administratorId, profileType: EnumProfileType.Administrator);

        await RemoveAsync(administrator, publication, publicationId, new { reason = "PersonalData" });

        AdministrativeAction action = Assert.Single(factory.AdministrativeActionsOn(ownerId));
        Assert.Equal(expectedAction, action.Action);
        Assert.Equal(administratorId, action.ActorId);
        Assert.Equal(publicationId, action.PublicationId);
        Assert.Equal(EnumRemovalReason.PersonalData, action.RemovalReason);
    }

    [Theory]
    [InlineData(EnumPublication.Ride)]
    [InlineData(EnumPublication.LostAndFoundItem)]
    public async Task Remove_BySomeoneWhoIsNotAnAdministrator_AnswersForbiddenAndKeepsIt(EnumPublication publication)
    {
        int ownerId = factory.SeedUser("Rodrigo Lemos Cardoso").Id;
        Guid publicationId = SeedPublication(publication, ownerId);
        HttpClient operatorClient = factory.CreateClientForNewUser("Tatiane Moraes Leal");

        HttpResponseMessage response = await RemoveAsync(
            operatorClient, publication, publicationId, new { reason = "Offensive" });

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
        HttpResponseMessage ownerView = await factory.CreateClientFor(ownerId).GetAsync(PathOf(publication, publicationId));
        Assert.Equal(HttpStatusCode.OK, ownerView.StatusCode);
        Assert.Empty(factory.AdministrativeActionsOn(ownerId));
    }

    [Theory]
    [InlineData(EnumPublication.Ride)]
    [InlineData(EnumPublication.LostAndFoundItem)]
    public async Task Remove_WithoutAValidReason_AnswersBadRequestAndKeepsIt(EnumPublication publication)
    {
        int ownerId = factory.SeedUser("Vinícius Paiva Correia").Id;
        Guid publicationId = SeedPublication(publication, ownerId);
        HttpClient administrator = factory.CreateClientForNewAdministrator("Yasmin Godoy Bastos");

        HttpResponseMessage withoutReason = await RemoveAsync(administrator, publication, publicationId, new { });
        HttpResponseMessage unknownReason = await RemoveAsync(
            administrator, publication, publicationId, new { reason = "Boring" });

        Assert.Equal(HttpStatusCode.BadRequest, withoutReason.StatusCode);
        Assert.Equal(HttpStatusCode.BadRequest, unknownReason.StatusCode);
        HttpResponseMessage ownerView = await factory.CreateClientFor(ownerId).GetAsync(PathOf(publication, publicationId));
        Assert.Equal(HttpStatusCode.OK, ownerView.StatusCode);
        Assert.Empty(factory.AdministrativeActionsOn(ownerId));
    }

    [Theory]
    [InlineData(EnumPublication.Ride)]
    [InlineData(EnumPublication.LostAndFoundItem)]
    public async Task Remove_APublicationThatDoesNotExist_AnswersNotFound(EnumPublication publication)
    {
        HttpClient administrator = factory.CreateClientForNewAdministrator("Wellington Souto Rangel");

        HttpResponseMessage response = await RemoveAsync(
            administrator, publication, Guid.NewGuid(), new { reason = "Misleading" });

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Theory]
    [InlineData(EnumPublication.Ride)]
    [InlineData(EnumPublication.LostAndFoundItem)]
    public async Task Remove_TheSamePublicationTwice_AnswersNotFoundTheSecondTime(EnumPublication publication)
    {
        int ownerId = factory.SeedUser("Débora Quintela Assis").Id;
        Guid publicationId = SeedPublication(publication, ownerId);
        HttpClient administrator = factory.CreateClientForNewAdministrator("Fábio Arruda Monteiro");

        await RemoveAsync(administrator, publication, publicationId, new { reason = "ThirdPartyRights" });
        HttpResponseMessage second = await RemoveAsync(
            administrator, publication, publicationId, new { reason = "ThirdPartyRights" });

        Assert.Equal(HttpStatusCode.NotFound, second.StatusCode);
        Assert.Single(factory.AdministrativeActionsOn(ownerId));
    }

    [Fact]
    public async Task RemoveItem_LeavesItOutOfTheAuthorsListAndOutOfRestore()
    {
        int ownerId = factory.SeedUser("Gustavo Rezende Prates").Id;
        Guid removedId = factory.SeedLostAndFoundRecord(ownerId);
        Guid keptId = factory.SeedLostAndFoundRecord(ownerId);
        HttpClient owner = factory.CreateClientFor(ownerId);
        HttpClient administrator = factory.CreateClientForNewAdministrator("Isabela Noronha Vidal");

        await RemoveAsync(administrator, EnumPublication.LostAndFoundItem, removedId, new { reason = "Offensive" });
        string ownList = await owner.GetStringAsync("/LostAndFound?OnlyMine=true&PageSize=50");
        using MultipartFormDataContent restore = new() { { new StringContent("Open"), "Status" } };
        HttpResponseMessage restoreResponse = await owner.PatchAsync($"/LostAndFound/{removedId}", restore);

        Assert.DoesNotContain(removedId.ToString(), ownList, StringComparison.OrdinalIgnoreCase);
        Assert.Contains(keptId.ToString(), ownList, StringComparison.OrdinalIgnoreCase);
        Assert.Equal(HttpStatusCode.NotFound, restoreResponse.StatusCode);
    }

    [Fact]
    public async Task RemoveItem_AlreadyArchivedByTheAuthor_StillRemovesIt()
    {
        int ownerId = factory.SeedUser("Joana Prestes Valadares").Id;
        Guid archivedId = factory.SeedLostAndFoundRecord(ownerId, EnumLostAndFoundStatus.Deleted);
        HttpClient administrator = factory.CreateClientForNewAdministrator("Leandro Fagundes Horta");

        HttpResponseMessage response = await RemoveAsync(
            administrator, EnumPublication.LostAndFoundItem, archivedId, new { reason = "Misleading" });

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        HttpResponseMessage ownerView = await factory.CreateClientFor(ownerId).GetAsync($"/LostAndFound/{archivedId}");
        Assert.Equal(HttpStatusCode.NotFound, ownerView.StatusCode);
    }

    [Fact]
    public async Task PublicationRemoved_ForAnAuthorWhoIsNoLongerActive_NotifiesNoOne()
    {
        int ownerId = factory.SeedUser("Natália Cerqueira Bueno").Id;
        factory.SetAccountStatus(ownerId, EnumAccountStatus.Banned);
        Guid publicationId = Guid.NewGuid();

        await Harness.Bus.Publish(new PublicationRemovedEvent(
            ownerId, publicationId, EnumPublication.Ride, RideDestination, EnumRemovalReason.Offensive));

        await ApiFactory.WaitUntilAsync(
            () => Harness.Consumed.Any<PublicationRemovedEvent>(
                consumed => consumed.Context.Message.PublicationId == publicationId),
            $"Expected the removal of {publicationId} to be consumed.");
        Assert.Empty(factory.NotificationsOf(ownerId));
    }
}
