namespace FateConnect.Api.Modules.Users.Services;

using Microsoft.Extensions.Logging;

public partial class UserService
{
    [LoggerMessage(Level = LogLevel.Information, Message = "User {UserId} created successfully.")]
    private static partial void LogUserCreated(ILogger logger, int userId);

    [LoggerMessage(Level = LogLevel.Information, Message = "User {UserId} profile updated successfully.")]
    private static partial void LogUserProfileUpdated(ILogger logger, int userId);

    [LoggerMessage(Level = LogLevel.Information, Message = "User {UserId} preferences updated successfully.")]
    private static partial void LogUserPreferencesUpdated(ILogger logger, int userId);

    [LoggerMessage(Level = LogLevel.Information, Message = "User {UserId} password changed successfully.")]
    private static partial void LogUserPasswordChanged(ILogger logger, int userId);

    [LoggerMessage(Level = LogLevel.Information, Message = "User {UserId} deactivated their account.")]
    private static partial void LogUserDeactivated(ILogger logger, int userId);

    [LoggerMessage(Level = LogLevel.Information, Message = "Administrator updated data for user {UserId}.")]
    private static partial void LogUserUpdatedByAdmin(ILogger logger, int userId);

    [LoggerMessage(Level = LogLevel.Information, Message = "Administrator changed profile of user {UserId} to {Profile}.")]
    private static partial void LogUserProfileTypeChangedByAdmin(ILogger logger, int userId, string profile);

    [LoggerMessage(Level = LogLevel.Information, Message = "Administrator changed status of user {UserId} to {Status}.")]
    private static partial void LogUserStatusChangedByAdmin(ILogger logger, int userId, string status);

    [LoggerMessage(Level = LogLevel.Warning, Message = "User {UserId} not found.")]
    private static partial void LogUserNotFound(ILogger logger, int userId);
}
