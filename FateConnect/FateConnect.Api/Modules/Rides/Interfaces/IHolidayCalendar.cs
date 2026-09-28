namespace FateConnect.Api.Modules.Rides.Interfaces;

public interface IHolidayCalendar
{
    IReadOnlyList<DateOnly> HolidaysIn(int year);

    bool IsHoliday(DateOnly day);
}
