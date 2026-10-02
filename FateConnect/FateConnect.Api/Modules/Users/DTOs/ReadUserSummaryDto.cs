namespace FateConnect.Api.Modules.Users.DTOs;

using FateConnect.Api.Modules.Users.Enums;

public record ReadUserSummaryDto(
    int Id,
    string FullName,
    string? ContactEmail,
    string? Phone,
    string? ThumbnailUrl,
    EnumAccountStatus Status
);
