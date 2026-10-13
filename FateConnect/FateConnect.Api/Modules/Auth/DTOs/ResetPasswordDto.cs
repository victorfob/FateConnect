namespace FateConnect.Api.Modules.Auth.DTOs;

using System.ComponentModel.DataAnnotations;
using FateConnect.Api.Infrastructure.OpenApi;
using Swashbuckle.AspNetCore.Annotations;

public class ResetPasswordDto
{
    [Required(ErrorMessage = "The verification token is required.")]
    [SwaggerSchema("Token received in the password reset link.")]
    [SchemaExample("4f8c2e7a9b1d4c6f8a0e2b4d6c8f1a3e")]
    public string Token { get; set; } = string.Empty;

    [Required(ErrorMessage = "The new password is required.")]
    [MinLength(8, ErrorMessage = "The password must have at least 8 characters.")]
    [SwaggerSchema("New password.")]
    [SchemaExample("NewPassword456!")]
    public string NewPassword { get; set; } = string.Empty;
}
