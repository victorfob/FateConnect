using System.Globalization;
using FateConnect.Api.Modules.Rides.Entities;
using FateConnect.Api.Modules.Rides.Enums;
using FateConnect.Api.Modules.Rides.Services;

namespace FateConnect.Api.Tests.Rides;

public class RideDepartureScheduleTests
{
    private readonly HolidayCalendar _holidays = new();

    private static DateOnly Day(string isoDate) => DateOnly.Parse(isoDate, CultureInfo.InvariantCulture);

    private IReadOnlyList<DateOnly> Generate(EnumRideFrequency frequency, string reference, string? repeatUntil) =>
        RideDepartureSchedule.Generate(
            frequency,
            Day(reference),
            repeatUntil is null ? null : Day(repeatUntil),
            _holidays);

    [Fact]
    public void Monthly_StartingOnThe31st_FallsOnTheLastDayOfTheShorterMonthsAndKeepsThe31st()
    {
        IReadOnlyList<DateOnly> departures = Generate(EnumRideFrequency.Monthly, "2027-01-31", "2027-05-31");

        Assert.Equal(
            [Day("2027-01-31"), Day("2027-02-28"), Day("2027-03-31"), Day("2027-04-30"), Day("2027-05-31")],
            departures);
    }

    [Fact]
    public void Monthly_StartingOnThe31st_FallsOnThe29thOfALeapFebruary()
    {
        IReadOnlyList<DateOnly> departures = Generate(EnumRideFrequency.Monthly, "2032-01-31", "2032-03-31");

        Assert.Equal([Day("2032-01-31"), Day("2032-02-29"), Day("2032-03-31")], departures);
    }

    [Fact]
    public void Weekdays_InAWeekWithAHolidayOnWednesday_DepartsOnTheOtherFourDays()
    {
        IReadOnlyList<DateOnly> departures = Generate(EnumRideFrequency.Weekdays, "2027-04-19", "2027-04-23");

        Assert.Equal([Day("2027-04-19"), Day("2027-04-20"), Day("2027-04-22"), Day("2027-04-23")], departures);
    }

    [Fact]
    public void Weekdays_AcrossAWeekend_SkipsSaturdayAndSunday()
    {
        IReadOnlyList<DateOnly> departures = Generate(EnumRideFrequency.Weekdays, "2027-04-23", "2027-04-26");

        Assert.Equal([Day("2027-04-23"), Day("2027-04-26")], departures);
    }

    [Fact]
    public void Weekly_OnMondays_SkipsTheCarnivalMonday()
    {
        IReadOnlyList<DateOnly> departures = Generate(EnumRideFrequency.Weekly, "2027-02-01", "2027-02-15");

        Assert.Equal([Day("2027-02-01"), Day("2027-02-15")], departures);
    }

    [Fact]
    public void Once_OnAHoliday_KeepsTheDateItWasOfferedFor()
    {
        IReadOnlyList<DateOnly> departures = Generate(EnumRideFrequency.Once, "2026-12-25", null);

        Assert.Equal([Day("2026-12-25")], departures);
    }
}
