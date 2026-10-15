namespace FateConnect.Api.Modules.InAppNotifications.DTOs;

using Swashbuckle.AspNetCore.Annotations;

public record ReadPushPublicKeyDto(
    [property: SwaggerSchema("Public VAPID key the browser needs to subscribe this device, in base64url.")]
    string PublicKey
);
