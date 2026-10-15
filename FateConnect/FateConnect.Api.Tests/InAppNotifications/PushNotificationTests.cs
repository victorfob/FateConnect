using System.Globalization;
using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using FateConnect.Api.Modules.InAppNotifications.Constants;
using FateConnect.Api.Modules.InAppNotifications.Entities;
using FateConnect.Api.Modules.InAppNotifications.Enums;
using FateConnect.Api.Tests.Fixtures;

namespace FateConnect.Api.Tests.InAppNotifications;

public class PushNotificationTests : IClassFixture<ApiFactory>
{
    private static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web);

    private const string Destination = "Jardim Simus, Sorocaba";

    private readonly ApiFactory _factory;

    public PushNotificationTests(ApiFactory factory)
    {
        _factory = factory;
    }

    private sealed record ReadPublicKey(string PublicKey);

    private sealed record CreatedResource(Guid Id);

    private static string NewEndpoint() => $"https://push.example.com/send/{Guid.NewGuid():N}";

    private static object Device(string endpoint, string p256dh = "chave-p256dh-do-aparelho", string auth = "segredo-auth") =>
        new { endpoint, p256dh, auth };

    private static object NewRidePayload() => new
    {
        destination = Destination,
        departureDate = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(7)).ToString("yyyy-MM-dd", CultureInfo.InvariantCulture),
        departureTime = "08:30:00",
        rideType = "Solidarity",
        vehicleType = "Car",
        description = "Vaga para quem sai do campus.",
    };

    private async Task<Guid> OfferRideToTheNeighborhoodAsync()
    {
        int driverId = _factory.SeedUser("Henrique Prado Matos").Id;

        HttpResponseMessage response = await _factory.CreateClientFor(driverId).PostAsJsonAsync("/Rides", NewRidePayload());

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);

        return (await response.Content.ReadFromJsonAsync<CreatedResource>(JsonOptions))!.Id;
    }

    private async Task<IReadOnlyList<SentPush>> WaitForPushesAsync(string endpoint)
    {
        await ApiFactory.WaitUntilAsync(
            () => Task.FromResult(_factory.Pushes.SentTo(endpoint).Count > 0),
            $"Expected a push to {endpoint}.");

        return _factory.Pushes.SentTo(endpoint);
    }

    [Theory]
    [InlineData("GET", "/InAppNotifications/push/public-key")]
    [InlineData("PUT", "/InAppNotifications/push/subscriptions")]
    public async Task PushRoutes_WithoutToken_AreRejected(string method, string path)
    {
        HttpRequestMessage request = new(new HttpMethod(method), path) { Content = JsonContent.Create(Device(NewEndpoint())) };

        HttpResponseMessage response = await _factory.CreateClient().SendAsync(request);

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task GetPublicKey_WithToken_AnswersTheKeyOfTheEnvironment()
    {
        HttpClient client = _factory.CreateClientForNewUser("Lívia Moraes Teixeira");

        ReadPublicKey? key = await client.GetFromJsonAsync<ReadPublicKey>("/InAppNotifications/push/public-key", JsonOptions);

        Assert.Equal(ApiFactory.FakeVapidPublicKey, key?.PublicKey);
    }

    [Fact]
    public async Task SaveSubscription_NewDevice_StoresItForTheCaller()
    {
        int userId = _factory.SeedUser("Gustavo Reis Fontana").Id;
        string endpoint = NewEndpoint();

        HttpResponseMessage response = await _factory
            .CreateClientFor(userId)
            .PutAsJsonAsync("/InAppNotifications/push/subscriptions", Device(endpoint));

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        PushSubscription saved = Assert.Single(_factory.PushSubscriptionsOf(userId));
        Assert.Equal(endpoint, saved.Endpoint);
        Assert.Equal("chave-p256dh-do-aparelho", saved.P256dh);
        Assert.Equal("segredo-auth", saved.Auth);
    }

    [Fact]
    public async Task SaveSubscription_SameDeviceAgain_RenewsTheKeysWithoutDuplicatingIt()
    {
        int userId = _factory.SeedUser("Paula Vieira Campos").Id;
        string endpoint = NewEndpoint();
        HttpClient client = _factory.CreateClientFor(userId);

        await client.PutAsJsonAsync("/InAppNotifications/push/subscriptions", Device(endpoint));
        await client.PutAsJsonAsync("/InAppNotifications/push/subscriptions", Device(endpoint, "chave-nova", "segredo-novo"));

        PushSubscription saved = Assert.Single(_factory.PushSubscriptionsOf(userId));
        Assert.Equal("chave-nova", saved.P256dh);
        Assert.Equal("segredo-novo", saved.Auth);
    }

    [Fact]
    public async Task SaveSubscription_EndpointOfAnotherAccount_MovesItToTheCaller()
    {
        int previousOwnerId = _factory.SeedUser("Renato Silva Aguiar").Id;
        int currentUserId = _factory.SeedUser("Sabrina Costa Leal").Id;
        string endpoint = NewEndpoint();
        _factory.SeedPushSubscription(previousOwnerId, endpoint);

        HttpResponseMessage response = await _factory
            .CreateClientFor(currentUserId)
            .PutAsJsonAsync("/InAppNotifications/push/subscriptions", Device(endpoint));

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        Assert.Empty(_factory.PushSubscriptionsOf(previousOwnerId));
        Assert.Equal(endpoint, Assert.Single(_factory.PushSubscriptionsOf(currentUserId)).Endpoint);
    }

    [Theory]
    [InlineData("http://push.example.com/send/abc", "chave", "segredo")]
    [InlineData("", "chave", "segredo")]
    [InlineData("https://push.example.com/send/abc", "", "segredo")]
    [InlineData("https://push.example.com/send/abc", "chave", "")]
    public async Task SaveSubscription_InvalidDevice_Returns400AndStoresNothing(string endpoint, string p256dh, string auth)
    {
        int userId = _factory.SeedUser("Tatiane Rocha Lemos").Id;

        HttpResponseMessage response = await _factory
            .CreateClientFor(userId)
            .PutAsJsonAsync("/InAppNotifications/push/subscriptions", Device(endpoint, p256dh, auth));

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        Assert.Empty(_factory.PushSubscriptionsOf(userId));
    }

    [Fact]
    public async Task CreateRide_ResidentWithDevices_PushesTheNotificationToEachOfThem()
    {
        int residentId = _factory.SeedUser("Ulisses Barros Neto").Id;
        _factory.PrepareForNotifications(residentId, Destination);
        string phone = NewEndpoint();
        string laptop = NewEndpoint();
        _factory.SeedPushSubscription(residentId, phone);
        _factory.SeedPushSubscription(residentId, laptop);

        Guid rideId = await OfferRideToTheNeighborhoodAsync();
        SentPush push = Assert.Single(await WaitForPushesAsync(phone));
        Assert.Single(await WaitForPushesAsync(laptop));

        InAppNotification notification = Assert.Single(_factory.NotificationsOf(residentId));
        using JsonDocument payload = JsonDocument.Parse(push.Payload);
        Assert.Equal(notification.Id, payload.RootElement.GetProperty("id").GetInt32());
        Assert.Equal(nameof(EnumInAppNotificationType.RideToNeighborhood), payload.RootElement.GetProperty("type").GetString());
        Assert.Equal(NotificationContents.RideToDestination(Destination), payload.RootElement.GetProperty("content").GetString());
        Assert.Equal(rideId.ToString(), payload.RootElement.GetProperty("referenceId").GetString());
    }

    [Fact]
    public async Task CreateRide_DeviceThatIsGone_IsRemovedAndTheOtherKept()
    {
        int residentId = _factory.SeedUser("Viviane Lopes Carvalho").Id;
        _factory.PrepareForNotifications(residentId, Destination);
        string uninstalled = NewEndpoint();
        string unreachable = NewEndpoint();
        _factory.SeedPushSubscription(residentId, uninstalled);
        _factory.SeedPushSubscription(residentId, unreachable);
        _factory.Pushes.AnswerFor(uninstalled, EnumPushDelivery.Gone);
        _factory.Pushes.AnswerFor(unreachable, EnumPushDelivery.Failed);

        await OfferRideToTheNeighborhoodAsync();
        await WaitForPushesAsync(uninstalled);
        await WaitForPushesAsync(unreachable);
        await ApiFactory.WaitUntilAsync(
            () => Task.FromResult(_factory.PushSubscriptionsOf(residentId).Count == 1),
            "Expected the device that is gone to be removed.");

        Assert.Equal(unreachable, Assert.Single(_factory.PushSubscriptionsOf(residentId)).Endpoint);
        Assert.DoesNotContain(_factory.LogMessages, message => message.Contains(uninstalled, StringComparison.Ordinal));
        Assert.DoesNotContain(_factory.LogMessages, message => message.Contains(unreachable, StringComparison.Ordinal));
    }

    [Fact]
    public async Task UpdatePreferences_TurningNotificationsOff_RemovesEveryDeviceOfTheAccount()
    {
        int userId = _factory.SeedUser("Wellington Dias Prado").Id;
        int otherUserId = _factory.SeedUser("Yara Fonseca Rios").Id;
        _factory.PrepareForNotifications(userId);
        _factory.SeedPushSubscription(userId, NewEndpoint());
        _factory.SeedPushSubscription(userId, NewEndpoint());
        _factory.SeedPushSubscription(otherUserId, NewEndpoint());
        HttpClient client = _factory.CreateClientFor(userId);

        await client.PatchAsJsonAsync("/Users/me/preferences", new { receiveNotifications = true });
        int keptWhileOn = _factory.PushSubscriptionsOf(userId).Count;
        HttpResponseMessage response = await client.PatchAsJsonAsync("/Users/me/preferences", new { receiveNotifications = false });

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        Assert.Equal(2, keptWhileOn);
        Assert.Empty(_factory.PushSubscriptionsOf(userId));
        Assert.Single(_factory.PushSubscriptionsOf(otherUserId));
    }
}
