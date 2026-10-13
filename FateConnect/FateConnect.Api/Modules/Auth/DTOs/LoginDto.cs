namespace FateConnect.Api.Modules.Auth.DTOs;

using System.ComponentModel.DataAnnotations;
using FateConnect.Api.Infrastructure.OpenApi;
using FateConnect.Api.Infrastructure.Validation;
using Swashbuckle.AspNetCore.Annotations;

public class LoginDto
{
    [Required(ErrorMessage = "The e-mail is required.")]
    [EmailAddress(ErrorMessage = "Invalid e-mail.")]
    [FatecEmail]
    [SwaggerSchema("Institutional e-mail of the account.")]
    [SchemaExample("joao.silva999@aluno.cps.sp.gov.br")]
    public string FatecEmail { get; set; } = string.Empty;

    [Required(ErrorMessage = "The password is required.")]
    [SwaggerSchema("Password of the account.")]
    [SchemaExample("StrongPassword123!")]
    public string Password { get; set; } = string.Empty;
}
