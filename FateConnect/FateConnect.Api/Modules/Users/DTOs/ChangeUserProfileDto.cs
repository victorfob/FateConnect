namespace FateConnect.Api.Modules.Users.DTOs;

using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;
using FateConnect.Api.Modules.Users.Enums;

public class ChangeUserProfileDto
{
    [Required]
    [JsonRequired]
    [EnumDataType(typeof(EnumProfileType), ErrorMessage = "Tipo de perfil de acesso inválido")]
    public EnumProfileType ProfileType { get; set; }
}
