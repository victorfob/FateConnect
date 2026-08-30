using System.ComponentModel;
using System.ComponentModel.DataAnnotations;

namespace FateConnect.Api.Modules.Common.DTOs;

public class ErrorResponseDto
{
    [Required]
    [DefaultValue("O e-mail informado já está em uso no sistema.")]
    public string Error { get; set; } = string.Empty;
}
