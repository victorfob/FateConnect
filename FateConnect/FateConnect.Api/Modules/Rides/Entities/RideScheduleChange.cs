namespace FateConnect.Api.Modules.Rides.Entities;

using FateConnect.Api.Modules.Rides.Enums;

public record RideScheduleChange(
    DateOnly? DepartureDate,
    TimeOnly? DepartureTime,
    EnumRideFrequency? Frequency,
    DateOnly? RepeatUntil);
