namespace FateConnect.Api.Modules.Rides.DTOs;

using System.ComponentModel.DataAnnotations;
using FateConnect.Api.Modules.Rides.Enums;

public record FilterRideDto
{
    public string? Destination { get; init; }
    public DateOnly? DepartureDate { get; init; }
    public TimeOnly? DepartureTime { get; init; }

    [EnumDataType(typeof(EnumRideType), ErrorMessage = "Invalid ride type.")]
    public EnumRideType? RideType { get; init; }
}
