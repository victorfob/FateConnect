namespace FateConnect.Api.Modules.Denunciations.DTOs;

using System.ComponentModel.DataAnnotations;
using FateConnect.Api.Modules.Common.Validators;
using FateConnect.Api.Modules.Denunciations.Enums;
using Microsoft.AspNetCore.Http;

public record CreateDenunciationDto
{
    [Required(ErrorMessage = "A categoria da denúncia é obrigatória.")]
    public required EnumDenunciationCategory Category { get; init; }

    private readonly string _description = string.Empty;

    [StringLength(500, MinimumLength = 10, ErrorMessage = "A descrição deve ter entre 10 e 500 caracteres.")]
    public required string Description
    {
        get => _description;
        init => _description = value?.Trim() ?? string.Empty;
    }

    public required bool IsAnonymous { get; init; }

    [ValidImage]
    public IFormFile? Image { get; init; }
}
