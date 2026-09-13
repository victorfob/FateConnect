using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using FateConnect.Api.Infrastructure.Validation;

namespace FateConnect.Api.Modules.Auth.DTOs;

public class LoginDto
{
    [Required(ErrorMessage = "Informe o e-mail")]
    [EmailAddress(ErrorMessage = "E-mail inválido")]
    [FatecEmail]
    [DefaultValue("joao.silva999@aluno.cps.sp.gov.br")]
    public string FatecEmail { get; set; } = string.Empty;

    [Required(ErrorMessage = "Informe a senha")]
    [DefaultValue("SenhaForte123!")]
    public string Password { get; set; } = string.Empty;
}
