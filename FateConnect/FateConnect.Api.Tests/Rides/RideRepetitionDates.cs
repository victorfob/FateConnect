using System.Globalization;
using FateConnect.Api.Modules.Rides.Entities;
using FateConnect.Api.Modules.Rides.Services;

namespace FateConnect.Api.Tests.Rides;

internal static class RideRepetitionDates
{
    private const int DaysSearched = 400;

    private static readonly HolidayCalendar Holidays = new();

    public static DateOnly Today => DateOnly.FromDateTime(DateTime.UtcNow);

    public static bool IsHoliday(DateOnly day) => Holidays.IsHoliday(day);

    public static bool IsOrdinaryWeekday(DateOnly day) => RideDepartureSchedule.IsWeekday(day) && !IsHoliday(day);

    public static DateOnly FirstDayFrom(int daysAhead, Func<DateOnly, bool> fits) =>
        Enumerable.Range(daysAhead, DaysSearched).Select(Today.AddDays).First(fits);

    public static DateOnly WeeklyStartWithoutHolidays(int weeks) =>
        FirstDayFrom(7, day => Enumerable.Range(0, weeks).All(week => IsOrdinaryWeekday(day.AddDays(7 * week))));

    public static DateOnly MonthlyStartOnThe31stBeforeAShorterMonth() =>
        FirstDayFrom(2, day =>
            day.Day == 31
            && day.AddMonths(1).Day < 31
            && !IsHoliday(day)
            && !IsHoliday(day.AddMonths(1))
            && !IsHoliday(day.AddMonths(2)));

    public static DateTimeOffset InProductTimeZone(DateOnly day, int hour) =>
        new(day.ToDateTime(new TimeOnly(hour, 0)), TimeSpan.FromHours(-3));

    public static string Iso(DateOnly day) => day.ToString("yyyy-MM-dd", CultureInfo.InvariantCulture);
}
