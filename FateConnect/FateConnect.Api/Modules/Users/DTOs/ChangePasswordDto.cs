namespace FateConnect.Api.Modules.Users.DTOs;

using System.ComponentModel.DataAnnotations;

public class ChangePasswordDto
{
    [Required(ErrorMessage = "Informe a senha atual")]
    public string CurrentPassword { get; set; } = string.Empty;

    [Required(ErrorMessage = "Informe a nova senha")]
    [MinLength(8, ErrorMessage = "Mínimo de 8 caracteres")]
    public string NewPassword { get; set; } = string.Empty;
}
