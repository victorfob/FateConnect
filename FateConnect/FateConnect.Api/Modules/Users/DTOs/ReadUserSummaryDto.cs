namespace FateConnect.Api.Modules.Users.DTOs;

using FateConnect.Api.Modules.Users.Enums;
using Swashbuckle.AspNetCore.Annotations;

public record ReadUserSummaryDto(
    [property: SwaggerSchema("User ID.")]
    int Id,
    [property: SwaggerSchema("Full name.")]
    string FullName,
    [property: SwaggerSchema("Contact e-mail, when registered.")]
    string? ContactEmail,
    [property: SwaggerSchema("Contact phone with area code, digits only, when registered.")]
    string? Phone,
    [property: SwaggerSchema("Address of the profile photo, when there is one.")]
    string? ImageUrl,
    [property: SwaggerSchema("Address of the profile photo thumbnail, when there is one.")]
    string? ThumbnailUrl,
    [property: SwaggerSchema("Status of the account.")]
    EnumAccountStatus Status
);
