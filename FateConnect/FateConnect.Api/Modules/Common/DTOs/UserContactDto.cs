namespace FateConnect.Api.Modules.Common.DTOs;

using Swashbuckle.AspNetCore.Annotations;

public record UserContactDto(
    [property: SwaggerSchema("Full name of the person.")]
    string Name,
    [property: SwaggerSchema("Contact e-mail, when registered.")]
    string? Email,
    [property: SwaggerSchema("Contact phone with area code, digits only, when registered.")]
    string? Phone,
    [property: SwaggerSchema("Address of the profile photo thumbnail, when there is one.")]
    string? ThumbnailUrl
);
