using FateConnect.Api.Modules.Rides.Enums;

namespace FateConnect.Api.Modules.Rides.DTOs;

public record ReadRideDto(
    Guid Id,
    int AvailableSeats,
    string Destination,
    DateOnly DepartureDate,
    TimeOnly DepartureTime,
    DateTime CreatedAt,
    EnumRideType RideType,
    string? Description,
    bool IsActive
);
