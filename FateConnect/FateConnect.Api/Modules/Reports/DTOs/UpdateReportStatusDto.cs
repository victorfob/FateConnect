namespace FateConnect.Api.Modules.Reports.DTOs;

using System.ComponentModel.DataAnnotations;
using FateConnect.Api.Infrastructure.OpenApi;
using FateConnect.Api.Modules.Reports.Enums;
using Swashbuckle.AspNetCore.Annotations;

public record UpdateReportStatusDto
{
    [Required(ErrorMessage = "O novo status é obrigatório.")]
    [SwaggerSchema("New status of the report.")]
    [SchemaExample("InReview")]
    public required EnumReportStatus Status { get; init; }
}
