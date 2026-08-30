using System.ComponentModel;
using System.ComponentModel.DataAnnotations;

namespace FateConnect.Api.Modules.Users.DTOs;

public class UserResponseDto
{
    [Required]
    [DefaultValue(1)]
    public int Id { get; set; }

    [Required]
    [EmailAddress]
    [DefaultValue("joao.silva99@aluno.cps.sp.gov.br")]
    public string FatecEmail { get; set; } = string.Empty;

    [Required]
    [DefaultValue("João da Silva")]
    public string FullName { get; set; } = string.Empty;
}
