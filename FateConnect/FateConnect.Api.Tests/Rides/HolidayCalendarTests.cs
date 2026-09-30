using System.Globalization;
using FateConnect.Api.Modules.Rides.Services;

namespace FateConnect.Api.Tests.Rides;

public class HolidayCalendarTests
{
    private readonly HolidayCalendar _calendar = new();

    private static DateOnly Day(string isoDate) => DateOnly.Parse(isoDate, CultureInfo.InvariantCulture);

    [Fact]
    public void HolidaysIn2026_AreTheNationalStateAndMunicipalOnesInOrder()
    {
        string[] expected =
        [
            "2026-01-01", "2026-02-16", "2026-02-17", "2026-04-03", "2026-04-21", "2026-05-01",
            "2026-06-04", "2026-07-09", "2026-08-15", "2026-09-07", "2026-10-12", "2026-11-02",
            "2026-11-15", "2026-11-20", "2026-12-25",
        ];

        IReadOnlyList<DateOnly> holidays = _calendar.HolidaysIn(2026);

        Assert.Equal(expected.Select(Day), holidays);
    }

    [Theory]
    [InlineData(2026, "2026-02-16", "2026-02-17", "2026-04-03", "2026-06-04")]
    [InlineData(2027, "2027-02-08", "2027-02-09", "2027-03-26", "2027-05-27")]
    [InlineData(2028, "2028-02-28", "2028-02-29", "2028-04-14", "2028-06-15")]
    public void HolidaysIn_FollowEasterForTheMovableOnes(
        int year,
        string carnivalMonday,
        string carnivalTuesday,
        string goodFriday,
        string corpusChristi)
    {
        IReadOnlyList<DateOnly> holidays = _calendar.HolidaysIn(year);

        Assert.Contains(Day(carnivalMonday), holidays);
        Assert.Contains(Day(carnivalTuesday), holidays);
        Assert.Contains(Day(goodFriday), holidays);
        Assert.Contains(Day(corpusChristi), holidays);
    }

    [Theory]
    [InlineData(2027)]
    [InlineData(2031)]
    public void HolidaysIn_AlwaysBringTheStateAndTheMunicipalOnes(int year)
    {
        IReadOnlyList<DateOnly> holidays = _calendar.HolidaysIn(year);

        Assert.Contains(new DateOnly(year, 7, 9), holidays);
        Assert.Contains(new DateOnly(year, 8, 15), holidays);
    }

    [Fact]
    public void IsHoliday_OnSorocabaFoundationDay_IsTrue()
    {
        Assert.True(_calendar.IsHoliday(Day("2026-08-15")));
    }

    [Fact]
    public void IsHoliday_OnAnOrdinaryDay_IsFalse()
    {
        Assert.False(_calendar.IsHoliday(Day("2026-08-14")));
    }
}
