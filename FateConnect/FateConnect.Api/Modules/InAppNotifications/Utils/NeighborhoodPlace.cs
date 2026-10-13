namespace FateConnect.Api.Modules.InAppNotifications.Utils;

using System.Globalization;
using System.Linq;
using System.Text;

public sealed record NeighborhoodPlace(string Neighborhood, string City)
{
    private const char CitySeparator = ',';

    public static NeighborhoodPlace Parse(string text)
    {
        int separatorIndex = text.LastIndexOf(CitySeparator);

        if (separatorIndex < 0)
            return new NeighborhoodPlace(Normalize(text), string.Empty);

        return new NeighborhoodPlace(
            Normalize(text[..separatorIndex]),
            Normalize(text[(separatorIndex + 1)..]));
    }

    public bool Matches(NeighborhoodPlace other)
    {
        bool eitherLacksCity = City.Length == 0 || other.City.Length == 0;

        return Neighborhood == other.Neighborhood && (eitherLacksCity || City == other.City);
    }

    private static string Normalize(string text)
    {
        string decomposed = text.Trim().Normalize(NormalizationForm.FormD);
        string withoutAccents = string.Concat(decomposed.Where(
            character => CharUnicodeInfo.GetUnicodeCategory(character) != UnicodeCategory.NonSpacingMark));

        return withoutAccents.Normalize(NormalizationForm.FormC).ToLowerInvariant();
    }
}
