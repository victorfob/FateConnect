namespace FateConnect.Api.Modules.LostAndFound.DTOs;

using System.ComponentModel.DataAnnotations;
using FateConnect.Api.Infrastructure.OpenApi;
using FateConnect.Api.Infrastructure.Validation;
using FateConnect.Api.Modules.LostAndFound.Enums;
using Microsoft.AspNetCore.Http;
using Swashbuckle.AspNetCore.Annotations;

public record CreateLostAndFoundDto
{
    [StringLength(100, MinimumLength = 3, ErrorMessage = "O nome do item deve ter entre 3 e 100 caracteres.")]
    [SwaggerSchema("Name of the item.")]
    [SchemaExample("Blue thermal bottle")]
    public required string Name { get; init; }

    [Required(ErrorMessage = "Informe se o item foi perdido ou achado.")]
    [SwaggerSchema("Whether the item was lost or found.")]
    [SchemaExample("Found")]
    public EnumLostAndFoundType? LostAndFoundType { get; init; }

    [StringLength(100, MinimumLength = 3, ErrorMessage = "O local deve ter entre 3 e 100 caracteres.")]
    [SwaggerSchema("Where it was lost or found.")]
    [SchemaExample("Library, second floor")]
    public required string Place { get; init; }

    [Required(ErrorMessage = "Informe a data do ocorrido.")]
    [SwaggerSchema("Day it was lost or found.")]
    [SchemaExample("2026-10-10")]
    public DateOnly? OccurredOn { get; init; }

    [StringLength(300, ErrorMessage = "A descrição deve ter no máximo 300 caracteres.")]
    [SwaggerSchema("Details that help recognize the item.")]
    [SchemaExample("With a Fatec sticker on the lid.")]
    public string? Description { get; init; }

    [ValidImage]
    [SwaggerSchema("Photo of the item: JPEG, PNG or WebP.")]
    public IFormFile? Image { get; init; }
}
