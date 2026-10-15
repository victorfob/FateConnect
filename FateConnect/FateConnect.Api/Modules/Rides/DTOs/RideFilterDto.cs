namespace FateConnect.Api.Modules.Rides.DTOs;

using FateConnect.Api.Modules.Common.DTOs;
using FateConnect.Api.Modules.Rides.Enums;
using Swashbuckle.AspNetCore.Annotations;

public record RideFilterDto : DateRangeFilterDto
{
    [SwaggerParameter("Text searched in the destination and the description, ignoring case and accents.")]
    public string? SearchTerm { get; init; }

    [SwaggerParameter("Only rides departing in this shift.")]
    public EnumRideShift? DepartureShift { get; init; }

    [SwaggerParameter("Only rides of this type.")]
    public EnumRideType? RideType { get; init; }

    [SwaggerParameter("Only rides in this vehicle.")]
    public EnumVehicleType? VehicleType { get; init; }

    [SwaggerParameter("`true` lists only the rides offered by the signed-in user.")]
    public bool? OnlyMine { get; init; }
}
