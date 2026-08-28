namespace FateConnect.Api.Modules.Rides.DTOs;

using System.ComponentModel.DataAnnotations;
using FateConnect.Api.Modules.Rides.Enums;

public record CreateRideDto
{
    [Required(ErrorMessage = "The number of available seats is required.")]
    [Range(1, 7, ErrorMessage = "The ride must have between 1 and 7 seats.")]
    public int AvailableSeats { get; init; }

    [Required(ErrorMessage = "The destination is required.")]
    [StringLength(100, MinimumLength = 3, ErrorMessage = "The destination must be between 3 and 100 characters.")]
    public required string Destination { get; init; }

    [Required(ErrorMessage = "The departure date is required.")]
    public DateOnly DepartureDate { get; init; }

    [Required(ErrorMessage = "The departure time is required.")]
    public TimeOnly DepartureTime { get; init; }

    [Required(ErrorMessage = "The ride type is required.")]
    [EnumDataType(typeof(RideType), ErrorMessage = "Invalid ride type.")]
    public RideType RideType { get; init; }

    [StringLength(300, ErrorMessage = "The description cannot exceed 300 characters.")]
    public string? Description { get; init; }
}
