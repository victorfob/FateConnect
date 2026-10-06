namespace FateConnect.Api.Modules.Communications.Consumers;

using Microsoft.Extensions.Logging;

public sealed partial class UserRegisteredEventConsumer
{
    [LoggerMessage(Level = LogLevel.Information, Message = "Starting confirmation email dispatch for: {Email}")]
    private static partial void LogEmailDispatchStarted(ILogger logger, string email);

    [LoggerMessage(Level = LogLevel.Information, Message = "Confirmation email successfully simulated/dispatched for: {Email}")]
    private static partial void LogEmailDispatchSucceeded(ILogger logger, string email);

    [LoggerMessage(Level = LogLevel.Error, Message = "Failed to dispatch confirmation email for: {Email}")]
    private static partial void LogEmailDispatchFailed(ILogger logger, Exception exception, string email);
}
