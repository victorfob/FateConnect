namespace FateConnect.Api.Modules.Rides.DTOs;

using System.ComponentModel.DataAnnotations;
using FateConnect.Api.Modules.Rides.Enums;

public record FilterRideDto
{
    public DateOnly? DepartureDate { get; init; }

    public TimeOnly? DepartureTime { get; init; }

    [StringLength(100, ErrorMessage = "Destination filter cannot exceed 100 characters.")]
    public string? Destination { get; init; }

    [EnumDataType(typeof(RideType), ErrorMessage = "Invalid ride type.")]
    public RideType? RideType { get; init; }

    public void Deconstruct(
        out DateOnly? departureDate,
        out TimeOnly? departureTime,
        out string? destination,
        out RideType? rideType)
    {
        departureDate = DepartureDate;
        departureTime = DepartureTime;
        destination = Destination;
        rideType = RideType;
    }
}
