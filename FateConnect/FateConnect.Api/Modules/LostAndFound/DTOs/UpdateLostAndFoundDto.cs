namespace FateConnect.Api.Modules.LostAndFound.DTOs;

using FateConnect.Api.Infrastructure.Validation;
using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Http;
using FateConnect.Api.Modules.LostAndFound.Enums;

public record UpdateLostAndFoundDto
{
    [StringLength(100, MinimumLength = 3, ErrorMessage = "O nome do item deve ter entre 3 e 100 caracteres.")]
    public string? Name { get; init; }

    public EnumLostAndFoundType? LostAndFoundType { get; init; }

    [StringLength(100, MinimumLength = 3, ErrorMessage = "O local deve ter entre 3 e 100 caracteres.")]
    public string? Place { get; init; }

    public DateOnly? OccurredOn { get; init; }

    [DisplayFormat(ConvertEmptyStringToNull = false)]
    [StringLength(300, ErrorMessage = "A descrição deve ter no máximo 300 caracteres.")]
    public string? Description { get; init; }

    public EnumStatusLostAndFound? Status { get; init; }

    [ValidImage]
    public IFormFile? Image { get; init; }

    public bool? RemoveImage { get; init; }
}
