namespace FateConnect.Api.Modules.Users.DTOs;

using System.ComponentModel.DataAnnotations;
using FateConnect.Api.Infrastructure.OpenApi;
using Swashbuckle.AspNetCore.Annotations;

public class ChangePasswordDto
{
    [Required(ErrorMessage = "Informe a senha atual")]
    [SwaggerSchema("Current password.")]
    [SchemaExample("StrongPassword123!")]
    public string CurrentPassword { get; set; } = string.Empty;

    [Required(ErrorMessage = "Informe a nova senha")]
    [MinLength(8, ErrorMessage = "Mínimo de 8 caracteres")]
    [SwaggerSchema("New password.")]
    [SchemaExample("NewPassword456!")]
    public string NewPassword { get; set; } = string.Empty;
}
