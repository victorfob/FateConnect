namespace FateConnect.Api.Modules.Auth.Services;

using Microsoft.Extensions.Logging;

public partial class AuthService
{
    [LoggerMessage(Level = LogLevel.Information, Message = "User ID {UserId} successfully confirmed their email.")]
    private static partial void LogEmailConfirmed(ILogger logger, int userId);

    [LoggerMessage(Level = LogLevel.Information, Message = "User ID {UserId} successfully started a new session.")]
    private static partial void LogUserLoggedIn(ILogger logger, int userId);

    [LoggerMessage(Level = LogLevel.Information, Message = "User ID {UserId} logged out.")]
    private static partial void LogUserLoggedOut(ILogger logger, int userId);

    [LoggerMessage(Level = LogLevel.Information, Message = "User ID {UserId} reactivated their account and logged in.")]
    private static partial void LogUserReactivated(ILogger logger, int userId);

    [LoggerMessage(Level = LogLevel.Information, Message = "Confirmation email resent for User ID {UserId}.")]
    private static partial void LogConfirmationEmailResent(ILogger logger, int userId);
}
