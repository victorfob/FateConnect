namespace FateConnect.Api.Modules.Users.DTOs;

using System;
using FateConnect.Api.Modules.Users.Enums;
using Swashbuckle.AspNetCore.Annotations;

public record ReadUserDto(
    [property: SwaggerSchema("User ID.")]
    int Id,
    [property: SwaggerSchema("Institutional e-mail.")]
    string FatecEmail,
    [property: SwaggerSchema("Full name.")]
    string FullName,
    [property: SwaggerSchema("Birth date.")]
    DateOnly BirthDate,
    [property: SwaggerSchema("Gender of the user.")]
    EnumGender Gender,
    [property: SwaggerSchema("Contact phone with area code, digits only, when registered.")]
    string? Phone,
    [property: SwaggerSchema("Contact e-mail, when registered.")]
    string? ContactEmail,
    [property: SwaggerSchema("Neighborhood and city, used to notify about rides going there, when registered.")]
    string? Neighborhood,
    [property: SwaggerSchema("Address of the profile photo, when there is one.")]
    string? ImageUrl,
    [property: SwaggerSchema("Address of the profile photo thumbnail, when there is one.")]
    string? ThumbnailUrl,
    [property: SwaggerSchema("Access profile.")]
    EnumProfileType ProfileType,
    [property: SwaggerSchema("Status of the account.")]
    EnumAccountStatus Status,
    [property: SwaggerSchema("When the account was created, in UTC.")]
    DateTime CreatedAt
);


