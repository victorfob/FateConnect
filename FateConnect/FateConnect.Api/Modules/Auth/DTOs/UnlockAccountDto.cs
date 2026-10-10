namespace FateConnect.Api.Modules.Auth.DTOs;

using System.ComponentModel.DataAnnotations;

public class UnlockAccountDto
{
    [Required(ErrorMessage = "O token de desbloqueio é obrigatório.")]
    public string Token { get; set; } = string.Empty;
}
