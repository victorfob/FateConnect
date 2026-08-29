namespace FateConnect.Api.Modules.Rides.DTOs;

using System.ComponentModel.DataAnnotations;
using FateConnect.Api.Modules.Rides.Enums;

public record CreateRideDto
{
    public required int AvailableSeats { get; init; }

    [StringLength(100)]
    public required string Destination { get; init; }

    public required DateOnly DepartureDate { get; init; }

    public required TimeOnly DepartureTime { get; init; }

    public required EnumRideType RideType { get; init; }

    [StringLength(300)]
    public string? Description { get; init; }
}
