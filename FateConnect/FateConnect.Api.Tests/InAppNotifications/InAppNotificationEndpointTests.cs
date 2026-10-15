using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using System.Text.Json.Serialization;
using FateConnect.Api.Modules.InAppNotifications.Enums;
using FateConnect.Api.Tests.Fixtures;

namespace FateConnect.Api.Tests.InAppNotifications;

public class InAppNotificationEndpointTests : IClassFixture<ApiFactory>
{
    private static readonly JsonSerializerOptions JsonOptions =
        new(JsonSerializerDefaults.Web) { Converters = { new JsonStringEnumConverter() } };

    private static readonly DateTime Monday = new(2026, 10, 5, 12, 0, 0, DateTimeKind.Utc);

    private readonly ApiFactory _factory;

    public InAppNotificationEndpointTests(ApiFactory factory)
    {
        _factory = factory;
    }

    private sealed record ReadNotification(
        int Id,
        EnumInAppNotificationType Type,
        string Content,
        string? ReferenceId,
        bool IsRead,
        DateTime CreatedAt);

    private sealed record PagedNotifications(IReadOnlyList<ReadNotification> Items, int Page, int PageSize, int Total);

    private static async Task<PagedNotifications> ListAsync(HttpClient client, string query = "")
    {
        HttpResponseMessage response = await client.GetAsync($"/InAppNotifications{query}");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        return (await response.Content.ReadFromJsonAsync<PagedNotifications>(JsonOptions))!;
    }

    private static async Task<int> UnreadCountAsync(HttpClient client) =>
        await client.GetFromJsonAsync<int>("/InAppNotifications/unread-count");

    [Fact]
    public async Task GetAll_WithoutToken_IsRejected()
    {
        HttpResponseMessage response = await _factory.CreateClient().GetAsync("/InAppNotifications");

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task NegotiateHub_AcceptsTheTokenOnlyFromTheQuery()
    {
        int userId = _factory.SeedUser("Mariana Alves Rocha").Id;
        HttpClient client = _factory.CreateClient();
        string token = ApiFactory.IssueToken(userId);

        HttpResponseMessage withToken = await client.PostAsync(
            $"/hubs/notifications/negotiate?negotiateVersion=1&access_token={token}", null);
        HttpResponseMessage withoutToken = await client.PostAsync("/hubs/notifications/negotiate?negotiateVersion=1", null);

        Assert.Equal(HttpStatusCode.OK, withToken.StatusCode);
        Assert.Equal(HttpStatusCode.Unauthorized, withoutToken.StatusCode);
    }

    [Fact]
    public async Task GetAll_ListsOnlyTheCallersNotifications_NewestFirst()
    {
        int ownerId = _factory.SeedUser("Mariana Alves Rocha").Id;
        int otherUserId = _factory.SeedUser("Bruno Carvalho Souza").Id;
        int older = _factory.SeedNotification(ownerId, Monday);
        int newer = _factory.SeedNotification(ownerId, Monday.AddHours(3));
        _factory.SeedNotification(otherUserId, Monday.AddHours(1));

        PagedNotifications page = await ListAsync(_factory.CreateClientFor(ownerId));

        Assert.Equal(2, page.Total);
        Assert.Equal([newer, older], page.Items.Select(notification => notification.Id));
    }

    [Fact]
    public async Task GetAll_WithTheSameTimestamp_ListsTheLatestInsertedFirst()
    {
        int ownerId = _factory.SeedUser("Carla Menezes Duarte").Id;
        int first = _factory.SeedNotification(ownerId, Monday);
        int second = _factory.SeedNotification(ownerId, Monday);

        PagedNotifications page = await ListAsync(_factory.CreateClientFor(ownerId));

        Assert.Equal([second, first], page.Items.Select(notification => notification.Id));
    }

    [Fact]
    public async Task GetAll_FilteredByReadStateAndType_ReturnsOnlyTheMatches()
    {
        int ownerId = _factory.SeedUser("Daniela Prado Lima").Id;
        int unreadRide = _factory.SeedNotification(ownerId, Monday, EnumInAppNotificationType.RideToNeighborhood);
        _factory.SeedNotification(ownerId, Monday, EnumInAppNotificationType.RideToNeighborhood, isRead: true);
        _factory.SeedNotification(ownerId, Monday, EnumInAppNotificationType.ItemArchived);
        HttpClient client = _factory.CreateClientFor(ownerId);

        PagedNotifications page = await ListAsync(client, "?isRead=false&type=RideToNeighborhood");

        Assert.Equal([unreadRide], page.Items.Select(notification => notification.Id));
    }

    [Fact]
    public async Task GetUnreadCount_CountsOnlyTheCallersUnreadNotifications()
    {
        int ownerId = _factory.SeedUser("Eduardo Ramos Teixeira").Id;
        int otherUserId = _factory.SeedUser("Fernanda Costa Ribeiro").Id;
        _factory.SeedNotification(ownerId, Monday);
        _factory.SeedNotification(ownerId, Monday);
        _factory.SeedNotification(ownerId, Monday, isRead: true);
        _factory.SeedNotification(otherUserId, Monday);

        Assert.Equal(2, await UnreadCountAsync(_factory.CreateClientFor(ownerId)));
    }

    [Fact]
    public async Task MarkAsRead_OwnNotification_MarksItAndLowersTheCount()
    {
        int ownerId = _factory.SeedUser("Gabriel Nunes Farias").Id;
        int notificationId = _factory.SeedNotification(ownerId, Monday);
        HttpClient client = _factory.CreateClientFor(ownerId);

        HttpResponseMessage response = await client.PatchAsync($"/InAppNotifications/{notificationId}/read", null);
        HttpResponseMessage repeated = await client.PatchAsync($"/InAppNotifications/{notificationId}/read", null);

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        Assert.Equal(HttpStatusCode.NoContent, repeated.StatusCode);
        Assert.True(Assert.Single(_factory.NotificationsOf(ownerId)).IsRead);
        Assert.Equal(0, await UnreadCountAsync(client));
    }

    [Fact]
    public async Task MarkAsRead_SomeoneElsesNotification_Returns404AndLeavesItUnread()
    {
        int ownerId = _factory.SeedUser("Helena Vieira Campos").Id;
        int intruderId = _factory.SeedUser("Igor Mendes Batista").Id;
        int notificationId = _factory.SeedNotification(ownerId, Monday);

        HttpResponseMessage response = await _factory
            .CreateClientFor(intruderId)
            .PatchAsync($"/InAppNotifications/{notificationId}/read", null);

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
        Assert.False(Assert.Single(_factory.NotificationsOf(ownerId)).IsRead);
    }

    [Fact]
    public async Task MarkAllAsRead_MarksOnlyTheCallersNotifications()
    {
        int ownerId = _factory.SeedUser("Juliana Freitas Moura").Id;
        int otherUserId = _factory.SeedUser("Lucas Pereira Antunes").Id;
        _factory.SeedNotification(ownerId, Monday);
        _factory.SeedNotification(ownerId, Monday.AddHours(1));
        _factory.SeedNotification(otherUserId, Monday);

        HttpResponseMessage response = await _factory
            .CreateClientFor(ownerId)
            .PatchAsync("/InAppNotifications/read-all", null);

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        Assert.All(_factory.NotificationsOf(ownerId), notification => Assert.True(notification.IsRead));
        Assert.False(Assert.Single(_factory.NotificationsOf(otherUserId)).IsRead);
    }
}
