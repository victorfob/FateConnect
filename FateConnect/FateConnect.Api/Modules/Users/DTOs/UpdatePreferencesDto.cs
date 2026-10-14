namespace FateConnect.Api.Modules.Users.DTOs;

using FateConnect.Api.Infrastructure.OpenApi;
using Swashbuckle.AspNetCore.Annotations;

public class UpdatePreferencesDto
{
    [SwaggerSchema("Whether the user receives the notifications, in the app and by push; absent keeps the " +
        "current choice.")]
    [SchemaExample(true)]
    public bool? ReceiveNotifications { get; set; }
}
