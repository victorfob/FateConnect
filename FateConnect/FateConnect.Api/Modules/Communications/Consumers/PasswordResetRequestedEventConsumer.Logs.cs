namespace FateConnect.Api.Modules.Communications.Consumers;

using Microsoft.Extensions.Logging;
using System;

public partial class PasswordResetRequestedEventConsumer
{
    [LoggerMessage(Level = LogLevel.Information, Message = "Started sending password reset email to: {ToEmail}")]
    private static partial void LogPasswordResetDispatchStarted(ILogger logger, string toEmail);

    [LoggerMessage(Level = LogLevel.Information, Message = "Password reset email successfully sent to: {ToEmail}")]
    private static partial void LogPasswordResetDispatchSucceeded(ILogger logger, string toEmail);

    [LoggerMessage(Level = LogLevel.Error, Message = "Failed to send password reset email to: {ToEmail}")]
    private static partial void LogPasswordResetDispatchFailed(ILogger logger, Exception ex, string toEmail);
}
