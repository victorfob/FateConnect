namespace FateConnect.Api.Modules.Rides.Entities;

using FateConnect.Api.Modules.Rides.Enums;
using FateConnect.Api.Modules.Rides.Interfaces;

public static class RideDepartureSchedule
{
    private const int DaysInAWeek = 7;

    public static IReadOnlyList<DateOnly> Generate(
        EnumRideFrequency frequency,
        DateOnly reference,
        DateOnly? repeatUntil,
        IHolidayCalendar holidays)
    {
        if (frequency == EnumRideFrequency.Once || repeatUntil is null)
            return [reference];

        IEnumerable<DateOnly> candidates = frequency switch
        {
            EnumRideFrequency.Weekdays => EveryDay(reference, repeatUntil.Value).Where(IsWeekday),
            EnumRideFrequency.Weekly => EveryWeek(reference, repeatUntil.Value),
            _ => EveryMonth(reference, repeatUntil.Value),
        };

        return [.. candidates.Where(day => !holidays.IsHoliday(day))];
    }

    public static bool IsWeekday(DateOnly day) =>
        day.DayOfWeek is not DayOfWeek.Saturday and not DayOfWeek.Sunday;

    private static IEnumerable<DateOnly> EveryDay(DateOnly reference, DateOnly repeatUntil)
    {
        for (DateOnly day = reference; day <= repeatUntil; day = day.AddDays(1))
            yield return day;
    }

    private static IEnumerable<DateOnly> EveryWeek(DateOnly reference, DateOnly repeatUntil)
    {
        for (DateOnly day = reference; day <= repeatUntil; day = day.AddDays(DaysInAWeek))
            yield return day;
    }

    private static IEnumerable<DateOnly> EveryMonth(DateOnly reference, DateOnly repeatUntil)
    {
        for (int monthsAfter = 0; reference.AddMonths(monthsAfter) <= repeatUntil; monthsAfter++)
            yield return reference.AddMonths(monthsAfter);
    }
}
