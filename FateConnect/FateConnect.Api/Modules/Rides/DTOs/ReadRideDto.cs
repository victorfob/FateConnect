namespace FateConnect.Api.Modules.Rides.DTOs;

using FateConnect.Api.Modules.Rides.Enums;

public record ReadRideDto(
    Guid Id,
    int AvailableSeats,
    string Destination,
    DateOnly DepartureDate,
    TimeOnly DepartureTime,
    DateTime CreatedAt,
    EnumRideType RideType,
    string? Description
);
