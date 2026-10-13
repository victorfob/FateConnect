namespace FateConnect.Api.Modules.LostAndFound.DTOs;

using System.ComponentModel.DataAnnotations;
using FateConnect.Api.Infrastructure.Validation;
using FateConnect.Api.Modules.LostAndFound.Enums;
using Microsoft.AspNetCore.Http;

public record CreateLostAndFoundDto
{
    [StringLength(100, MinimumLength = 3, ErrorMessage = "O nome do item deve ter entre 3 e 100 caracteres.")]
    public required string Name { get; init; }

    [Required(ErrorMessage = "Informe se o item foi perdido ou achado.")]
    public EnumLostAndFoundType? LostAndFoundType { get; init; }

    [StringLength(100, MinimumLength = 3, ErrorMessage = "O local deve ter entre 3 e 100 caracteres.")]
    public required string Place { get; init; }

    [Required(ErrorMessage = "Informe a data do ocorrido.")]
    public DateOnly? OccurredOn { get; init; }

    [StringLength(300, ErrorMessage = "A descrição deve ter no máximo 300 caracteres.")]
    public string? Description { get; init; }

    [ValidImage]
    public IFormFile? Image { get; init; }
}
