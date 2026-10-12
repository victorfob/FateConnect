namespace FateConnect.Api.Modules.InAppNotifications.Consumers;

using Microsoft.Extensions.Logging;
using System;

public sealed partial class ItemArchivedEventConsumer
{
    [LoggerMessage(EventId = 1, Level = LogLevel.Information, Message = "Starting dispatch of item archived in-app notification for user ID {UserId}.")]
    private static partial void LogItemArchivedDispatchStarted(ILogger logger, int userId);

    [LoggerMessage(EventId = 2, Level = LogLevel.Information, Message = "Item archived notification successfully processed and saved for user ID {UserId}.")]
    private static partial void LogItemArchivedDispatchSucceeded(ILogger logger, int userId);

    [LoggerMessage(EventId = 3, Level = LogLevel.Error, Message = "Failed to process item archived notification for user ID {UserId}.")]
    private static partial void LogItemArchivedDispatchFailed(ILogger logger, Exception ex, int userId);

    [LoggerMessage(EventId = 4, Level = LogLevel.Information, Message = "Item archived notification skipped. User ID {UserId} is inactive or has notifications disabled.")]
    private static partial void LogItemArchivedSkippedForIneligibleUser(ILogger logger, int userId);
}
