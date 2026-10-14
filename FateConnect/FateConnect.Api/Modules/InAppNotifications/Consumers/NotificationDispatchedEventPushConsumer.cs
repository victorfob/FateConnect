namespace FateConnect.Api.Modules.InAppNotifications.Consumers;

using System;
using System.Threading.Tasks;
using FateConnect.Api.Modules.InAppNotifications.Events;
using FateConnect.Api.Modules.InAppNotifications.Interfaces;
using MassTransit;
using Microsoft.Extensions.Logging;

public sealed partial class NotificationDispatchedEventPushConsumer(
    IPushNotificationService pushNotificationService,
    ILogger<NotificationDispatchedEventPushConsumer> logger
) : IConsumer<NotificationDispatchedEvent>
{
    public async Task Consume(ConsumeContext<NotificationDispatchedEvent> context)
    {
        var message = context.Message;

        try
        {
            await pushNotificationService.SendAsync(message.Notification, message.TargetUserId);
        }
        catch (Exception ex)
        {
            LogNotificationPushDispatchFailed(logger, ex, message.Notification.Id, message.TargetUserId);
            throw;
        }
    }
}
