namespace FateConnect.Api.Modules.Common.Utils;

using System.Diagnostics.CodeAnalysis;
using FateConnect.Api.Modules.Common.Exceptions;

public static class ImageContentTypes
{
    public const string UnsupportedMessage = "Formato de imagem não suportado. Apenas JPG, PNG ou WEBP são permitidos.";

    private static readonly Dictionary<string, string> ExtensionByContentType =
        new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase)
        {
            ["image/jpeg"] = ".jpg",
            ["image/png"] = ".png",
            ["image/webp"] = ".webp",
        };

    private static readonly Dictionary<string, string> ContentTypeByExtension =
        ExtensionByContentType.ToDictionary(
            entry => entry.Value,
            entry => entry.Key,
            StringComparer.OrdinalIgnoreCase);

    public static bool IsSupported(string contentType) => ExtensionByContentType.ContainsKey(contentType);

    public static bool TryDescribeStoredFile(
        string fileName,
        [NotNullWhen(true)] out string? storedFileName,
        [NotNullWhen(true)] out string? contentType)
    {
        storedFileName = null;
        contentType = null;

        if (!Guid.TryParse(Path.GetFileNameWithoutExtension(fileName), out Guid identifier))
            return false;

        if (!ContentTypeByExtension.TryGetValue(Path.GetExtension(fileName), out contentType))
            return false;

        storedFileName = $"{identifier}{ExtensionByContentType[contentType]}";

        return true;
    }

    public static string ExtensionFor(string contentType)
    {
        if (!ExtensionByContentType.TryGetValue(contentType, out string? fileExtension))
            throw new InvalidImageException(UnsupportedMessage);

        return fileExtension;
    }
}
