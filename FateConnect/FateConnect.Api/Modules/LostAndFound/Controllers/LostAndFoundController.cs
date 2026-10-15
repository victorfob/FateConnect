namespace FateConnect.Api.Modules.LostAndFound.Controllers;

using FateConnect.Api.Modules.Auth.Attributes;
using FateConnect.Api.Modules.Auth.Extensions;
using FateConnect.Api.Modules.Common.DTOs;
using FateConnect.Api.Modules.LostAndFound.DTOs;
using FateConnect.Api.Modules.LostAndFound.Interfaces;
using FateConnect.Api.Modules.Users.DTOs;
using FateConnect.Api.Modules.Users.Enums;
using FateConnect.Api.Modules.Users.Filters;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Swashbuckle.AspNetCore.Annotations;

[ApiController]
[Route("[controller]")]
[Authorize]
[SwaggerTag("Lost and found: items people lost or found on campus, with an optional photo.")]
public class LostAndFoundController(ILostAndFoundService service) : ControllerBase
{
    [HttpPost]
    [RequiresContact(EnumPublication.LostAndFoundItem)]
    [SwaggerOperation(
        OperationId = "CreateLostAndFoundItem",
        Summary = "Register a lost or found item",
        Description = "Registers an item with an optional photo, owned by the signed-in user. A user without " +
            "phone and contact e-mail answers 403 with the code `ContactRequired`.")]
    [ProducesResponseType(typeof(ReadLostAndFoundDto), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status403Forbidden)]
    public async Task<ActionResult<ReadLostAndFoundDto>> CreateAsync([FromForm] CreateLostAndFoundDto dto)
    {
        var result = await service.CreateAsync(dto, User.GetUserId());

        return CreatedAtRoute("GetLostAndFoundById", new { id = result.Id }, result);
    }

    [HttpGet]
    [SwaggerOperation(
        OperationId = "ListLostAndFoundItems",
        Summary = "List lost and found items",
        Description = "Returns a page of items matching the optional filters, the most recent first.")]
    public async Task<ActionResult<PagedResultDto<ReadLostAndFoundDto>>> GetAllAsync(
        [FromQuery] LostAndFoundFilterDto filter)
    {
        var result = await service.GetAllAsync(filter, User.GetUserId());

        return Ok(result);
    }

    [HttpGet("{id:guid}", Name = "GetLostAndFoundById")]
    [SwaggerOperation(
        OperationId = "GetLostAndFoundById",
        Summary = "Get a lost and found item by ID",
        Description = "Returns an item by its ID.")]
    [ProducesResponseType(typeof(ReadLostAndFoundDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ReadLostAndFoundDto>> GetByIdAsync(
        [SwaggerParameter("Lost and found item ID.")] Guid id)
    {
        var result = await service.GetByIdAsync(id, User.GetUserId());

        if (result is null)
            return NotFound();

        return Ok(result);
    }

    [HttpPatch("{id:guid}")]
    [SwaggerOperation(
        OperationId = "UpdateLostAndFoundItem",
        Summary = "Update a lost and found item",
        Description = "Updates the item and its photo; fields left out keep their value, and `removeImage` " +
            "drops the photo when no new one is sent. Only the user who registered the item can " +
            "change it.")]
    [ProducesResponseType(typeof(ReadLostAndFoundDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ReadLostAndFoundDto>> UpdateAsync(
        [SwaggerParameter("Lost and found item ID.")] Guid id,
        [FromForm] UpdateLostAndFoundDto dto)
    {
        var result = await service.UpdateAsync(id, dto, User.GetUserId());

        if (result is null)
            return NotFound();

        return Ok(result);
    }

    [HttpDelete("{id:guid}")]
    [SwaggerOperation(
        OperationId = "DeleteLostAndFoundItem",
        Summary = "Delete a lost and found item",
        Description = "Removes the item from the lists. Only the user who registered the item can delete it, " +
            "and an item already deleted answers 404.")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<ActionResult> DeleteAsync([SwaggerParameter("Lost and found item ID.")] Guid id)
    {
        bool deleted = await service.DeleteAsync(id, User.GetUserId());

        if (!deleted)
            return NotFound();

        return NoContent();
    }

    [HttpPost("{id:guid}/remove")]
    [AuthorizeProfile(EnumProfileType.Administrator)]
    [SwaggerOperation(
        OperationId = "RemoveLostAndFoundItem",
        Summary = "Remove someone's lost and found item",
        Description = "Removes from every list, the author's included, an item that broke the terms of use, " +
            "recording the reason, and notifies the user who registered it, even with notifications turned off. " +
            "The author cannot restore it. Only administrators can do it.")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<ActionResult> RemoveAsync(
        [SwaggerParameter("Lost and found item ID.")] Guid id,
        RemovePublicationDto dto)
    {
        bool removed = await service.RemoveAsync(id, dto.Reason, User.GetUserId());

        if (!removed)
            return NotFound();

        return NoContent();
    }
}
