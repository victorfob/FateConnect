namespace FateConnect.Api.Modules.Common.Utils;

using System.Globalization;
using System.Text;
using System.Text.RegularExpressions;
using FateConnect.Api.Modules.Common.Constants;

public static partial class WordSearchTerm
{
    private static readonly IReadOnlyList<(string Singular, string Plural)> IrregularPlurals =
    [
        ("el", "eis"), ("al", "ais"), ("ol", "ois"), ("ul", "uis"), ("il", "is"),
        ("ao", "oes"), ("ao", "aes"), ("ao", "aos"), ("m", "ns"),
    ];

    private static readonly IReadOnlyList<(string Plural, string Singular)> IrregularSingulars =
        [("oes", "ao"), ("aes", "ao"), ("aos", "ao"), ("ns", "m")];

    private static readonly Dictionary<string, IReadOnlyList<string>> SynonymsByForm = BuildSynonymsByForm();

    private static readonly int LongestSynonymInWords =
        SynonymsByForm.Keys.Max(form => form.Split(' ').Length);

    public static string? ToTsQuery(string? searchTerm)
    {
        if (string.IsNullOrWhiteSpace(searchTerm))
            return null;

        IReadOnlyList<string> words = WordsOf(searchTerm);

        if (words.Count == 0)
            return null;

        return string.Join(" & ", UnitsOf(words).Select(AlternativesOf));
    }

    private static IEnumerable<string> UnitsOf(IReadOnlyList<string> words)
    {
        int index = 0;

        while (index < words.Count)
        {
            string unit = LongestSynonymAt(words, index) ?? words[index];

            yield return unit;

            index += unit.Split(' ').Length;
        }
    }

    private static string? LongestSynonymAt(IReadOnlyList<string> words, int index)
    {
        for (int length = Math.Min(LongestSynonymInWords, words.Count - index); length > 1; length--)
        {
            string candidate = string.Join(' ', words.Skip(index).Take(length));

            if (SynonymsByForm.ContainsKey(candidate))
                return candidate;
        }

        return null;
    }

    private static string AlternativesOf(string unit)
    {
        IReadOnlyList<string> group = SynonymsByForm.GetValueOrDefault(unit) ?? [unit];

        HashSet<string> alternatives = [.. group, unit];

        foreach (string singleWord in alternatives.Where(alternative => !alternative.Contains(' ')).ToList())
            alternatives.UnionWith(OtherNumberOf(singleWord));

        return $"({string.Join(" | ", alternatives.Order(StringComparer.Ordinal).Select(AsPrefixQuery))})";
    }

    private static string AsPrefixQuery(string alternative)
    {
        string[] words = alternative.Split(' ');

        if (words.Length == 1)
            return $"{alternative}:*";

        return $"({string.Join(" & ", words.Select(word => $"{word}:*"))})";
    }

    private static IEnumerable<string> OtherNumberOf(string word)
    {
        foreach ((string singular, string plural) in IrregularPlurals)
        {
            if (word.Length > singular.Length && word.EndsWith(singular, StringComparison.Ordinal))
                yield return word[..^singular.Length] + plural;
        }

        foreach ((string plural, string singular) in IrregularSingulars)
        {
            if (word.Length > plural.Length && word.EndsWith(plural, StringComparison.Ordinal))
                yield return word[..^plural.Length] + singular;
        }
    }

    private static Dictionary<string, IReadOnlyList<string>> BuildSynonymsByForm()
    {
        Dictionary<string, IReadOnlyList<string>> synonymsByForm = new(StringComparer.Ordinal);

        foreach (IReadOnlyList<string> group in SearchSynonyms.Groups)
        {
            IReadOnlyList<string> normalizedGroup = [.. group.Select(entry => string.Join(' ', WordsOf(entry)))];

            foreach (string entry in normalizedGroup)
                foreach (string form in FormsOf(entry))
                    synonymsByForm[form] = normalizedGroup;
        }

        return synonymsByForm;
    }

    private static IEnumerable<string> FormsOf(string entry)
    {
        yield return entry;

        if (entry.Contains(' '))
            yield break;

        yield return entry + "s";
        yield return entry + "es";

        foreach (string otherNumber in OtherNumberOf(entry))
            yield return otherNumber;
    }

    private static IReadOnlyList<string> WordsOf(string text)
    {
        string withoutAccents = new(
            [
                .. text.ToLowerInvariant()
                    .Normalize(NormalizationForm.FormD)
                    .Where(character => CharUnicodeInfo.GetUnicodeCategory(character) != UnicodeCategory.NonSpacingMark),
            ]);

        return [.. NotALetterOrDigit().Split(withoutAccents).Where(word => word.Length > 0)];
    }

    [GeneratedRegex(@"[^\p{L}\p{Nd}]+", RegexOptions.None, matchTimeoutMilliseconds: 250)]
    private static partial Regex NotALetterOrDigit();
}
