namespace FateConnect.Api.Modules.Auth.DTOs;

using System.ComponentModel.DataAnnotations;
using FateConnect.Api.Infrastructure.OpenApi;
using Swashbuckle.AspNetCore.Annotations;

public class ResetPasswordDto
{
    [Required(ErrorMessage = "O token de verificação é obrigatório.")]
    [SwaggerSchema("Token received in the password reset link.")]
    [SchemaExample("4f8c2e7a9b1d4c6f8a0e2b4d6c8f1a3e")]
    public string Token { get; set; } = string.Empty;

    [Required(ErrorMessage = "A nova senha é obrigatória.")]
    [MinLength(8, ErrorMessage = "A senha deve ter pelo menos 8 caracteres.")]
    [SwaggerSchema("New password.")]
    [SchemaExample("NewPassword456!")]
    public string NewPassword { get; set; } = string.Empty;
}
