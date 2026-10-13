namespace FateConnect.Api.Modules.Reports.DTOs;

using FateConnect.Api.Modules.Common.DTOs;
using FateConnect.Api.Modules.Reports.Enums;

public record ReportFilterDto : DateRangeFilterDto
{
    public string? SearchTerm { get; init; }
    public EnumReportCategory? Category { get; init; }
    public EnumReportStatus? Status { get; init; }
}
