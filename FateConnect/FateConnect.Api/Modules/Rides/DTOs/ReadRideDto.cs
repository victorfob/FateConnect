namespace FateConnect.Api.Modules.Rides.DTOs;

using FateConnect.Api.Modules.Common.DTOs;
using FateConnect.Api.Modules.Rides.Enums;
using Swashbuckle.AspNetCore.Annotations;

public record ReadRideDto(
    [property: SwaggerSchema("Ride ID.")]
    Guid Id,
    [property: SwaggerSchema("Where the ride goes.")]
    string Destination,
    [property: SwaggerSchema("Day of the next departure.")]
    DateOnly DepartureDate,
    [property: SwaggerSchema("Departure time, in the time zone of São Paulo.")]
    TimeOnly DepartureTime,
    [property: SwaggerSchema("When the ride was offered, in UTC.")]
    DateTime CreatedAt,
    [property: SwaggerSchema("`Solidarity` is free, and in `Egalitarian` the passengers share the costs.")]
    EnumRideType RideType,
    [property: SwaggerSchema("Vehicle of the ride.")]
    EnumVehicleType VehicleType,
    [property: SwaggerSchema("Notes for the passengers, when any.")]
    string? Description,
    [property: SwaggerSchema("Contact of who offers the ride.")]
    UserContactDto Driver,
    [property: SwaggerSchema("Whether the signed-in user offers the ride.")]
    bool IsOwner,
    [property: SwaggerSchema("How the ride repeats.")]
    EnumRideFrequency Frequency,
    [property: SwaggerSchema("Last day a repeated ride departs; absent for a single ride.")]
    DateOnly? RepeatUntil
);
