namespace FateConnect.Api.Modules.InAppNotifications.Consumers;

using FateConnect.Api.Modules.InAppNotifications.Events;
using FateConnect.Api.Modules.InAppNotifications.Hubs;
using MassTransit;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.Logging;
using System;
using System.Globalization;
using System.Threading.Tasks;

public sealed partial class NotificationDispatchedEventConsumer(
    IHubContext<NotificationHub> hubContext,
    ILogger<NotificationDispatchedEventConsumer> logger
) : IConsumer<NotificationDispatchedEvent>
{
    public async Task Consume(ConsumeContext<NotificationDispatchedEvent> context)
    {
        var message = context.Message;

        try
        {
            LogNotificationSignalRDispatchStarted(logger, message.Notification.Id, message.TargetUserId);

            string targetUserId = message.TargetUserId.ToString(CultureInfo.InvariantCulture);

            await hubContext.Clients
                .User(targetUserId)
                .SendAsync(NotificationHub.ReceiveNotificationEvent, message.Notification);

            LogNotificationSignalRDispatchSucceeded(logger, message.Notification.Id, message.TargetUserId);
        }
        catch (Exception ex)
        {
            LogNotificationSignalRDispatchFailed(logger, ex, message.Notification.Id, message.TargetUserId);
            throw;
        }
    }
}
