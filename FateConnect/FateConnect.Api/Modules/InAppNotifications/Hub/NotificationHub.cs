namespace FateConnect.Api.Modules.InAppNotifications.Hubs;

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

[Authorize]
public class NotificationHub : Hub
{
    public const string ReceiveNotificationEvent = "ReceiveNotification";
}
