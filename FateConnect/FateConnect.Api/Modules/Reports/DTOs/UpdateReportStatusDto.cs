namespace FateConnect.Api.Modules.Reports.DTOs;

using System.ComponentModel.DataAnnotations;
using FateConnect.Api.Modules.Reports.Enums;

public record UpdateReportStatusDto
{
    [Required(ErrorMessage = "O novo status é obrigatório.")]
    public required EnumReportStatus Status { get; init; }
}
