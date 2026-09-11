namespace FateConnect.Api.Modules.Denunciations.Controllers;

using FateConnect.Api.Modules.Auth.Attributes;
using FateConnect.Api.Modules.Auth.Extensions;
using FateConnect.Api.Modules.Common.DTOs;
using FateConnect.Api.Modules.Denunciations.DTOs;
using FateConnect.Api.Modules.Denunciations.Interfaces;
using FateConnect.Api.Modules.Users.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Threading.Tasks;

[ApiController]
[Route("[controller]")]
[Authorize]
public class DenunciationsController(IDenunciationService service) : ControllerBase
{
    [HttpPost]
    [AuthorizeProfile(EnumProfileType.Operator)]
    public async Task<ActionResult<ReadDenunciationDto>> CreateAsync([FromForm] CreateDenunciationDto dto)
    {
        var result = await service.CreateAsync(dto, User.GetUserId());

        return CreatedAtRoute("GetDenunciationById", new { id = result.Id }, result);
    }

    [HttpGet]
    [AuthorizeProfile(EnumProfileType.Administrator)]
    public async Task<ActionResult<PagedResultDto<ReadDenunciationDto>>> GetAllAsync([FromQuery] DenunciationFilterDto filter)
    {
        var result = await service.GetAllAsync(filter);

        return Ok(result);
    }

    [HttpGet("{id:guid}", Name = "GetDenunciationById")]
    [AuthorizeProfile(EnumProfileType.Administrator)]
    public async Task<ActionResult<ReadDenunciationDto>> GetByIdAsync(Guid id)
    {
        var result = await service.GetByIdAsync(id);

        if (result is null)
            return NotFound();

        return Ok(result);
    }

    [HttpPatch("{id:guid}/status")]
    [AuthorizeProfile(EnumProfileType.Administrator)]
    public async Task<ActionResult<ReadDenunciationDto>> UpdateStatusAsync(Guid id, [FromBody] UpdateDenunciationStatusDto dto)
    {
        var result = await service.UpdateStatusAsync(id, dto);

        if (result is null)
            return NotFound();

        return Ok(result);
    }
}
