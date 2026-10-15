namespace FateConnect.Api.Modules.InAppNotifications.Controllers;

using System.Threading.Tasks;
using FateConnect.Api.Modules.Auth.Attributes;
using FateConnect.Api.Modules.Auth.Extensions;
using FateConnect.Api.Modules.Common.DTOs;
using FateConnect.Api.Modules.InAppNotifications.DTOs;
using FateConnect.Api.Modules.InAppNotifications.Interfaces;
using FateConnect.Api.Modules.Users.Enums;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Swashbuckle.AspNetCore.Annotations;

[ApiController]
[Route("[controller]")]
[AuthorizeProfile(EnumProfileType.Operator)]
[SwaggerTag("In-app notifications of the signed-in user: the list, the unread count and marking them as read.")]
public class InAppNotificationsController(IInAppNotificationService service) : ControllerBase
{
    [HttpGet]
    [SwaggerOperation(
        OperationId = "ListNotifications",
        Summary = "List my notifications",
        Description = "Returns a page of the notifications of the signed-in user, the most recent first, " +
            "matching the optional filters.")]
    [ProducesResponseType(typeof(PagedResultDto<ReadInAppNotificationDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<PagedResultDto<ReadInAppNotificationDto>>> GetAllAsync(
        [FromQuery] FilterInAppNotificationDto filter)
    {
        var result = await service.GetAllAsync(filter, User.GetUserId());
        return Ok(result);
    }

    [HttpGet("unread-count")]
    [SwaggerOperation(
        OperationId = "CountUnreadNotifications",
        Summary = "Count my unread notifications",
        Description = "Returns how many notifications of the signed-in user are still unread.")]
    [ProducesResponseType(typeof(int), StatusCodes.Status200OK)]
    public async Task<ActionResult<int>> GetUnreadCountAsync()
    {
        int result = await service.GetUnreadCountAsync(User.GetUserId());
        return Ok(result);
    }

    [HttpPatch("{id:int}/read")]
    [SwaggerOperation(
        OperationId = "MarkNotificationAsRead",
        Summary = "Mark a notification as read",
        Description = "Marks one notification of the signed-in user as read. A notification of someone else " +
            "answers 404, like one that does not exist.")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<ActionResult> MarkAsReadAsync([SwaggerParameter("Notification ID.")] int id)
    {
        await service.MarkAsReadAsync(id, User.GetUserId());
        return NoContent();
    }

    [HttpPatch("read-all")]
    [SwaggerOperation(
        OperationId = "MarkAllNotificationsAsRead",
        Summary = "Mark all my notifications as read",
        Description = "Marks every unread notification of the signed-in user as read.")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<ActionResult> MarkAllAsReadAsync()
    {
        await service.MarkAllAsReadAsync(User.GetUserId());
        return NoContent();
    }
}
