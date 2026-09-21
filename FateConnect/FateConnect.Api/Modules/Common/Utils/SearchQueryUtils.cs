namespace FateConnect.Api.Modules.Common.Utils;

public static class SearchQueryUtils
{
    public static string SanitizeSearchTerm(this string searchTerm)
    {
        return searchTerm
            .Replace(@"\", @"\\")
            .Replace("%", @"\%")
            .Replace("_", @"\_");
    }
}
