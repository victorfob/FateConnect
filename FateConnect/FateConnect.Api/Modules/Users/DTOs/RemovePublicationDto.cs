namespace FateConnect.Api.Modules.Users.DTOs;

using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;
using FateConnect.Api.Infrastructure.OpenApi;
using FateConnect.Api.Modules.Users.Enums;
using Swashbuckle.AspNetCore.Annotations;

public class RemovePublicationDto
{
    [Required]
    [JsonRequired]
    [EnumDataType(typeof(EnumRemovalReason), ErrorMessage = "Invalid removal reason.")]
    [SwaggerSchema("The rule of the terms of use the publication broke, sent to its author in the notification.")]
    [SchemaExample("Commercial")]
    public EnumRemovalReason Reason { get; set; }
}
