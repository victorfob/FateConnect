namespace FateConnect.Api.Modules.LostAndFound.DTOs;

using FateConnect.Api.Modules.Common.DTOs;
using FateConnect.Api.Modules.LostAndFound.Enums;
using Swashbuckle.AspNetCore.Annotations;

public record ReadLostAndFoundDto(
    [property: SwaggerSchema("Item ID.")]
    Guid Id,
    [property: SwaggerSchema("Name of the item.")]
    string Name,
    [property: SwaggerSchema("Whether the item was lost or found.")]
    EnumLostAndFoundType LostAndFoundType,
    [property: SwaggerSchema("Where it was lost or found.")]
    string Place,
    [property: SwaggerSchema("Day it was lost or found.")]
    DateOnly OccurredOn,
    [property: SwaggerSchema("Details given by who registered it, when any.")]
    string? Description,
    [property: SwaggerSchema("Address of the photo, when there is one.")]
    string? ImageUrl,
    [property: SwaggerSchema("Address of the photo thumbnail, when there is one.")]
    string? ThumbnailUrl,
    [property: SwaggerSchema("Contact of who registered the item.")]
    UserContactDto Contact,
    [property: SwaggerSchema("Whether the signed-in user registered the item.")]
    bool IsOwner,
    [property: SwaggerSchema("Status of the item.")]
    EnumLostAndFoundStatus Status,
    [property: SwaggerSchema("Why the item was deleted: by who registered it or for inactivity. Only when deleted.")]
    EnumDeletionReason? DeletionReason,
    [property: SwaggerSchema("When the item was registered, in UTC.")]
    DateTime CreatedAt
);
