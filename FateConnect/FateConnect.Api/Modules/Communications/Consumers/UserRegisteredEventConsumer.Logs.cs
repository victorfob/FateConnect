namespace FateConnect.Api.Modules.Communications.Consumers;

using Microsoft.Extensions.Logging;
using System;

public sealed partial class UserRegisteredEventConsumer
{
    [LoggerMessage(EventId = 1, Level = LogLevel.Information, Message = "Starting dispatch of confirmation email for user ID {UserId}.")]
    private static partial void LogEmailDispatchStarted(ILogger logger, int userId);

    [LoggerMessage(EventId = 2, Level = LogLevel.Information, Message = "Confirmation email successfully sent for user ID {UserId}.")]
    private static partial void LogEmailDispatchSucceeded(ILogger logger, int userId);

    [LoggerMessage(EventId = 3, Level = LogLevel.Error, Message = "Failed to send confirmation email for user ID {UserId}.")]
    private static partial void LogEmailDispatchFailed(ILogger logger, Exception ex, int userId);
}
