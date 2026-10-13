namespace FateConnect.Api.Modules.Auth.DTOs;

using System.ComponentModel.DataAnnotations;
using FateConnect.Api.Infrastructure.OpenApi;
using FateConnect.Api.Infrastructure.Validation;
using Swashbuckle.AspNetCore.Annotations;

public class EmailRequestDto
{
    [Required(ErrorMessage = "The institutional e-mail is required.")]
    [EmailAddress(ErrorMessage = "Invalid e-mail format.")]
    [FatecEmail]
    [MaxLength(150)]
    [SwaggerSchema("Institutional e-mail of the account.")]
    [SchemaExample("joao.silva999@aluno.cps.sp.gov.br")]
    public string FatecEmail { get; set; } = string.Empty;
}
