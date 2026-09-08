namespace FateConnect.Api.Modules.Common.Utils;

public static class DateTimeUtils
{
    private static readonly TimeZoneInfo ProductTimeZone =
        TimeZoneInfo.FindSystemTimeZoneById("America/Sao_Paulo");

    public static DateTime NowInProductTimeZone() =>
        TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, ProductTimeZone);

    public static DateTime ToUtcFromProductTimeZone(DateOnly date, TimeOnly time) =>
        TimeZoneInfo.ConvertTimeToUtc(date.ToDateTime(time), ProductTimeZone);
}
