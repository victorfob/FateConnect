namespace FateConnect.Api.Modules.Rides.DTOs;

using System.ComponentModel.DataAnnotations;
using Swashbuckle.AspNetCore.Annotations;

public record HolidaysQueryDto
{
    [Required(ErrorMessage = "The year is required.")]
    [Range(1583, 9999, ErrorMessage = "The year must be between 1583 and 9999.")]
    [SwaggerParameter("Year of the holidays.")]
    public int? Year { get; init; }
}
