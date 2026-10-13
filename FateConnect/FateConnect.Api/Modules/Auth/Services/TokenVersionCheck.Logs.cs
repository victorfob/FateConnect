namespace FateConnect.Api.Modules.Auth.Services;

using Microsoft.Extensions.Logging;

public static partial class TokenVersionCheck
{
    [LoggerMessage(
        EventId = 1,
        Level = LogLevel.Warning,
        Message = "Token refused: it carries no readable user or session version.")]
    private static partial void LogUnreadableTokenRefused(ILogger logger);

    [LoggerMessage(
        EventId = 2,
        Level = LogLevel.Warning,
        Message = "Token refused for user ID {UserId}: its session was ended.")]
    private static partial void LogRevokedTokenRefused(ILogger logger, int userId);
}
