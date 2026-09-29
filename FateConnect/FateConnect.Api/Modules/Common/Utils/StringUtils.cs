namespace FateConnect.Api.Modules.Common.Utils;

public static class StringUtils
{
    public static string? NormalizeOptionalText(this string? text) =>
        string.IsNullOrWhiteSpace(text) ? null : text.Trim();
}
