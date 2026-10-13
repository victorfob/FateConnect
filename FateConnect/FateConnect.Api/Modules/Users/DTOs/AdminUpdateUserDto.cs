namespace FateConnect.Api.Modules.Users.DTOs;

using System.ComponentModel.DataAnnotations;
using FateConnect.Api.Infrastructure.OpenApi;
using FateConnect.Api.Infrastructure.Validation;
using Swashbuckle.AspNetCore.Annotations;

public class AdminUpdateUserDto
{
    [MaxLength(200)]
    [SwaggerSchema("Full name.")]
    [SchemaExample("João da Silva Santos")]
    public string? FullName { get; set; }

    [EmailAddress(ErrorMessage = "E-mail inválido")]
    [FatecEmail]
    [MaxLength(150)]
    [SwaggerSchema("Institutional e-mail, `@cps.sp.gov.br` or `@aluno.cps.sp.gov.br`.")]
    [SchemaExample("joao.silva999@aluno.cps.sp.gov.br")]
    public string? FatecEmail { get; set; }

    [MaxLength(11)]
    [SwaggerSchema("Contact phone with area code, digits only; saved together with the contact e-mail.")]
    [SchemaExample("15999990000")]
    public string? Phone { get; set; }

    [EmailAddress(ErrorMessage = "E-mail inválido")]
    [MaxLength(150)]
    [SwaggerSchema("Contact e-mail; saved together with the phone.")]
    [SchemaExample("joao.silva@gmail.com")]
    public string? ContactEmail { get; set; }
}
