namespace FateConnect.Api.Modules.Auth.DTOs;

using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using FateConnect.Api.Infrastructure.Validation;

public class EmailRequestDto
{
    [Required(ErrorMessage = "O e-mail institucional é obrigatório.")]
    [EmailAddress(ErrorMessage = "O formato do e-mail é inválido.")]
    [FatecEmail]
    [MaxLength(150)]
    [DefaultValue("joao.silva999@aluno.cps.sp.gov.br")]
    public string FatecEmail { get; set; } = string.Empty;
}
