namespace FateConnect.Api.Modules.LostAndFound.DTOs;

using System.ComponentModel.DataAnnotations;
using FateConnect.Api.Infrastructure.OpenApi;
using FateConnect.Api.Infrastructure.Validation;
using FateConnect.Api.Modules.LostAndFound.Enums;
using Microsoft.AspNetCore.Http;
using Swashbuckle.AspNetCore.Annotations;

public record CreateLostAndFoundDto
{
    [StringLength(100, MinimumLength = 3, ErrorMessage = "The item name must have between 3 and 100 characters.")]
    [SwaggerSchema("Name of the item.")]
    [SchemaExample("Blue thermal bottle")]
    public required string Name { get; init; }

    [Required(ErrorMessage = "Tell whether the item was lost or found.")]
    [SwaggerSchema("Whether the item was lost or found.")]
    [SchemaExample("Found")]
    public EnumLostAndFoundType? LostAndFoundType { get; init; }

    [StringLength(100, MinimumLength = 3, ErrorMessage = "The place must have between 3 and 100 characters.")]
    [SwaggerSchema("Where it was lost or found.")]
    [SchemaExample("Library, second floor")]
    public required string Place { get; init; }

    [Required(ErrorMessage = "The date it happened is required.")]
    [SwaggerSchema("Day it was lost or found.")]
    [SchemaExample("2026-10-10")]
    public DateOnly? OccurredOn { get; init; }

    [StringLength(300, ErrorMessage = "The description must have at most 300 characters.")]
    [SwaggerSchema("Details that help recognize the item.")]
    [SchemaExample("With a Fatec sticker on the lid.")]
    public string? Description { get; init; }

    [ValidImage]
    [SwaggerSchema("Photo of the item: JPEG, PNG or WebP.")]
    public IFormFile? Image { get; init; }
}
