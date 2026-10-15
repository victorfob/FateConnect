namespace FateConnect.Api.Modules.InAppNotifications.Controllers;

using System.Threading.Tasks;
using FateConnect.Api.Modules.Auth.Attributes;
using FateConnect.Api.Modules.Auth.Extensions;
using FateConnect.Api.Modules.InAppNotifications.DTOs;
using FateConnect.Api.Modules.InAppNotifications.Interfaces;
using FateConnect.Api.Modules.Users.Enums;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Swashbuckle.AspNetCore.Annotations;

[ApiController]
[Route("InAppNotifications/push")]
[AuthorizeProfile(EnumProfileType.Operator)]
[SwaggerTag("Devices of the signed-in user that receive the notifications by push.")]
public class InAppNotificationsPushController(IPushNotificationService service) : ControllerBase
{
    [HttpGet("public-key")]
    [SwaggerOperation(
        OperationId = "GetPushPublicKey",
        Summary = "Get the push public key",
        Description = "Returns the public VAPID key the browser needs to subscribe a device to the push " +
            "notifications.")]
    [ProducesResponseType(typeof(ReadPushPublicKeyDto), StatusCodes.Status200OK)]
    public ActionResult<ReadPushPublicKeyDto> GetPublicKey()
    {
        return Ok(service.GetPublicKey());
    }

    [HttpPut("subscriptions")]
    [SwaggerOperation(
        OperationId = "SavePushSubscription",
        Summary = "Save a push device",
        Description = "Saves the device of the signed-in user that gave permission for push notifications, or " +
            "renews its keys. An endpoint that belonged to another account moves to the signed-in user.")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<ActionResult> SaveSubscriptionAsync([FromBody] SavePushSubscriptionDto dto)
    {
        await service.SaveSubscriptionAsync(User.GetUserId(), dto);
        return NoContent();
    }
}
