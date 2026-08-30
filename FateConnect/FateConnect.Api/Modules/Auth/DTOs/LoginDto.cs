using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using FateConnect.Api.Modules.Common.Constants;

namespace FateConnect.Api.Modules.Auth.DTOs;

public class LoginDto
{
    [Required(ErrorMessage = "O email é obrigatório")]
    [EmailAddress(ErrorMessage = "Formato de email inválido")]
    [RegularExpression(RegexConstants.FatecEmailPattern, ErrorMessage = RegexConstants.FatecEmailErrorMessage)]
    [DefaultValue("joao.silva999@aluno.cps.sp.gov.br")]
    public string FatecEmail { get; set; } = string.Empty;

    [Required(ErrorMessage = "A senha é obrigatória")]
    [DefaultValue("PasswordForte123!")]
    public string Password { get; set; } = string.Empty;
}
