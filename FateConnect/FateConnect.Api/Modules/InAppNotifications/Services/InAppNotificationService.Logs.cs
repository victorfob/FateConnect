namespace FateConnect.Api.Modules.InAppNotifications.Services;

using Microsoft.Extensions.Logging;

public sealed partial class InAppNotificationService
{
    [LoggerMessage(
        EventId = 1,
        Level = LogLevel.Information,
        Message = "Retrieved {Count} notifications for user ID {UserId}.")]
    private static partial void LogNotificationsRetrieved(ILogger logger, int userId, int count);

    [LoggerMessage(
        EventId = 2,
        Level = LogLevel.Warning,
        Message = "Notification ID {NotificationId} not found or access denied for user ID {UserId}.")]
    private static partial void LogNotificationNotFound(ILogger logger, int notificationId, int userId);

    [LoggerMessage(
        EventId = 3,
        Level = LogLevel.Information,
        Message = "Notification ID {NotificationId} marked as read by user ID {UserId}.")]
    private static partial void LogNotificationMarkedAsRead(ILogger logger, int notificationId, int userId);

    [LoggerMessage(
        EventId = 4,
        Level = LogLevel.Information,
        Message = "All notifications marked as read for user ID {UserId}.")]
    private static partial void LogAllNotificationsMarkedAsRead(ILogger logger, int userId);
}
