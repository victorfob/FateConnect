namespace FateConnect.Api.Modules.Users.DTOs;

using Swashbuckle.AspNetCore.Annotations;

public record ReadUserPreferencesDto(
    [property: SwaggerSchema("Whether the user receives in-app notifications.")]
    bool ReceiveNotifications
);
