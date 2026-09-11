namespace FateConnect.Api.Modules.Denunciations.DTOs;

using System.ComponentModel.DataAnnotations;
using FateConnect.Api.Modules.Denunciations.Enums;

public record UpdateDenunciationStatusDto
{
    [Required(ErrorMessage = "O novo status é obrigatório.")]
    public required EnumDenunciationStatus Status { get; init; }
}
