namespace FateConnect.Api.Modules.LostAndFound.DTOs;

using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Http;
using FateConnect.Api.Modules.LostAndFound.Enums;
using FateConnect.Api.Modules.Common.Validators;

public record CreateLostAndFoundDto
{
    [StringLength(100, MinimumLength = 3, ErrorMessage = "O nome do item deve ter entre 3 e 100 caracteres.")]
    public required string Name { get; init; }

    public required EnumLostAndFoundType LostAndFoundType { get; init; }

    [StringLength(100, MinimumLength = 3, ErrorMessage = "O local deve ter entre 3 e 100 caracteres.")]
    public required string Place { get; init; }

    public required DateOnly OcurredOn { get; init; }

    [StringLength(300, MinimumLength = 5, ErrorMessage = "A descrição deve ter entre 5 e 300 caracteres.")]
    public required string Description { get; init; }

    [ValidImage]
    public IFormFile? Image { get; init; }
}
