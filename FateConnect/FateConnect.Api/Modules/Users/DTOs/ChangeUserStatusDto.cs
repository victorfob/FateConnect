namespace FateConnect.Api.Modules.Users.DTOs;

using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;
using FateConnect.Api.Infrastructure.OpenApi;
using FateConnect.Api.Modules.Users.Enums;
using Swashbuckle.AspNetCore.Annotations;

public class ChangeUserStatusDto
{
    [Required]
    [JsonRequired]
    [EnumDataType(typeof(EnumAccountStatus), ErrorMessage = "Invalid account status.")]
    [SwaggerSchema("`Banned` bans the account and `Active` lifts a ban; any other value answers 400.")]
    [SchemaExample("Banned")]
    public EnumAccountStatus Status { get; set; }
}
