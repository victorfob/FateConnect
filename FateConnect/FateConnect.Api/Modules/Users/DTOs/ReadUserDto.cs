namespace FateConnect.Api.Modules.Users.DTOs;

using FateConnect.Api.Modules.Users.Enums;
using System;

public record ReadUserDto(
    int Id,
    string FatecEmail,
    string FullName,
    DateTime BirthDate,
    EnumGender Gender,
    string Phone,
    string ContactEmail,
    string? Neighborhood,
    string? ImageUrl,
    EnumProfileType ProfileType,
    EnumAccountStatus Status,
    DateTime CreatedAt
);


