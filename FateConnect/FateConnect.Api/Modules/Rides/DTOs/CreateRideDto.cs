namespace FateConnect.Api.Modules.Rides.DTOs;

using System.ComponentModel.DataAnnotations;
using FateConnect.Api.Infrastructure.OpenApi;
using FateConnect.Api.Modules.Rides.Enums;
using Swashbuckle.AspNetCore.Annotations;

public record CreateRideDto
{
    [StringLength(100)]
    [SwaggerSchema("Where the ride goes.")]
    [SchemaExample("Campolim, Sorocaba")]
    public required string Destination { get; init; }

    [SwaggerSchema("Day of the first departure. No ride departs on a holiday.")]
    [SchemaExample("2026-10-20")]
    public required DateOnly DepartureDate { get; init; }

    [SwaggerSchema("Departure time, in the time zone of São Paulo.")]
    [SchemaExample("07:30:00")]
    public required TimeOnly DepartureTime { get; init; }

    [SwaggerSchema("`Solidarity` is free, and in `Egalitarian` the passengers share the costs.")]
    [SchemaExample("Solidarity")]
    public required EnumRideType RideType { get; init; }

    [SwaggerSchema("Vehicle of the ride.")]
    [SchemaExample("Car")]
    public required EnumVehicleType VehicleType { get; init; }

    [StringLength(300)]
    [SwaggerSchema("Notes for the passengers.")]
    [SchemaExample("Leaving from the main gate.")]
    public string? Description { get; init; }

    [SwaggerSchema("How the ride repeats; `Once` when absent.")]
    [SchemaExample("Weekly")]
    public EnumRideFrequency Frequency { get; init; } = EnumRideFrequency.Once;

    [SwaggerSchema("Last day a repeated ride departs: required when it repeats, refused when it does not.")]
    [SchemaExample("2026-12-18")]
    public DateOnly? RepeatUntil { get; init; }
}
