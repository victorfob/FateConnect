namespace FateConnect.Api.Modules.Users.DTOs;

using FateConnect.Api.Modules.Users.Enums;
using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

public class ChangeUserProfileDto
{
    [Required]
    [JsonRequired]
    [EnumDataType(typeof(EnumProfileType), ErrorMessage = "Tipo de perfil de acesso inválido")]
    public EnumProfileType ProfileType { get; set; }
}
