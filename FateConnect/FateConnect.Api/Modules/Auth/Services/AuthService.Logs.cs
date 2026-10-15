namespace FateConnect.Api.Modules.Auth.Services;

using FateConnect.Api.Modules.Auth.Enums;
using FateConnect.Api.Modules.Users.Enums;
using Microsoft.Extensions.Logging;

public partial class AuthService
{
    [LoggerMessage(
        EventId = 1,
        Level = LogLevel.Information,
        Message = "User ID {UserId} successfully confirmed their email.")]
    private static partial void LogEmailConfirmed(ILogger logger, int userId);

    [LoggerMessage(
        EventId = 2,
        Level = LogLevel.Information,
        Message = "User ID {UserId} successfully started a new session.")]
    private static partial void LogUserLoggedIn(ILogger logger, int userId);

    [LoggerMessage(EventId = 3, Level = LogLevel.Information, Message = "User ID {UserId} logged out.")]
    private static partial void LogUserLoggedOut(ILogger logger, int userId);

    [LoggerMessage(
        EventId = 4,
        Level = LogLevel.Information,
        Message = "User ID {UserId} reactivated their account and logged in.")]
    private static partial void LogUserReactivated(ILogger logger, int userId);

    [LoggerMessage(
        EventId = 5,
        Level = LogLevel.Information,
        Message = "Confirmation email resent for user ID {UserId}.")]
    private static partial void LogConfirmationEmailResent(ILogger logger, int userId);

    [LoggerMessage(
        EventId = 6,
        Level = LogLevel.Information,
        Message = "User ID {UserId} requested a password reset link.")]
    private static partial void LogPasswordResetRequested(ILogger logger, int userId);

    [LoggerMessage(
        EventId = 7,
        Level = LogLevel.Information,
        Message = "User ID {UserId} successfully reset their password.")]
    private static partial void LogPasswordResetSuccessfully(ILogger logger, int userId);

    [LoggerMessage(
        EventId = 8,
        Level = LogLevel.Warning,
        Message = "User ID {UserId} temporarily locked after multiple failed attempts.")]
    private static partial void LogUserLockedOut(ILogger logger, int userId);

    [LoggerMessage(EventId = 9, Level = LogLevel.Information, Message = "User ID {UserId} unlocked via email token.")]
    private static partial void LogUserUnlocked(ILogger logger, int userId);

    [LoggerMessage(EventId = 10, Level = LogLevel.Warning, Message = "Login refused for user ID {UserId}: {Reason}.")]
    private static partial void LogLoginRefused(ILogger logger, int userId, EnumLoginRefusalReason reason);

    [LoggerMessage(EventId = 11, Level = LogLevel.Warning, Message = "Login refused: no account for the email.")]
    private static partial void LogLoginRefusedForUnknownEmail(ILogger logger);

    [LoggerMessage(
        EventId = 12,
        Level = LogLevel.Information,
        Message = "{TokenType} link request skipped for user ID {UserId}: {Reason}.")]
    private static partial void LogLinkRequestSkipped(
        ILogger logger,
        EnumTokenType tokenType,
        int userId,
        EnumLinkRequestSkipReason reason);

    [LoggerMessage(
        EventId = 13,
        Level = LogLevel.Information,
        Message = "{TokenType} link request skipped: no account for the email.")]
    private static partial void LogLinkRequestForUnknownEmail(ILogger logger, EnumTokenType tokenType);
}
