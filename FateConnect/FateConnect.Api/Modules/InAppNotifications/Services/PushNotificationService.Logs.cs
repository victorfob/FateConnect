namespace FateConnect.Api.Modules.InAppNotifications.Services;

using Microsoft.Extensions.Logging;

public partial class PushNotificationService
{
    [LoggerMessage(
        EventId = 1,
        Level = LogLevel.Information,
        Message = "Push subscription saved for user ID {UserId}.")]
    private static partial void LogPushSubscriptionSaved(ILogger logger, int userId);

    [LoggerMessage(
        EventId = 2,
        Level = LogLevel.Information,
        Message = "Removed {Count} push subscriptions of user ID {UserId}.")]
    private static partial void LogPushSubscriptionsRemoved(ILogger logger, int count, int userId);

    [LoggerMessage(
        EventId = 3,
        Level = LogLevel.Information,
        Message = "Push of Notification ID {NotificationId} delivered to a device of user ID {UserId}.")]
    private static partial void LogPushDelivered(ILogger logger, int notificationId, int userId);

    [LoggerMessage(
        EventId = 4,
        Level = LogLevel.Information,
        Message = "Push subscription ID {SubscriptionId} of user ID {UserId} is gone and was removed.")]
    private static partial void LogPushDeviceGone(ILogger logger, int subscriptionId, int userId);

    [LoggerMessage(
        EventId = 5,
        Level = LogLevel.Warning,
        Message = "Push of Notification ID {NotificationId} to a device of user ID {UserId} failed.")]
    private static partial void LogPushDeliveryFailed(ILogger logger, int notificationId, int userId);
}
