namespace FateConnect.Api.Modules.Common.Utils;

using System.Globalization;

public static class QuantityUtils
{
    public static string Minutes(int count) => WithUnit(count, "minuto", "minutos");

    public static string Hours(int count) => WithUnit(count, "hora", "horas");

    public static string Times(int count) => WithUnit(count, "vez", "vezes");

    private static string WithUnit(int count, string singular, string plural)
    {
        string unit = count == 1 ? singular : plural;

        return $"{count.ToString(CultureInfo.InvariantCulture)} {unit}";
    }
}
