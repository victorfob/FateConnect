namespace FateConnect.Api.Modules.InAppNotifications.Consumers;

using Microsoft.Extensions.Logging;
using System;

public sealed partial class NotificationDispatchedEventConsumer
{
    [LoggerMessage(EventId = 1, Level = LogLevel.Information, Message = "Starting SignalR dispatch for Notification ID {NotificationId} to user ID {UserId}.")]
    private static partial void LogNotificationSignalRDispatchStarted(ILogger logger, int notificationId, int userId);

    [LoggerMessage(EventId = 2, Level = LogLevel.Information, Message = "Successfully dispatched SignalR notification for Notification ID {NotificationId} to user ID {UserId}.")]
    private static partial void LogNotificationSignalRDispatchSucceeded(ILogger logger, int notificationId, int userId);

    [LoggerMessage(EventId = 3, Level = LogLevel.Error, Message = "Failed to dispatch SignalR notification for Notification ID {NotificationId} to user ID {UserId}.")]
    private static partial void LogNotificationSignalRDispatchFailed(ILogger logger, Exception ex, int notificationId, int userId);
}
