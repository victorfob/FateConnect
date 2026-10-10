namespace FateConnect.Api.Modules.Communications.Consumers;

using Microsoft.Extensions.Logging;
using System;

public sealed partial class AccountLockedEventConsumer
{
    [LoggerMessage(EventId = 1, Level = LogLevel.Information, Message = "Starting dispatch of account locked email for user ID {UserId}.")]
    private static partial void LogAccountLockedDispatchStarted(ILogger logger, int userId);

    [LoggerMessage(EventId = 2, Level = LogLevel.Information, Message = "Account locked email successfully sent for user ID {UserId}.")]
    private static partial void LogAccountLockedDispatchSucceeded(ILogger logger, int userId);

    [LoggerMessage(EventId = 3, Level = LogLevel.Error, Message = "Failed to send account locked email for user ID {UserId}.")]
    private static partial void LogAccountLockedDispatchFailed(ILogger logger, Exception ex, int userId);
}
