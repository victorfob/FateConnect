namespace FateConnect.Api.Modules.Emails.Consumers;

using System;
using FateConnect.Api.Modules.Emails.Enums;
using Microsoft.Extensions.Logging;

public abstract partial class AccountEmailConsumer<TEvent>
{
    [LoggerMessage(
        EventId = 1,
        Level = LogLevel.Information,
        Message = "Starting dispatch of {Email} email for user ID {UserId}.")]
    private static partial void LogDispatchStarted(ILogger logger, EnumAccountEmail email, int userId);

    [LoggerMessage(
        EventId = 2,
        Level = LogLevel.Information,
        Message = "{Email} email successfully sent for user ID {UserId}.")]
    private static partial void LogDispatchSucceeded(ILogger logger, EnumAccountEmail email, int userId);

    [LoggerMessage(EventId = 3, Level = LogLevel.Error, Message = "Failed to send {Email} email for user ID {UserId}.")]
    private static partial void LogDispatchFailed(ILogger logger, Exception ex, EnumAccountEmail email, int userId);
}
