namespace FateConnect.Api.Modules.Reports.DTOs;

using FateConnect.Api.Modules.Common.DTOs;
using FateConnect.Api.Modules.Reports.Enums;

public record ReadReportDto(
    Guid Id,
    EnumReportCategory Category,
    string Description,
    string? ImageUrl,
    string? ThumbnailUrl,
    bool HasImage,
    EnumReportStatus Status,
    UserContactDto? User,
    bool IsAnonymous,
    DateTime CreatedAt
);
