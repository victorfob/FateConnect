namespace FateConnect.Api.Modules.Rides.DTOs;

using FateConnect.Api.Modules.Common.DTOs;
using FateConnect.Api.Modules.Rides.Enums;

public record ReadRideDto(
    Guid Id,
    string Destination,
    DateOnly DepartureDate,
    TimeOnly DepartureTime,
    DateTime CreatedAt,
    EnumRideType RideType,
    EnumVehicleType VehicleType,
    string? Description,
    UserContactDto Driver,
    bool IsOwner,
    EnumRideFrequency Frequency,
    DateOnly? RepeatUntil
);
