namespace FateConnect.Api.Modules.Users.DTOs;

using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;
using FateConnect.Api.Infrastructure.OpenApi;
using FateConnect.Api.Modules.Users.Enums;
using Swashbuckle.AspNetCore.Annotations;

public class ChangeUserProfileDto
{
    [Required]
    [JsonRequired]
    [EnumDataType(typeof(EnumProfileType), ErrorMessage = "Invalid access profile.")]
    [SwaggerSchema("Profile to give the user.")]
    [SchemaExample("Administrator")]
    public EnumProfileType ProfileType { get; set; }
}
