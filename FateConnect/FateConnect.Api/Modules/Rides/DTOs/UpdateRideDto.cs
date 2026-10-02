namespace FateConnect.Api.Modules.Rides.DTOs;

using System.ComponentModel.DataAnnotations;
using FateConnect.Api.Modules.Rides.Enums;

public record UpdateRideDto
{
    [StringLength(100)]
    public string? Destination { get; init; }

    public DateOnly? DepartureDate { get; init; }

    public TimeOnly? DepartureTime { get; init; }

    public EnumRideType? RideType { get; init; }

    public required EnumVehicleType VehicleType { get; init; }

    [StringLength(300)]
    public string? Description { get; init; }

    public EnumRideFrequency? Frequency { get; init; }

    public DateOnly? RepeatUntil { get; init; }
}
