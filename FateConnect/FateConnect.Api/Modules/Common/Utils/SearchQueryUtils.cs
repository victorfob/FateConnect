namespace FateConnect.Api.Modules.Common.Utils;

public static class SearchQueryUtils
{
    public static string SanitizeSearchTerm(this string searchTerm)
    {
        if (string.IsNullOrWhiteSpace(searchTerm))
            return string.Empty;

        return searchTerm
            .Replace(@"\", @"\\")
            .Replace("%", @"\%")
            .Replace("_", @"\_");
    }
}
