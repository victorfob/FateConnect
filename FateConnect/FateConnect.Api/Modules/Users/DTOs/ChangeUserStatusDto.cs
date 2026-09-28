namespace FateConnect.Api.Modules.Users.DTOs;

using FateConnect.Api.Modules.Users.Enums;
using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

public class ChangeUserStatusDto
{
    [Required]
    [JsonRequired]
    [EnumDataType(typeof(EnumAccountStatus), ErrorMessage = "Status da conta inválido")]
    public EnumAccountStatus Status { get; set; }
}
