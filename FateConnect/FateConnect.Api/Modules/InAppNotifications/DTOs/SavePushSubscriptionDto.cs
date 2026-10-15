namespace FateConnect.Api.Modules.InAppNotifications.DTOs;

using System.ComponentModel.DataAnnotations;
using FateConnect.Api.Infrastructure.OpenApi;
using FateConnect.Api.Modules.InAppNotifications.Infrastructure;
using Swashbuckle.AspNetCore.Annotations;

public class SavePushSubscriptionDto
{
    [Required(ErrorMessage = "The endpoint is required.")]
    [MaxLength(PushSubscriptionConfiguration.EndpointMaxLength)]
    [RegularExpression(@"^https://\S+$", ErrorMessage = "The endpoint must be an https address.")]
    [SwaggerSchema("Address of the browser push service that delivers to this device.")]
    [SchemaExample("https://fcm.googleapis.com/fcm/send/dXJsLXNhZmUtZXhhbXBsZQ")]
    public string Endpoint { get; set; } = string.Empty;

    [Required(ErrorMessage = "The p256dh key is required.")]
    [MaxLength(PushSubscriptionConfiguration.KeyMaxLength)]
    [SwaggerSchema("Public key of the device that encrypts the message, in base64url, as the browser gives it.")]
    [SchemaExample("BNcRdreALRFXTkOOUHK1EtK2wtaz5Ry4YfYCA_0QTpQtUbVlUls0VJXg7A8u-Ts1XbjhazAkj7I99e8QcYP7DkM")]
    public string P256dh { get; set; } = string.Empty;

    [Required(ErrorMessage = "The auth secret is required.")]
    [MaxLength(PushSubscriptionConfiguration.KeyMaxLength)]
    [SwaggerSchema("Authentication secret of the device, in base64url, as the browser gives it.")]
    [SchemaExample("tBHItJI5svbpez7KI4CCXg")]
    public string Auth { get; set; } = string.Empty;
}
