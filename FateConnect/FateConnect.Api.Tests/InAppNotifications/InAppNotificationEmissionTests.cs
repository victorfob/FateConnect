using System.Globalization;
using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using FateConnect.Api.Modules.Common.Events;
using FateConnect.Api.Modules.Denunciations.Enums;
using FateConnect.Api.Modules.Emails.Enums;
using FateConnect.Api.Modules.InAppNotifications.Constants;
using FateConnect.Api.Modules.InAppNotifications.Entities;
using FateConnect.Api.Modules.InAppNotifications.Enums;
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
        departureDate = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(7)).ToString("yyyy-MM-dd", CultureInfo.InvariantCulture),
        departureTime = "08:30:00",
        rideType = "Solidarity",
        vehicleType = "Car",
        description = "Vaga para quem sai do campus.",
    };

    private static MultipartFormDataContent NewDenunciationForm(EnumDenunciationCategory category, bool isAnonymous) =>
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

    private async Task<Guid> ReportAsync(int reporterId, EnumDenunciationCategory category, bool isAnonymous = false)
    {
        HttpResponseMessage response = await _factory
            .CreateClientFor(reporterId)
            .PostAsync("/Denunciations", NewDenunciationForm(category, isAnonymous));

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);

        return (await response.Content.ReadFromJsonAsync<CreatedResource>(JsonOptions))!.Id;
    }

    private async Task WaitUntilConsumedAsync(Guid denunciationId) =>
        Assert.True(await Harness.Consumed.Any<DenunciationReceivedEvent>(
            consumed => consumed.Context.Message.DenunciationId == denunciationId));

    [Fact]
    public async Task CreateRide_NotifiesWhoseNeighborhoodAppearsInTheDestination_AndNoOneElse()
    {
        int driverId = _factory.SeedUser("Ana Beatriz Nogueira").Id;
        int residentId = _factory.SeedUser("Bruno Carvalho Souza").Id;
        int optedOutId = _factory.SeedUser("Carla Menezes Duarte").Id;
        int elsewhereId = _factory.SeedUser("Daniela Prado Lima").Id;
        _factory.PrepareForNotifications(driverId, "Vila Hortência");
        _factory.PrepareForNotifications(residentId, "vila hortencia");
        _factory.PrepareForNotifications(optedOutId, "Vila Hortência", receiveNotifications: false);
        _factory.PrepareForNotifications(elsewhereId, "Campolim");
        const string destination = "Rua das Flores, Vila Hortência";

        Guid rideId = await OfferRideAsync(driverId, destination);
        InAppNotification notification = Assert.Single(await _factory.WaitForNotificationsAsync(residentId));

        Assert.Equal(EnumInAppNotificationType.RideToNeighborhood, notification.Type);
        Assert.Equal(rideId.ToString(), notification.ReferenceId);
        Assert.Equal(NotificationContents.RideToDestination(destination), notification.Content);
        Assert.Empty(_factory.NotificationsOf(driverId));
        Assert.Empty(_factory.NotificationsOf(optedOutId));
        Assert.Empty(_factory.NotificationsOf(elsewhereId));
    }

    [Fact]
    public async Task CreateRide_DispatchesTheNotificationWithTheStoredId()
    {
        int driverId = _factory.SeedUser("Eduardo Ramos Teixeira").Id;
        int residentId = _factory.SeedUser("Fernanda Costa Ribeiro").Id;
        _factory.PrepareForNotifications(residentId, "Jardim Gonçalves");

        await OfferRideAsync(driverId, "Avenida Itavuvu, Jardim Gonçalves");
        InAppNotification stored = Assert.Single(await _factory.WaitForNotificationsAsync(residentId));

        Assert.True(await Harness.Published.Any<NotificationDispatchedEvent>(
            published => published.Context.Message.TargetUserId == residentId));
        NotificationDispatchedEvent dispatched = Harness.Published
            .Select<NotificationDispatchedEvent>(published => published.Context.Message.TargetUserId == residentId)
            .Single().Context.Message;
        Assert.Equal(stored.Id, dispatched.Notification.Id);
    }

    [Fact]
    public async Task CreateDenunciation_NotifiesOnlyTheReporter_WithoutAnyEmail()
    {
        (int reporterId, string fatecEmail) = _factory.SeedUserWithPassword("Gabriel Nunes Farias", "SenhaForte123!");
        int bystanderId = _factory.SeedUser("Helena Vieira Campos").Id;
        _factory.PrepareForNotifications(reporterId);
        _factory.PrepareForNotifications(bystanderId);

        Guid denunciationId = await ReportAsync(reporterId, EnumDenunciationCategory.RecklessDriving);
        InAppNotification notification = Assert.Single(await _factory.WaitForNotificationsAsync(reporterId));

        Assert.Equal(EnumInAppNotificationType.DenunciationReceived, notification.Type);
        Assert.Equal(denunciationId.ToString(), notification.ReferenceId);
        Assert.Equal(NotificationContents.DenunciationReceived(EnumDenunciationCategory.RecklessDriving), notification.Content);
        Assert.Empty(_factory.NotificationsOf(bystanderId));
        Assert.All(Enum.GetValues<EnumAccountEmail>(), kind => Assert.Empty(_factory.Emails.SentTo(fatecEmail, kind)));
    }

    [Fact]
    public async Task CreateDenunciation_Confidential_LeavesTheNotificationQueueOut()
    {
        int reporterId = _factory.SeedUser("Igor Mendes Batista").Id;
        _factory.PrepareForNotifications(reporterId);

        Guid denunciationId = await ReportAsync(reporterId, EnumDenunciationCategory.FakeProfile, isAnonymous: true);

        Assert.False(await Harness.Published.Any<DenunciationReceivedEvent>(
            published => published.Context.Message.DenunciationId == denunciationId));
        Assert.Empty(_factory.NotificationsOf(reporterId));
    }

    [Fact]
    public async Task CreateDenunciation_ReporterWithNotificationsOff_IsNotNotified()
    {
        int reporterId = _factory.SeedUser("Juliana Freitas Moura").Id;

        Guid denunciationId = await ReportAsync(reporterId, EnumDenunciationCategory.Spam);
        await WaitUntilConsumedAsync(denunciationId);

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
}
