namespace FateConnect.Api.Modules.LostAndFound.DTOs;

using FateConnect.Api.Modules.Common.DTOs;
using FateConnect.Api.Modules.LostAndFound.Enums;

public record ReadLostAndFoundDto(
    Guid Id,
    string Name,
    EnumLostAndFoundType LostAndFoundType,
    string Place,
    DateOnly OcurredOn,
    string? Description,
    string? ImageUrl,
    UserContactDto Contact,
    bool IsOwner,
    EnumStatusLostAndFound Status,
    DateTime CreatedAt
);
