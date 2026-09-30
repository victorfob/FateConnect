namespace FateConnect.Api.Modules.Users.DTOs;

public record ReadUserPreferencesDto(
    bool ReceiveEmails,
    bool ReceiveNotifications
);
