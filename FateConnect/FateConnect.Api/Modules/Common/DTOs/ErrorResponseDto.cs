namespace FateConnect.Api.Modules.Common.DTOs;

using System.ComponentModel;
using System.ComponentModel.DataAnnotations;

public class ErrorResponseDto
{
    [Required]
    [DefaultValue("O e-mail informado já está em uso no sistema.")]
    public string Error { get; set; } = string.Empty;

    [DefaultValue("fatecEmail")]
    public string? Field { get; set; }

    [DefaultValue(null)]
    public string? Code { get; set; }

    public int? MinutesRemaining { get; set; }
}
