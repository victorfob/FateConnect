namespace FateConnect.Api.Modules.Reports.Controllers;

using System;
using System.Threading.Tasks;
using FateConnect.Api.Modules.Auth.Attributes;
using FateConnect.Api.Modules.Auth.Extensions;
using FateConnect.Api.Modules.Common.DTOs;
using FateConnect.Api.Modules.Reports.DTOs;
using FateConnect.Api.Modules.Reports.Interfaces;
using FateConnect.Api.Modules.Storage.Enums;
using FateConnect.Api.Modules.Storage.Extensions;
using FateConnect.Api.Modules.Users.Enums;
using FateConnect.Api.Modules.Users.Filters;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("[controller]")]
[Authorize]
public class ReportsController(IReportService service, IWebHostEnvironment environment) : ControllerBase
{
    [HttpPost]
    [AuthorizeProfile(EnumProfileType.Operator)]
    [RequiresContact(EnumPublication.IdentifiedReport)]
    public async Task<ActionResult<ReadReportDto>> CreateAsync([FromForm] CreateReportDto dto)
    {
        var result = await service.CreateAsync(dto, User.GetUserId());

        return CreatedAtRoute("GetReportById", new { id = result.Id }, result);
    }

    [HttpGet("mine")]
    [AuthorizeProfile(EnumProfileType.Operator)]
    public async Task<ActionResult<PagedResultDto<ReadReportDto>>> GetMineAsync(
        [FromQuery] ReportFilterDto filter)
    {
        var result = await service.GetReportedByAsync(filter, User.GetUserId());

        return Ok(result);
    }

    [HttpGet]
    [AuthorizeProfile(EnumProfileType.Administrator)]
    public async Task<ActionResult<PagedResultDto<ReadReportDto>>> GetAllAsync(
        [FromQuery] ReportFilterDto filter)
    {
        var result = await service.GetAllAsync(filter);

        return Ok(result);
    }

    [HttpGet("{id:guid}", Name = "GetReportById")]
    [AuthorizeProfile(EnumProfileType.Administrator)]
    public async Task<ActionResult<ReadReportDto>> GetByIdAsync(Guid id)
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

        return this.ServeStoredImage(environment, EnumStorageContainer.Report, storedImageName);
    }

    [HttpGet("{id:guid}/image/thumbnail")]
    [AuthorizeProfile(EnumProfileType.Operator)]
    public async Task<ActionResult> GetThumbnailAsync(Guid id)
    {
        string? storedImageName = await service.GetStoredImageNameAsync(id, User.GetUserId(), User.IsAdministrator());

        if (storedImageName is null)
            return NotFound();

        return this.ServeStoredImage(
            environment, EnumStorageContainer.Report, storedImageName, EnumStoredImageVariant.Thumbnail);
    }

    [HttpPatch("{id:guid}/status")]
    [AuthorizeProfile(EnumProfileType.Administrator)]
    public async Task<ActionResult<ReadReportDto>> UpdateStatusAsync(
        Guid id,
        [FromBody] UpdateReportStatusDto dto)
    {
        var result = await service.UpdateStatusAsync(id, dto);

        if (result is null)
            return NotFound();

        return Ok(result);
    }
}
