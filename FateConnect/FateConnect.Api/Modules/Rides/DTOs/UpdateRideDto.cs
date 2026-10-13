namespace FateConnect.Api.Modules.Rides.DTOs;

using System.ComponentModel.DataAnnotations;
using FateConnect.Api.Infrastructure.OpenApi;
using FateConnect.Api.Modules.Rides.Enums;
using Swashbuckle.AspNetCore.Annotations;

public record UpdateRideDto
{
    [StringLength(100)]
    [SwaggerSchema("Where the ride goes.")]
    [SchemaExample("Centro, Sorocaba")]
    public string? Destination { get; init; }

    [SwaggerSchema("Day of the first departure. No ride departs on a holiday.")]
    [SchemaExample("2026-10-21")]
    public DateOnly? DepartureDate { get; init; }

    [SwaggerSchema("Departure time, in the time zone of São Paulo.")]
    [SchemaExample("18:15:00")]
    public TimeOnly? DepartureTime { get; init; }

    [SwaggerSchema("`Solidarity` is free, and in `Egalitarian` the passengers share the costs.")]
    [SchemaExample("Egalitarian")]
    public EnumRideType? RideType { get; init; }

    [SwaggerSchema("Vehicle of the ride.")]
    [SchemaExample("Motorcycle")]
    public EnumVehicleType? VehicleType { get; init; }

    [StringLength(300)]
    [SwaggerSchema("Notes for the passengers.")]
    [SchemaExample("I bring an extra helmet.")]
    public string? Description { get; init; }

    [SwaggerSchema("How the ride repeats.")]
    [SchemaExample("Weekdays")]
    public EnumRideFrequency? Frequency { get; init; }

    [SwaggerSchema("Last day a repeated ride departs: required when it repeats, refused when it does not.")]
    [SchemaExample("2026-11-27")]
    public DateOnly? RepeatUntil { get; init; }
}
