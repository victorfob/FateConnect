namespace FateConnect.Api.Modules.Users.DTOs;

using System.ComponentModel.DataAnnotations;
using FateConnect.Api.Infrastructure.OpenApi;
using Swashbuckle.AspNetCore.Annotations;

public class ChangePasswordDto
{
    [Required(ErrorMessage = "The current password is required.")]
    [SwaggerSchema("Current password.")]
    [SchemaExample("StrongPassword123!")]
    public string CurrentPassword { get; set; } = string.Empty;

    [Required(ErrorMessage = "The new password is required.")]
    [MinLength(8, ErrorMessage = "The password must have at least 8 characters.")]
    [SwaggerSchema("New password.")]
    [SchemaExample("NewPassword456!")]
    public string NewPassword { get; set; } = string.Empty;
}
