using System.Globalization;
using FateConnect.Api.Modules.Users.Enums;
using FateConnect.Api.Modules.Users.Exceptions;
using FateConnect.Api.Modules.Users.Services;

namespace FateConnect.Api.Tests.Users;

public class LegalDocumentVersionsTests
{
    private const string TermsVersion = "2026-10-14";
    private const string PrivacyVersion = "2026-11-03";

    private static LegalDocumentVersions BothDocuments() => new(new Dictionary<EnumDocumentType, string>
    {
        [EnumDocumentType.TermsOfUse] = TermsVersion,
        [EnumDocumentType.PrivacyPolicy] = PrivacyVersion,
    });

    [Theory]
    [InlineData(EnumDocumentType.TermsOfUse)]
    [InlineData(EnumDocumentType.PrivacyPolicy)]
    public void FromEmbeddedFile_ReadsADateForEachDocument(EnumDocumentType document)
    {
        LegalDocumentVersions versions = LegalDocumentVersions.FromEmbeddedFile();

        bool isDate = DateOnly.TryParseExact(
            versions.Current[document],
            "yyyy-MM-dd",
            CultureInfo.InvariantCulture,
            DateTimeStyles.None,
            out _);

        Assert.True(isDate);
    }

    [Fact]
    public void FromResource_WithoutTheEmbeddedFile_RefusesToStart()
    {
        Assert.Throws<MissingLegalDocumentVersionsFileException>(
            () => LegalDocumentVersions.FromResource(typeof(LegalDocumentVersions).Assembly, "FateConnect.Api.Missing.json"));
    }

    [Fact]
    public void Constructor_WithoutTheVersionOfADocument_RefusesToStart()
    {
        MissingLegalDocumentVersionException exception = Assert.Throws<MissingLegalDocumentVersionException>(
            () => new LegalDocumentVersions(new Dictionary<EnumDocumentType, string>
            {
                [EnumDocumentType.TermsOfUse] = TermsVersion,
            }));

        Assert.Contains(nameof(EnumDocumentType.PrivacyPolicy), exception.Message);
    }

    [Fact]
    public void Constructor_WithABlankVersion_RefusesToStart()
    {
        Assert.Throws<MissingLegalDocumentVersionException>(
            () => new LegalDocumentVersions(new Dictionary<EnumDocumentType, string>
            {
                [EnumDocumentType.TermsOfUse] = " ",
                [EnumDocumentType.PrivacyPolicy] = PrivacyVersion,
            }));
    }

    [Theory]
    [InlineData(EnumDocumentType.TermsOfUse, TermsVersion, true)]
    [InlineData(EnumDocumentType.PrivacyPolicy, PrivacyVersion, true)]
    [InlineData(EnumDocumentType.PrivacyPolicy, TermsVersion, false)]
    [InlineData(EnumDocumentType.TermsOfUse, "2026-01-15", false)]
    public void IsCurrent_ComparesWithTheVersionOfThatDocument(EnumDocumentType document, string version, bool expected)
    {
        Assert.Equal(expected, BothDocuments().IsCurrent(document, version));
    }
}
