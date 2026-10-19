using System.Globalization;
using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using FateConnect.Api.Modules.Common.Events;
using FateConnect.Api.Modules.Reports.Enums;
using FateConnect.Api.Modules.Emails.Enums;
using FateConnect.Api.Modules.InAppNotifications.Constants;
using FateConnect.Api.Modules.InAppNotifications.Entities;
using FateConnect.Api.Modules.InAppNotifications.Enums;
using FateConnect.Api.Modules.InAppNotifications.Events;
using FateConnect.Api.Modules.Users.Enums;
using FateConnect.Api.Tests.Fixtures;
using MassTransit.Testing;
using Microsoft.Extensions.DependencyInjection;

namespace FateConnect.Api.Tests.InAppNotifications;

public class InAppNotificationEmissionTests : IClassFixture<ApiFactory>
{
    private static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web);

    private readonly ApiFactory _factory;

    public InAppNotificationEmissionTests(ApiFactory factory)
    {
        _factory = factory;
    }

    private sealed record CreatedResource(Guid Id);

    private ITestHarness Harness => _factory.Services.GetRequiredService<ITestHarness>();

    private static object NewRidePayload(string destination) => new
    {
        destination,
        departureDate = RideDates.Iso(RideDates.DepartureDayFrom(7)),
        departureTime = "08:30:00",
        rideType = "Solidarity",
        vehicleType = "Car",
        description = "Vaga para quem sai do campus.",
    };

    private static MultipartFormDataContent NewReportForm(EnumReportCategory category, bool isAnonymous) =>
        new()
        {
            { new StringContent(category.ToString()), "Category" },
            { new StringContent("O motorista passou do limite de velocidade na rodovia."), "Description" },
            { new StringContent(isAnonymous.ToString(CultureInfo.InvariantCulture)), "IsAnonymous" },
        };

    private async Task<Guid> OfferRideAsync(int driverId, string destination)
    {
        HttpResponseMessage response = await _factory
            .CreateClientFor(driverId)
            .PostAsJsonAsync("/Rides", NewRidePayload(destination));

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);

        return (await response.Content.ReadFromJsonAsync<CreatedResource>(JsonOptions))!.Id;
    }

    private async Task<Guid> ReportAsync(int reporterId, EnumReportCategory category, bool isAnonymous = false)
    {
        HttpResponseMessage response = await _factory
            .CreateClientFor(reporterId)
            .PostAsync("/Reports", NewReportForm(category, isAnonymous));

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);

        return (await response.Content.ReadFromJsonAsync<CreatedResource>(JsonOptions))!.Id;
    }

    private Task WaitUntilConsumedAsync(Guid reportId) =>
        ApiFactory.WaitUntilAsync(
            () => Harness.Consumed.Any<ReportReceivedEvent>(consumed => consumed.Context.Message.ReportId == reportId),
            $"Expected the report {reportId} to be consumed.");

    [Fact]
    public async Task CreateRide_NotifiesWhoseNeighborhoodIsTheDestination_AndNoOneElse()
    {
        int driverId = _factory.SeedUser("Ana Beatriz Nogueira").Id;
        int residentId = _factory.SeedUser("Bruno Carvalho Souza").Id;
        int residentWithoutCityId = _factory.SeedUser("Rafael Siqueira Lopes").Id;
        int optedOutId = _factory.SeedUser("Carla Menezes Duarte").Id;
        int bannedId = _factory.SeedUser("Otávio Lins Barreto").Id;
        int otherCityId = _factory.SeedUser("Daniela Prado Lima").Id;
        int longerNameId = _factory.SeedUser("Sofia Almeida Rezende").Id;
        _factory.PrepareForNotifications(driverId, "Vila Hortência, Sorocaba");
        _factory.PrepareForNotifications(residentId, "Vila Hortência, Sorocaba");
        _factory.PrepareForNotifications(residentWithoutCityId, "vila hortencia");
        _factory.PrepareForNotifications(optedOutId, "Vila Hortência, Sorocaba", receiveNotifications: false);
        _factory.PrepareForNotifications(bannedId, "Vila Hortência, Sorocaba");
        _factory.SetAccountStatus(bannedId, EnumAccountStatus.Banned);
        _factory.PrepareForNotifications(otherCityId, "Vila Hortência, Votorantim");
        _factory.PrepareForNotifications(longerNameId, "Vila Hortência Nova, Sorocaba");
        const string destination = "Vila Hortência, Sorocaba";

        Guid rideId = await OfferRideAsync(driverId, destination);
        InAppNotification notification = Assert.Single(await _factory.WaitForNotificationsAsync(residentId));
        Assert.Single(await _factory.WaitForNotificationsAsync(residentWithoutCityId));

        Assert.Equal(EnumInAppNotificationType.RideToNeighborhood, notification.Type);
        Assert.Equal(rideId.ToString(), notification.ReferenceId);
        Assert.Equal(NotificationContents.RideToDestination(destination), notification.Content);
        Assert.Empty(_factory.NotificationsOf(driverId));
        Assert.Empty(_factory.NotificationsOf(optedOutId));
        Assert.Empty(_factory.NotificationsOf(bannedId));
        Assert.Empty(_factory.NotificationsOf(otherCityId));
        Assert.Empty(_factory.NotificationsOf(longerNameId));
    }

    [Fact]
    public async Task CreateRide_DestinationWithoutCity_NotifiesTheNeighborhoodInAnyCity()
    {
        int driverId = _factory.SeedUser("Tiago Fontes Barbosa").Id;
        int sorocabaResidentId = _factory.SeedUser("Vanessa Duarte Pires").Id;
        int votorantimResidentId = _factory.SeedUser("Wagner Moreira Castro").Id;
        _factory.PrepareForNotifications(sorocabaResidentId, "Centro, Sorocaba");
        _factory.PrepareForNotifications(votorantimResidentId, "Centro, Votorantim");

        Guid rideId = await OfferRideAsync(driverId, "Centro");

        Assert.Equal(rideId.ToString(), Assert.Single(await _factory.WaitForNotificationsAsync(sorocabaResidentId)).ReferenceId);
        Assert.Equal(rideId.ToString(), Assert.Single(await _factory.WaitForNotificationsAsync(votorantimResidentId)).ReferenceId);
    }

    [Fact]
    public async Task CreateRide_DispatchesTheNotificationWithTheStoredId()
    {
        int driverId = _factory.SeedUser("Eduardo Ramos Teixeira").Id;
        int residentId = _factory.SeedUser("Fernanda Costa Ribeiro").Id;
        _factory.PrepareForNotifications(residentId, "Jardim Gonçalves");

        await OfferRideAsync(driverId, "Jardim Goncalves, Sorocaba");
        InAppNotification stored = Assert.Single(await _factory.WaitForNotificationsAsync(residentId));

        await ApiFactory.WaitUntilAsync(
            () => Harness.Published.Any<NotificationDispatchedEvent>(
                published => published.Context.Message.TargetUserId == residentId),
            $"Expected a notification dispatched to user {residentId}.");
        NotificationDispatchedEvent dispatched = Harness.Published
            .Select<NotificationDispatchedEvent>(published => published.Context.Message.TargetUserId == residentId)
            .Single().Context.Message;
        Assert.Equal(stored.Id, dispatched.Notification.Id);
    }

    [Fact]
    public async Task CreateReport_NotifiesOnlyTheReporter_WithoutAnyEmail()
    {
        (int reporterId, string fatecEmail) = _factory.SeedUserWithPassword("Gabriel Nunes Farias", "SenhaForte123!");
        int bystanderId = _factory.SeedUser("Helena Vieira Campos").Id;
        _factory.PrepareForNotifications(reporterId);
        _factory.PrepareForNotifications(bystanderId);

        Guid reportId = await ReportAsync(reporterId, EnumReportCategory.RecklessDriving);
        InAppNotification notification = Assert.Single(await _factory.WaitForNotificationsAsync(reporterId));

        Assert.Equal(EnumInAppNotificationType.ReportReceived, notification.Type);
        Assert.Equal(reportId.ToString(), notification.ReferenceId);
        Assert.Equal(NotificationContents.ReportReceived(EnumReportCategory.RecklessDriving), notification.Content);
        Assert.Empty(_factory.NotificationsOf(bystanderId));
        Assert.All(Enum.GetValues<EnumAccountEmail>(), kind => Assert.Empty(_factory.Emails.SentTo(fatecEmail, kind)));
    }

    [Fact]
    public async Task CreateReport_Confidential_LeavesTheNotificationQueueOut()
    {
        int reporterId = _factory.SeedUser("Igor Mendes Batista").Id;
        _factory.PrepareForNotifications(reporterId);

        Guid confidentialId = await ReportAsync(reporterId, EnumReportCategory.FakeProfile, isAnonymous: true);
        Guid identifiedId = await ReportAsync(reporterId, EnumReportCategory.Spam);
        await WaitUntilConsumedAsync(identifiedId);

        Assert.Empty(Harness.Published.Select<ReportReceivedEvent>(
            published => published.Context.Message.ReportId == confidentialId));
        Assert.Equal(
            identifiedId.ToString(),
            Assert.Single(await _factory.WaitForNotificationsAsync(reporterId)).ReferenceId);
    }

    [Fact]
    public async Task CreateReport_ReporterWithNotificationsOff_IsNotNotified()
    {
        int reporterId = _factory.SeedUser("Juliana Freitas Moura").Id;

        Guid reportId = await ReportAsync(reporterId, EnumReportCategory.Spam);
        await WaitUntilConsumedAsync(reportId);

        Assert.Empty(_factory.NotificationsOf(reporterId));
    }

    [Fact]
    public async Task ItemArchived_NotifiesTheOwner()
    {
        int ownerId = _factory.SeedUser("Lucas Pereira Antunes").Id;
        _factory.PrepareForNotifications(ownerId);
        Guid recordId = Guid.NewGuid();

        await Harness.Bus.Publish(new ItemArchivedEvent(ownerId, recordId, "Garrafa térmica azul"));
        InAppNotification notification = Assert.Single(await _factory.WaitForNotificationsAsync(ownerId));

        Assert.Equal(EnumInAppNotificationType.ItemArchived, notification.Type);
        Assert.Equal(recordId.ToString(), notification.ReferenceId);
        Assert.Equal(NotificationContents.ItemArchived("Garrafa térmica azul"), notification.Content);
    }

    [Fact]
    public async Task ItemArchived_OwnerWithNotificationsOff_IsNotNotified()
    {
        int ownerId = _factory.SeedUser("Marcos Teles Valente").Id;
        Guid recordId = Guid.NewGuid();

        await Harness.Bus.Publish(new ItemArchivedEvent(ownerId, recordId, "Guarda-chuva preto"));

        await ApiFactory.WaitUntilAsync(
            () => Harness.Consumed.Any<ItemArchivedEvent>(consumed => consumed.Context.Message.RecordId == recordId),
            $"Expected the archived item {recordId} to be consumed.");
        Assert.Empty(_factory.NotificationsOf(ownerId));
    }
}
