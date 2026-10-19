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
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Swashbuckle.AspNetCore.Annotations;

[ApiController]
[Route("[controller]")]
[Authorize]
[SwaggerTag("Reports of misconduct sent to the administrators, confidential or not, with an optional photo.")]
public class ReportsController(IReportService service, IWebHostEnvironment environment) : ControllerBase
{
    [HttpPost]
    [AuthorizeProfile(EnumProfileType.Operator)]
    [RequiresContact(EnumPublication.IdentifiedReport)]
    [SwaggerOperation(
        OperationId = "CreateReport",
        Summary = "Send a report",
        Description = "Sends a report with an optional photo. An identified report from a user without phone " +
            "and contact e-mail answers 403 with the code `ContactRequired`; a confidential one goes " +
            "through.")]
    [ProducesResponseType(typeof(ReadReportDto), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status403Forbidden)]
    public async Task<ActionResult<ReadReportDto>> CreateAsync([FromForm] CreateReportDto dto)
    {
        var result = await service.CreateAsync(dto, User.GetUserId());

        return CreatedAtRoute("GetReportById", new { id = result.Id }, result);
    }

    [HttpGet("mine")]
    [AuthorizeProfile(EnumProfileType.Operator)]
    [SwaggerOperation(
        OperationId = "ListMyReports",
        Summary = "List my reports",
        Description = "Returns a page of the reports sent by the signed-in user, matching the optional filters.")]
    public async Task<ActionResult<PagedResultDto<ReadReportDto>>> GetMineAsync(
        [FromQuery] ReportFilterDto filter)
    {
        var result = await service.GetReportedByAsync(filter, User.GetUserId());

        return Ok(result);
    }

    [HttpGet]
    [AuthorizeProfile(EnumProfileType.Administrator)]
    [SwaggerOperation(
        OperationId = "ListReports",
        Summary = "List all reports",
        Description = "Returns a page of every report, matching the optional filters. Administrators only.")]
    public async Task<ActionResult<PagedResultDto<ReadReportDto>>> GetAllAsync(
        [FromQuery] ReportFilterDto filter)
    {
        var result = await service.GetAllAsync(filter);

        return Ok(result);
    }

    [HttpGet("{id:guid}", Name = "GetReportById")]
    [AuthorizeProfile(EnumProfileType.Administrator)]
    [SwaggerOperation(
        OperationId = "GetReportById",
        Summary = "Get a report by ID",
        Description = "Returns a report by its ID. Administrators only.")]
    [ProducesResponseType(typeof(ReadReportDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ReadReportDto>> GetByIdAsync([SwaggerParameter("Report ID.")] Guid id)
    {
        var result = await service.GetByIdAsync(id);

        if (result is null)
            return NotFound();

        return Ok(result);
    }

    [HttpGet("{id:guid}/image")]
    [AuthorizeProfile(EnumProfileType.Operator)]
    [SwaggerOperation(
        OperationId = "GetReportImage",
        Summary = "Get the photo of a report",
        Description = "Returns the photo sent with the report, to the user who sent it and to administrators. A " +
            "report without a photo answers 404.")]
    [ProducesResponseType(typeof(FileResult), StatusCodes.Status200OK, "image/jpeg", "image/png", "image/webp")]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<ActionResult> GetImageAsync([SwaggerParameter("Report ID.")] Guid id)
    {
        string? storedImageName = await service.GetStoredImageNameAsync(id, User.GetUserId(), User.IsAdministrator());

        if (storedImageName is null)
            return NotFound();

        return this.ServeStoredImage(environment, EnumStorageContainer.Report, storedImageName);
    }

    [HttpGet("{id:guid}/image/thumbnail")]
    [AuthorizeProfile(EnumProfileType.Operator)]
    [SwaggerOperation(
        OperationId = "GetReportThumbnail",
        Summary = "Get the thumbnail of a report photo",
        Description = "Returns the reduced version of the report photo, under the same rules as the photo.")]
    [ProducesResponseType(typeof(FileResult), StatusCodes.Status200OK, "image/jpeg", "image/png", "image/webp")]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<ActionResult> GetThumbnailAsync([SwaggerParameter("Report ID.")] Guid id)
    {
        string? storedImageName = await service.GetStoredImageNameAsync(id, User.GetUserId(), User.IsAdministrator());

        if (storedImageName is null)
            return NotFound();

        return this.ServeStoredImage(
            environment, EnumStorageContainer.Report, storedImageName, EnumStoredImageVariant.Thumbnail);
    }

    [HttpPatch("{id:guid}/status")]
    [AuthorizeProfile(EnumProfileType.Administrator)]
    [SwaggerOperation(
        OperationId = "UpdateReportStatus",
        Summary = "Change the status of a report",
        Description = "Moves the report to another status. Administrators only.")]
    [ProducesResponseType(typeof(ReadReportDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ReadReportDto>> UpdateStatusAsync(
        [SwaggerParameter("Report ID.")] Guid id,
        [FromBody] UpdateReportStatusDto dto)
    {
        var result = await service.UpdateStatusAsync(id, dto);

        if (result is null)
            return NotFound();

        return Ok(result);
    }
}
