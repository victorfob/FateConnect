namespace FateConnect.Api.Modules.Common.Utils;

public static class DateTimeUtils
{
    private static readonly TimeZoneInfo ProductTimeZone =
        TimeZoneInfo.FindSystemTimeZoneById("America/Sao_Paulo");

    public static DateTime NowInProductTimeZone(TimeProvider clock) => InProductTimeZone(clock.GetUtcNow().UtcDateTime);

    public static DateTime InProductTimeZone(DateTime utc) => TimeZoneInfo.ConvertTimeFromUtc(utc, ProductTimeZone);

    public static DateTime ToUtcFromProductTimeZone(DateOnly date, TimeOnly time) =>
        TimeZoneInfo.ConvertTimeToUtc(date.ToDateTime(time), ProductTimeZone);
}
