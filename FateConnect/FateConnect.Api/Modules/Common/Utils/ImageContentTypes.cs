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

    public static bool TryContentTypeOfStoredFile(string fileName, [NotNullWhen(true)] out string? contentType)
    {
        contentType = null;

        return Guid.TryParse(Path.GetFileNameWithoutExtension(fileName), out _)
            && ContentTypeByExtension.TryGetValue(Path.GetExtension(fileName), out contentType);
    }

    public static string ExtensionFor(string contentType)
    {
        if (!ExtensionByContentType.TryGetValue(contentType, out string? fileExtension))
            throw new InvalidImageException(UnsupportedMessage);

        return fileExtension;
    }
}
