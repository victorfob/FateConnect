namespace FateConnect.Api.Modules.Rides.Services;

using FateConnect.Api.Modules.Rides.Interfaces;

public class HolidayCalendar : IHolidayCalendar
{
    private const int CarnivalMondayDaysFromEaster = -48;
    private const int CarnivalTuesdayDaysFromEaster = -47;
    private const int GoodFridayDaysFromEaster = -2;
    private const int CorpusChristiDaysFromEaster = 60;

    private static readonly (int Month, int Day)[] NationalFixedHolidays =
    [
        (1, 1),
        (4, 21),
        (5, 1),
        (9, 7),
        (10, 12),
        (11, 2),
        (11, 15),
        (11, 20),
        (12, 25),
    ];

    private static readonly (int Month, int Day)[] SaoPauloStateHolidays = [(7, 9)];

    private static readonly (int Month, int Day)[] SorocabaMunicipalHolidays = [(8, 15)];

    private static readonly int[] DaysFromEaster =
    [
        CarnivalMondayDaysFromEaster,
        CarnivalTuesdayDaysFromEaster,
        GoodFridayDaysFromEaster,
        CorpusChristiDaysFromEaster,
    ];

    public IReadOnlyList<DateOnly> HolidaysIn(int year)
    {
        DateOnly easter = EasterSunday(year);

        IEnumerable<DateOnly> fixedHolidays = NationalFixedHolidays
            .Concat(SaoPauloStateHolidays)
            .Concat(SorocabaMunicipalHolidays)
            .Select(holiday => new DateOnly(year, holiday.Month, holiday.Day));

        IEnumerable<DateOnly> movableHolidays = DaysFromEaster.Select(easter.AddDays);

        return [.. fixedHolidays.Concat(movableHolidays).Distinct().Order()];
    }

    public bool IsHoliday(DateOnly day) => HolidaysIn(day.Year).Contains(day);

    private static DateOnly EasterSunday(int year)
    {
        int metonicCycleYear = year % 19;
        int century = year / 100;
        int yearInCentury = year % 100;
        int skippedLeapCenturies = century / 4;
        int centuryLeapRemainder = century % 4;
        int lunarCorrectionFactor = (century + 8) / 25;
        int lunarCorrection = (century - lunarCorrectionFactor + 1) / 3;
        int daysToFullMoon = ((19 * metonicCycleYear) + century - skippedLeapCenturies - lunarCorrection + 15) % 30;
        int leapYearsInCentury = yearInCentury / 4;
        int yearInLeapCycle = yearInCentury % 4;
        int daysToSunday = (32 + (2 * centuryLeapRemainder) + (2 * leapYearsInCentury) - daysToFullMoon - yearInLeapCycle) % 7;
        int lateFullMoonCorrection = (metonicCycleYear + (11 * daysToFullMoon) + (22 * daysToSunday)) / 451;
        int monthAndDay = daysToFullMoon + daysToSunday - (7 * lateFullMoonCorrection) + 114;

        return new DateOnly(year, monthAndDay / 31, (monthAndDay % 31) + 1);
    }
}
