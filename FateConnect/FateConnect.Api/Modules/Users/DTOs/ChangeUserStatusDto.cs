namespace FateConnect.Api.Modules.Users.DTOs;

using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;
using FateConnect.Api.Modules.Users.Enums;

public class ChangeUserStatusDto
{
    [Required]
    [JsonRequired]
    [EnumDataType(typeof(EnumAccountStatus), ErrorMessage = "Status da conta inválido")]
    public EnumAccountStatus Status { get; set; }
}
