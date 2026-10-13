namespace FateConnect.Api.Modules.Auth.DTOs;

using System.ComponentModel.DataAnnotations;
using FateConnect.Api.Infrastructure.OpenApi;
using Swashbuckle.AspNetCore.Annotations;

public class UnlockAccountDto
{
    [Required(ErrorMessage = "O token de desbloqueio é obrigatório.")]
    [SwaggerSchema("Token received in the unlock link.")]
    [SchemaExample("4f8c2e7a9b1d4c6f8a0e2b4d6c8f1a3e")]
    public string Token { get; set; } = string.Empty;
}
