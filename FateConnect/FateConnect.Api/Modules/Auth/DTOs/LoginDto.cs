namespace FateConnect.Api.Modules.Auth.DTOs;

using System.ComponentModel.DataAnnotations;
using FateConnect.Api.Infrastructure.OpenApi;
using FateConnect.Api.Infrastructure.Validation;
using Swashbuckle.AspNetCore.Annotations;

public class LoginDto
{
    [Required(ErrorMessage = "Informe o e-mail")]
    [EmailAddress(ErrorMessage = "E-mail inválido")]
    [FatecEmail]
    [SwaggerSchema("Institutional e-mail of the account.")]
    [SchemaExample("joao.silva999@aluno.cps.sp.gov.br")]
    public string FatecEmail { get; set; } = string.Empty;

    [Required(ErrorMessage = "Informe a senha")]
    [SwaggerSchema("Password of the account.")]
    [SchemaExample("StrongPassword123!")]
    public string Password { get; set; } = string.Empty;
}
