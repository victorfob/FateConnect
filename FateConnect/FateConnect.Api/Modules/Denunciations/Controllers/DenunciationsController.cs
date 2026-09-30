namespace FateConnect.Api.Modules.Denunciations.Controllers;

using FateConnect.Api.Modules.Auth.Attributes;
using FateConnect.Api.Modules.Auth.Extensions;
using FateConnect.Api.Modules.Common.DTOs;
using FateConnect.Api.Modules.Common.Enums;
using FateConnect.Api.Modules.Common.Extensions;
using FateConnect.Api.Modules.Denunciations.DTOs;
using FateConnect.Api.Modules.Denunciations.Interfaces;
using FateConnect.Api.Modules.Users.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Threading.Tasks;

[ApiController]
[Route("[controller]")]
[Authorize]
public class DenunciationsController(IDenunciationService service, IWebHostEnvironment environment) : ControllerBase
{
    [HttpPost]
    [AuthorizeProfile(EnumProfileType.Operator)]
    public async Task<ActionResult<ReadDenunciationDto>> CreateAsync([FromForm] CreateDenunciationDto dto)
    {
        var result = await service.CreateAsync(dto, User.GetUserId());

        return StatusCode(StatusCodes.Status201Created, result);
    }

    [HttpGet("mine")]
    [AuthorizeProfile(EnumProfileType.Operator)]
    public async Task<ActionResult<PagedResultDto<ReadDenunciationDto>>> GetMineAsync([FromQuery] DenunciationFilterDto filter)
    {
        var result = await service.GetReportedByAsync(filter, User.GetUserId());

        return Ok(result);
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

    [HttpGet("{id:guid}/image")]
    [AuthorizeProfile(EnumProfileType.Operator)]
    public async Task<ActionResult> GetImageAsync(Guid id)
    {
        string? storedImageName = await service.GetStoredImageNameAsync(id, User.GetUserId(), User.IsAdministrator());

        if (storedImageName is null)
            return NotFound();

        return this.ServeStoredImage(environment, EnumStorageContainer.Denunciation, storedImageName);
    }

    [HttpGet("{id:guid}/image/thumbnail")]
    [AuthorizeProfile(EnumProfileType.Operator)]
    public async Task<ActionResult> GetThumbnailAsync(Guid id)
    {
        string? storedImageName = await service.GetStoredImageNameAsync(id, User.GetUserId(), User.IsAdministrator());

        if (storedImageName is null)
            return NotFound();

        return this.ServeStoredImage(
            environment, EnumStorageContainer.Denunciation, storedImageName, EnumStoredImageVariant.Thumbnail);
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
