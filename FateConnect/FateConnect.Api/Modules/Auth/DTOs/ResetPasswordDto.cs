using System.ComponentModel.DataAnnotations;

namespace FateConnect.Api.Modules.Auth.DTOs;

public class ResetPasswordDto
{
    [Required(ErrorMessage = "O token de verificação é obrigatório.")]
    public string Token { get; set; } = string.Empty;

    [Required(ErrorMessage = "A nova senha é obrigatória.")]
    [MinLength(8, ErrorMessage = "A senha deve ter pelo menos 8 caracteres.")]
    public string NewPassword { get; set; } = string.Empty;
}
