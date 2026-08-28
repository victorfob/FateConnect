namespace FateConnect.Api.Modules.Rides.DTOs;

using System.ComponentModel.DataAnnotations;
using FateConnect.Api.Modules.Rides.Enums;

public record UpdateRideDto
{
    [Range(1, 7, ErrorMessage = "The ride must have between 1 and 7 seats.")]
    public int? AvailableSeats { get; init; }

    [StringLength(100, MinimumLength = 3, ErrorMessage = "The destination must be between 3 and 100 characters.")]
    public string? Destination { get; init; }

    public DateOnly? DepartureDate { get; init; }

    public TimeOnly? DepartureTime { get; init; }

    [EnumDataType(typeof(EnumRideType), ErrorMessage = "Invalid ride type.")]
    public EnumRideType? RideType { get; init; }

    [StringLength(300, ErrorMessage = "The description cannot exceed 300 characters.")]
    public string? Description { get; init; }
}
