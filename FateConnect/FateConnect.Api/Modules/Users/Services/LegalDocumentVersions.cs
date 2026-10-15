namespace FateConnect.Api.Modules.Users.Services;

using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Reflection;
using System.Text.Json;
using FateConnect.Api.Modules.Users.Enums;
using FateConnect.Api.Modules.Users.Exceptions;
using FateConnect.Api.Modules.Users.Interfaces;

public sealed class LegalDocumentVersions : ILegalDocumentVersions
{
    private const string ResourceName = "FateConnect.Api.LegalDocumentVersions.json";

    private static readonly JsonSerializerOptions FileReadOptions = new(JsonSerializerDefaults.Web);

    public IReadOnlyDictionary<EnumDocumentType, string> Current { get; }

    public LegalDocumentVersions(IReadOnlyDictionary<EnumDocumentType, string> current)
    {
        ArgumentNullException.ThrowIfNull(current);

        EnumDocumentType[] documentsWithoutVersion =
            [.. Enum.GetValues<EnumDocumentType>().Where(document => !HasVersion(current, document))];

        if (documentsWithoutVersion.Length > 0)
            throw new MissingLegalDocumentVersionException(documentsWithoutVersion[0]);

        Current = current;
    }

    public static LegalDocumentVersions FromEmbeddedFile() =>
        FromResource(typeof(LegalDocumentVersions).Assembly, ResourceName);

    public static LegalDocumentVersions FromResource(Assembly assembly, string resourceName)
    {
        ArgumentNullException.ThrowIfNull(assembly);

        using Stream stream = assembly.GetManifestResourceStream(resourceName)
            ?? throw new MissingLegalDocumentVersionsFileException(resourceName);

        VersionsFile? file = JsonSerializer.Deserialize<VersionsFile>(stream, FileReadOptions);

        Dictionary<EnumDocumentType, string> current = [];

        if (!string.IsNullOrWhiteSpace(file?.TermsOfUse))
            current[EnumDocumentType.TermsOfUse] = file.TermsOfUse;

        if (!string.IsNullOrWhiteSpace(file?.PrivacyPolicy))
            current[EnumDocumentType.PrivacyPolicy] = file.PrivacyPolicy;

        return new LegalDocumentVersions(current);
    }

    public bool IsCurrent(EnumDocumentType document, string version) =>
        Current.TryGetValue(document, out string? currentVersion) && currentVersion == version;

    private static bool HasVersion(IReadOnlyDictionary<EnumDocumentType, string> current, EnumDocumentType document) =>
        current.TryGetValue(document, out string? version) && !string.IsNullOrWhiteSpace(version);

    private sealed record VersionsFile(string? TermsOfUse, string? PrivacyPolicy);
}
