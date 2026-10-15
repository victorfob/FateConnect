namespace FateConnect.Api.Modules.InAppNotifications.Consumers;

using System;
using Microsoft.Extensions.Logging;

public sealed partial class NotificationDispatchedEventPushConsumer
{
    [LoggerMessage(
        EventId = 1,
        Level = LogLevel.Error,
        Message = "Failed to dispatch the push of Notification ID {NotificationId} to user ID {UserId}.")]
    private static partial void LogNotificationPushDispatchFailed(
        ILogger logger,
        Exception ex,
        int notificationId,
        int userId);
}
