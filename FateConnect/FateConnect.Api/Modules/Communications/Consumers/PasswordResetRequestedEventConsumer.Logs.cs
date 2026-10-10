namespace FateConnect.Api.Modules.Communications.Consumers;

using Microsoft.Extensions.Logging;
using System;

public sealed partial class PasswordResetRequestedEventConsumer
{
    [LoggerMessage(EventId = 1, Level = LogLevel.Information, Message = "Starting dispatch of password reset email for user ID {UserId}.")]
    private static partial void LogPasswordResetDispatchStarted(ILogger logger, int userId);

    [LoggerMessage(EventId = 2, Level = LogLevel.Information, Message = "Password reset email successfully sent for user ID {UserId}.")]
    private static partial void LogPasswordResetDispatchSucceeded(ILogger logger, int userId);

    [LoggerMessage(EventId = 3, Level = LogLevel.Error, Message = "Failed to send password reset email for user ID {UserId}.")]
    private static partial void LogPasswordResetDispatchFailed(ILogger logger, Exception ex, int userId);
}
