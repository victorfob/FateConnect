namespace FateConnect.Api.Modules.InAppNotifications.Consumers;

using Microsoft.Extensions.Logging;
using System;

public sealed partial class DenunciationReceivedEventConsumer
{
    [LoggerMessage(EventId = 1, Level = LogLevel.Information, Message = "Starting dispatch of in-app notification for user ID {UserId}.")]
    private static partial void LogNotificationDispatchStarted(ILogger logger, int userId);

    [LoggerMessage(EventId = 2, Level = LogLevel.Information, Message = "In-app notification skipped. User ID {UserId} has notifications disabled in preferences.")]
    private static partial void LogNotificationSkippedDueToPreferences(ILogger logger, int userId);

    [LoggerMessage(EventId = 3, Level = LogLevel.Information, Message = "In-app notification successfully processed and saved for user ID {UserId}.")]
    private static partial void LogNotificationDispatchSucceeded(ILogger logger, int userId);

    [LoggerMessage(EventId = 4, Level = LogLevel.Error, Message = "Failed to process in-app notification for user ID {UserId}.")]
    private static partial void LogNotificationDispatchFailed(ILogger logger, Exception ex, int userId);

    [LoggerMessage(EventId = 5, Level = LogLevel.Information, Message = "In-app notification skipped. Denunciation is anonymous for user ID {UserId}.")]
    private static partial void LogNotificationSkippedDueToAnonymous(ILogger logger, int userId);
}
