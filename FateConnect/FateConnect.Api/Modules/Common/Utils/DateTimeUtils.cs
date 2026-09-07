namespace FateConnect.Api.Modules.Common.Utils;

public static class DateTimeUtils
{
    public static readonly TimeZoneInfo ProductTimeZone =
        TimeZoneInfo.FindSystemTimeZoneById("America/Sao_Paulo");

    public static DateTime NowInProductTimeZone() =>
        TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, ProductTimeZone);
}
