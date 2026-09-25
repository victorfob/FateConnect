namespace FateConnect.Api.Modules.Denunciations.DTOs;

using FateConnect.Api.Modules.Denunciations.Enums;
using FateConnect.Api.Modules.Common.DTOs;

public record ReadDenunciationDto(
    Guid Id,
    EnumDenunciationCategory Category,
    string Description,
    string? ImageUrl,
    string? ThumbnailUrl,
    bool HasImage,
    EnumDenunciationStatus Status,
    UserContactDto? User,
    bool IsAnonymous,
    DateTime CreatedAt
);
