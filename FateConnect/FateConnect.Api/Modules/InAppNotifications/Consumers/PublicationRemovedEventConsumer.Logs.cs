namespace FateConnect.Api.Modules.InAppNotifications.Consumers;

using System;
using Microsoft.Extensions.Logging;

public sealed partial class PublicationRemovedEventConsumer
{
    [LoggerMessage(
        EventId = 1,
        Level = LogLevel.Information,
        Message = "Publication removed notification successfully processed and saved for user ID {UserId}.")]
    private static partial void LogPublicationRemovedDispatchSucceeded(ILogger logger, int userId);

    [LoggerMessage(
        EventId = 2,
        Level = LogLevel.Error,
        Message = "Failed to process publication removed notification for user ID {UserId}.")]
    private static partial void LogPublicationRemovedDispatchFailed(ILogger logger, Exception ex, int userId);

    [LoggerMessage(
        EventId = 3,
        Level = LogLevel.Information,
        Message = "Publication removed notification skipped. User ID {UserId} is inactive.")]
    private static partial void LogPublicationRemovedSkippedForInactiveUser(ILogger logger, int userId);
}
