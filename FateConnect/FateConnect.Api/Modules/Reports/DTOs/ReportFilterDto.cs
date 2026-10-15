namespace FateConnect.Api.Modules.Reports.DTOs;

using FateConnect.Api.Modules.Common.DTOs;
using FateConnect.Api.Modules.Reports.Enums;
using Swashbuckle.AspNetCore.Annotations;

public record ReportFilterDto : DateRangeFilterDto
{
    [SwaggerParameter("Text searched in the description, ignoring case and accents.")]
    public string? SearchTerm { get; init; }
    [SwaggerParameter("Only reports of this category.")]
    public EnumReportCategory? Category { get; init; }
    [SwaggerParameter("Only reports in this status.")]
    public EnumReportStatus? Status { get; init; }
}
