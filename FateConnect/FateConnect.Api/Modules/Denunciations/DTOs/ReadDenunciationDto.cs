namespace FateConnect.Api.Modules.Denunciations.DTOs;

using FateConnect.Api.Modules.Denunciations.Enums;
using FateConnect.Api.Modules.Common.DTOs;

public record ReadDenunciationDto(
    Guid Id,
    EnumDenunciationCategory Category,
    string Description,
    string? ImageUrl,
    EnumDenunciationStatus Status,
    UserContactDto? User,
    DateTime CreatedAt
);
