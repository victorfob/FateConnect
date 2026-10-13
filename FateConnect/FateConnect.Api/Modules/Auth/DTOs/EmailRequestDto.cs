namespace FateConnect.Api.Modules.Auth.DTOs;

using System.ComponentModel.DataAnnotations;
using FateConnect.Api.Infrastructure.OpenApi;
using FateConnect.Api.Infrastructure.Validation;
using Swashbuckle.AspNetCore.Annotations;

public class EmailRequestDto
{
    [Required(ErrorMessage = "O e-mail institucional é obrigatório.")]
    [EmailAddress(ErrorMessage = "O formato do e-mail é inválido.")]
    [FatecEmail]
    [MaxLength(150)]
    [SwaggerSchema("Institutional e-mail of the account.")]
    [SchemaExample("joao.silva999@aluno.cps.sp.gov.br")]
    public string FatecEmail { get; set; } = string.Empty;
}
