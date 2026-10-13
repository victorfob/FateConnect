namespace FateConnect.Api.Modules.Users.Services;

using FateConnect.Api.Modules.Users.Enums;
using Microsoft.Extensions.Logging;

public partial class UserService
{
    [LoggerMessage(EventId = 1, Level = LogLevel.Information, Message = "User ID {UserId} created successfully.")]
    private static partial void LogUserCreated(ILogger logger, int userId);

    [LoggerMessage(EventId = 2, Level = LogLevel.Information, Message = "User ID {UserId} profile updated successfully.")]
    private static partial void LogUserProfileUpdated(ILogger logger, int userId);

    [LoggerMessage(EventId = 3, Level = LogLevel.Information, Message = "User ID {UserId} preferences updated successfully.")]
    private static partial void LogUserPreferencesUpdated(ILogger logger, int userId);

    [LoggerMessage(EventId = 4, Level = LogLevel.Information, Message = "User ID {UserId} password changed successfully.")]
    private static partial void LogUserPasswordChanged(ILogger logger, int userId);

    [LoggerMessage(EventId = 5, Level = LogLevel.Information, Message = "User ID {UserId} deactivated their account.")]
    private static partial void LogUserDeactivated(ILogger logger, int userId);

    [LoggerMessage(EventId = 6, Level = LogLevel.Information, Message = "Administrator user ID {AdministratorId} updated the data of user ID {UserId}.")]
    private static partial void LogUserUpdatedByAdmin(ILogger logger, int administratorId, int userId);

    [LoggerMessage(EventId = 7, Level = LogLevel.Information, Message = "Administrator user ID {AdministratorId} changed the profile of user ID {UserId} to {Profile}.")]
    private static partial void LogUserProfileTypeChangedByAdmin(ILogger logger, int administratorId, int userId, EnumProfileType profile);

    [LoggerMessage(EventId = 8, Level = LogLevel.Information, Message = "Administrator user ID {AdministratorId} changed the status of user ID {UserId} to {Status}.")]
    private static partial void LogUserStatusChangedByAdmin(ILogger logger, int administratorId, int userId, EnumAccountStatus status);

    [LoggerMessage(EventId = 9, Level = LogLevel.Warning, Message = "User ID {UserId} not found.")]
    private static partial void LogUserNotFound(ILogger logger, int userId);

    [LoggerMessage(EventId = 10, Level = LogLevel.Warning, Message = "User ID {UserId} was refused a password change: wrong current password.")]
    private static partial void LogPasswordChangeRefused(ILogger logger, int userId);

    [LoggerMessage(EventId = 11, Level = LogLevel.Information, Message = "User ID {UserId} replaced their profile photo.")]
    private static partial void LogUserPhotoReplaced(ILogger logger, int userId);

    [LoggerMessage(EventId = 12, Level = LogLevel.Information, Message = "User ID {UserId} removed their profile photo.")]
    private static partial void LogUserPhotoRemoved(ILogger logger, int userId);
}
