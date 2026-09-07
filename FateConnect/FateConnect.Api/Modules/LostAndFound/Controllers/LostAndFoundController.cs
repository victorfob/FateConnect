namespace FateConnect.Api.Modules.LostAndFound.Controllers;

using FateConnect.Api.Modules.Auth.Extensions;
using FateConnect.Api.Modules.Common.DTOs;
using FateConnect.Api.Modules.LostAndFound.DTOs;
using FateConnect.Api.Modules.LostAndFound.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("[controller]")]
[Authorize]
public class LostAndFoundController(ILostAndFoundService service) : ControllerBase
{
    [HttpPost]
    public async Task<ActionResult<ReadLostAndFoundDto>> CreateAsync([FromForm] CreateLostAndFoundDto dto)
    {
        var result = await service.CreateAsync(dto, User.GetUserId());

        return CreatedAtAction("GetLostAndFoundById", new { id = result.Id }, result);
    }

    [HttpGet]
    public async Task<ActionResult<PagedResultDto<ReadLostAndFoundDto>>> GetAllAsync([FromQuery] FilterLostAndFoundDto filter)
    {
        var result = await service.GetAllAsync(filter, User.GetUserId());

        return Ok(result);
    }

    [HttpGet("{id:guid}", Name = "GetLostAndFoundById")]
    public async Task<ActionResult<ReadLostAndFoundDto>> GetByIdAsync(Guid id)
    {
        var result = await service.GetByIdAsync(id, User.GetUserId());

        if (result is null)
            return NotFound();

        return Ok(result);
    }

    [HttpPatch("{id:guid}")]
    public async Task<ActionResult<ReadLostAndFoundDto>> UpdateAsync(Guid id, [FromForm] UpdateLostAndFoundDto dto)
    {
        var result = await service.UpdateAsync(id, dto, User.GetUserId());

        if (result is null)
            return NotFound();

        return Ok(result);
    }

    [HttpDelete("{id:guid}")]
    public async Task<ActionResult> DeleteAsync(Guid id)
    {
        bool deleted = await service.DeleteAsync(id, User.GetUserId());

        if (!deleted)
            return NotFound();

        return NoContent();
    }
}
