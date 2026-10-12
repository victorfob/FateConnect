namespace FateConnect.Api.Modules.InAppNotifications.Controllers;

using FateConnect.Api.Modules.Auth.Attributes;
using FateConnect.Api.Modules.Auth.Extensions;
using FateConnect.Api.Modules.Common.DTOs;
using FateConnect.Api.Modules.InAppNotifications.DTOs;
using FateConnect.Api.Modules.InAppNotifications.Interfaces;
using FateConnect.Api.Modules.Users.Enums;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;

[ApiController]
[Route("[controller]")]
[AuthorizeProfile(EnumProfileType.Operator)]
public class InAppNotificationsController(IInAppNotificationService service) : ControllerBase
{
    [HttpGet]
    [ProducesResponseType(typeof(PagedResultDto<ReadInAppNotificationDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<PagedResultDto<ReadInAppNotificationDto>>> GetAllAsync([FromQuery] FilterInAppNotificationDto filter)
    {
        var result = await service.GetAllAsync(filter, User.GetUserId());
        return Ok(result);
    }

    [HttpGet("unread-count")]
    [ProducesResponseType(typeof(int), StatusCodes.Status200OK)]
    public async Task<ActionResult<int>> GetUnreadCountAsync()
    {
        int result = await service.GetUnreadCountAsync(User.GetUserId());
        return Ok(result);
    }

    [HttpPatch("{id:int}/read")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ErrorResponseDto), StatusCodes.Status404NotFound)]
    public async Task<ActionResult> MarkAsReadAsync(int id)
    {
        await service.MarkAsReadAsync(id, User.GetUserId());
        return NoContent();
    }

    [HttpPatch("read-all")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<ActionResult> MarkAllAsReadAsync()
    {
        await service.MarkAllAsReadAsync(User.GetUserId());
        return NoContent();
    }
}
