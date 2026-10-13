namespace FateConnect.Api.Modules.LostAndFound.DTOs;

using System.ComponentModel.DataAnnotations;
using FateConnect.Api.Infrastructure.OpenApi;
using FateConnect.Api.Infrastructure.Validation;
using FateConnect.Api.Modules.LostAndFound.Enums;
using Microsoft.AspNetCore.Http;
using Swashbuckle.AspNetCore.Annotations;

public record UpdateLostAndFoundDto
{
    [StringLength(100, MinimumLength = 3, ErrorMessage = "The item name must have between 3 and 100 characters.")]
    [SwaggerSchema("New name of the item.")]
    [SchemaExample("Navy blue thermal bottle")]
    public string? Name { get; init; }

    [SwaggerSchema("Whether the item was lost or found.")]
    [SchemaExample("Found")]
    public EnumLostAndFoundType? LostAndFoundType { get; init; }

    [StringLength(100, MinimumLength = 3, ErrorMessage = "The place must have between 3 and 100 characters.")]
    [SwaggerSchema("Where it was lost or found.")]
    [SchemaExample("Library, ground floor")]
    public string? Place { get; init; }

    [SwaggerSchema("Day it was lost or found.")]
    [SchemaExample("2026-10-11")]
    public DateOnly? OccurredOn { get; init; }

    [DisplayFormat(ConvertEmptyStringToNull = false)]
    [StringLength(300, ErrorMessage = "The description must have at most 300 characters.")]
    [SwaggerSchema("Details that help recognize the item; an empty text clears them.")]
    [SchemaExample("Lid with a Fatec sticker.")]
    public string? Description { get; init; }

    [SwaggerSchema("New status of the item.")]
    [SchemaExample("Resolved")]
    public EnumLostAndFoundStatus? Status { get; init; }

    [ValidImage]
    [SwaggerSchema("New photo of the item. JPEG, PNG or WebP; it replaces the current one.")]
    public IFormFile? Image { get; init; }

    [SwaggerSchema("`true` drops the current photo when no new one is sent.")]
    [SchemaExample(false)]
    public bool? RemoveImage { get; init; }
}
