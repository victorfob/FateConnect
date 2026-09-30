namespace FateConnect.Api.Modules.Rides.DTOs;

using System.ComponentModel.DataAnnotations;

public record HolidaysQueryDto
{
    [Required(ErrorMessage = "Informe o ano.")]
    [Range(1583, 9999, ErrorMessage = "O ano deve estar entre 1583 e 9999.")]
    public int? Year { get; init; }
}
