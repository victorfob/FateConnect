namespace FateConnect.Api.Modules.Users.DTOs;

using FateConnect.Api.Modules.Common.DTOs;
using FateConnect.Api.Modules.Users.Enums;
using System.ComponentModel.DataAnnotations;

public record UserFilterDto : PagedFilterDto
{
    public string? Search { get; init; }

    [EnumDataType(typeof(EnumAccountStatus), ErrorMessage = "Status da conta inválido")]
    public EnumAccountStatus? Status { get; init; }

    [EnumDataType(typeof(EnumProfileType), ErrorMessage = "Tipo de perfil de acesso inválido")]
    public EnumProfileType? ProfileType { get; init; }
}
