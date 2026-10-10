namespace FateConnect.Api.Modules.Auth.DTOs;

using System.ComponentModel.DataAnnotations;

public record ConfirmEmailDto(
    [Required(ErrorMessage = "O token de confirmação é obrigatório.")]
    string Token
);
