namespace FateConnect.Api.Modules.Reports.DTOs;

using FateConnect.Api.Modules.Common.DTOs;
using FateConnect.Api.Modules.Reports.Enums;
using Swashbuckle.AspNetCore.Annotations;

public record ReadReportDto(
    [property: SwaggerSchema("Report ID.")]
    Guid Id,
    [property: SwaggerSchema("What the report is about.")]
    EnumReportCategory Category,
    [property: SwaggerSchema("What happened.")]
    string Description,
    [property: SwaggerSchema("Address to fetch the photo through the API, when there is one.")]
    string? ImageUrl,
    [property: SwaggerSchema("Address to fetch the photo thumbnail through the API, when there is one.")]
    string? ThumbnailUrl,
    [property: SwaggerSchema("Whether the report has a photo.")]
    bool HasImage,
    [property: SwaggerSchema("Status of the report.")]
    EnumReportStatus Status,
    [property: SwaggerSchema("Contact of who sent the report; absent when it is anonymous.")]
    UserContactDto? User,
    [property: SwaggerSchema("Whether who sent the report is hidden.")]
    bool IsAnonymous,
    [property: SwaggerSchema("When the report was sent, in UTC.")]
    DateTime CreatedAt
);
