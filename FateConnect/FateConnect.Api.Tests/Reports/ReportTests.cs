using FateConnect.Api.Modules.Common.Exceptions;
using FateConnect.Api.Modules.Reports.Entities;
using FateConnect.Api.Modules.Reports.Enums;
using FateConnect.Api.Modules.Reports.Exceptions;

namespace FateConnect.Api.Tests.Reports;

public class ReportTests
{
    private const string ValidDescription = "O motorista cobrou valor acima do combinado na carona de ontem.";

    private const string StoredImage = "uploads/report/8a1b0f2e-0000-4000-8000-000000000000.png";

    private static Report CreateReport(
        EnumReportCategory category = EnumReportCategory.ImproperCharging,
        string description = ValidDescription,
        int userId = 7,
        bool isAnonymous = false) =>
        new(category, description, userId, isAnonymous, DateTime.UtcNow);

    [Fact]
    public void Constructor_WithValidData_StartsOpenAndTrimsTheDescription()
    {
        Report report = CreateReport(description: $"   {ValidDescription}   ");

        Assert.Equal(EnumReportStatus.Open, report.Status);
        Assert.Equal(ValidDescription, report.Description);
        Assert.NotEqual(Guid.Empty, report.Id);
        Assert.Null(report.UpdatedAt);
        Assert.Null(report.ImageUrl);
    }

    [Fact]
    public void Constructor_WithAnonymityRequested_KeepsTheReporterForAccountability()
    {
        Report report = CreateReport(userId: 7, isAnonymous: true);

        Assert.True(report.IsAnonymous);
        Assert.Equal(7, report.UserId);
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    [InlineData("Curta")]
    [InlineData("         x")]
    public void Constructor_WithADescriptionShorterThanTenCharacters_IsRefused(string description)
    {
        InvalidReportDescriptionException exception =
            Assert.Throws<InvalidReportDescriptionException>(
                () => CreateReport(description: description));

        Assert.Equal(
            "A descrição da denúncia deve conter pelo menos 10 caracteres para fornecer contexto suficiente.",
            exception.Message);
    }

    [Fact]
    public void Constructor_WithACategoryOutsideTheEnum_IsRefused()
    {
        InvalidReportCategoryException exception =
            Assert.Throws<InvalidReportCategoryException>(
                () => CreateReport(category: (EnumReportCategory)77));

        Assert.Equal(
            "A categoria selecionada para a denúncia é inválida ou não existe no sistema.",
            exception.Message);
    }

    [Theory]
    [InlineData(0)]
    [InlineData(-3)]
    public void Constructor_WithoutAReporter_IsRefused(int userId)
    {
        Assert.Throws<InvalidUserIdentifierException>(() => CreateReport(userId: userId));
    }

    [Fact]
    public void IsReportedBy_AnswersOnlyForWhoReportedIt()
    {
        Report report = CreateReport(userId: 7);

        Assert.True(report.IsReportedBy(7));
        Assert.False(report.IsReportedBy(8));
    }

    [Fact]
    public void AttachImage_TrimsTheStoredAddress()
    {
        Report report = CreateReport();

        report.AttachImage($"  {StoredImage}  ");

        Assert.Equal(StoredImage, report.ImageUrl);
    }

    [Theory]
    [InlineData(EnumReportStatus.InReview)]
    [InlineData(EnumReportStatus.Dismissed)]
    public void UpdateStatus_FromOpen_AcceptsReviewAndDismissal(EnumReportStatus newStatus)
    {
        Report report = CreateReport();

        report.UpdateStatus(newStatus, DateTime.UtcNow);

        Assert.Equal(newStatus, report.Status);
        Assert.NotNull(report.UpdatedAt);
    }

    [Theory]
    [InlineData(EnumReportStatus.Resolved)]
    [InlineData(EnumReportStatus.Dismissed)]
    public void UpdateStatus_FromReview_ReachesTheTerminalStatuses(EnumReportStatus terminalStatus)
    {
        Report report = CreateReport();
        report.UpdateStatus(EnumReportStatus.InReview, DateTime.UtcNow);

        report.UpdateStatus(terminalStatus, DateTime.UtcNow);

        Assert.Equal(terminalStatus, report.Status);
    }

    [Fact]
    public void UpdateStatus_SkippingTheReviewToResolve_NamesBothStatuses()
    {
        Report report = CreateReport();

        InvalidReportStatusTransitionException exception =
            Assert.Throws<InvalidReportStatusTransitionException>(
                () => report.UpdateStatus(EnumReportStatus.Resolved, DateTime.UtcNow));

        Assert.Equal(
            "Transição inválida: não é possível alterar o status de 'Open' para 'Resolved'.",
            exception.Message);
        Assert.Equal(EnumReportStatus.Open, report.Status);
    }

    [Fact]
    public void UpdateStatus_ToTheStatusItAlreadyCarries_NamesTheCurrentStatus()
    {
        Report report = CreateReport();

        InvalidReportStatusTransitionException exception =
            Assert.Throws<InvalidReportStatusTransitionException>(
                () => report.UpdateStatus(EnumReportStatus.Open, DateTime.UtcNow));

        Assert.Equal("A denúncia já se encontra no status 'Open'.", exception.Message);
        Assert.Null(report.UpdatedAt);
    }

    [Theory]
    [InlineData(EnumReportStatus.Open)]
    [InlineData(EnumReportStatus.InReview)]
    [InlineData(EnumReportStatus.Resolved)]
    public void UpdateStatus_FromATerminalStatus_IsRefused(EnumReportStatus newStatus)
    {
        Report report = CreateReport();
        report.UpdateStatus(EnumReportStatus.Dismissed, DateTime.UtcNow);

        Assert.Throws<InvalidReportStatusTransitionException>(
            () => report.UpdateStatus(newStatus, DateTime.UtcNow));
    }

    [Fact]
    public void UpdateStatus_WithAStatusOutsideTheEnum_IsRefused()
    {
        Report report = CreateReport();

        InvalidReportStatusException exception =
            Assert.Throws<InvalidReportStatusException>(
                () => report.UpdateStatus((EnumReportStatus)99, DateTime.UtcNow));

        Assert.Equal("O status informado para a denúncia é inválido.", exception.Message);
    }
}
