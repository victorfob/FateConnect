using FateConnect.Api.Modules.Users.Enums;
using FateConnect.Api.Modules.Users.Services;

namespace FateConnect.Api.Tests.Fixtures;

public static class CurrentLegalVersions
{
    private static readonly LegalDocumentVersions Published = LegalDocumentVersions.FromEmbeddedFile();

    public static string TermsOfUse => Published.Current[EnumDocumentType.TermsOfUse];

    public static string PrivacyPolicy => Published.Current[EnumDocumentType.PrivacyPolicy];
}
