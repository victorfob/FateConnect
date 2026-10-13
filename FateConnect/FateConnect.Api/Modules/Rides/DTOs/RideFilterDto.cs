namespace FateConnect.Api.Modules.Rides.DTOs;

using FateConnect.Api.Modules.Common.DTOs;
using FateConnect.Api.Modules.Rides.Enums;

public record RideFilterDto : DateRangeFilterDto
{
    public string? SearchTerm { get; init; }

    public EnumRideShift? DepartureShift { get; init; }

    public EnumRideType? RideType { get; init; }

    public EnumVehicleType? VehicleType { get; init; }

    public bool? OnlyMine { get; init; }
}
