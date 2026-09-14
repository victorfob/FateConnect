using FateConnect.Api.Modules.Common.Exceptions;
using FateConnect.Api.Modules.Denunciations.Entities;
using FateConnect.Api.Modules.Denunciations.Enums;
using FateConnect.Api.Modules.Denunciations.Exceptions;

namespace FateConnect.Api.Tests;

public class DenunciationTests
{
    private const string ValidDescription = "O motorista cobrou valor acima do combinado na carona de ontem.";

    private const string StoredImage = "uploads/denunciation/8a1b0f2e-0000-4000-8000-000000000000.png";

    private static Denunciation CreateDenunciation(
        EnumDenunciationCategory category = EnumDenunciationCategory.ImproperCharging,
        string description = ValidDescription,
        int userId = 7,
        bool isAnonymous = false) =>
        new(category, description, userId, isAnonymous);

    [Fact]
    public void Constructor_WithValidData_StartsOpenAndTrimsTheDescription()
    {
        Denunciation denunciation = CreateDenunciation(description: $"   {ValidDescription}   ");

        Assert.Equal(EnumDenunciationStatus.Open, denunciation.Status);
        Assert.Equal(ValidDescription, denunciation.Description);
        Assert.NotEqual(Guid.Empty, denunciation.Id);
        Assert.Null(denunciation.UpdatedAt);
        Assert.Null(denunciation.ImageUrl);
    }

    [Fact]
    public void Constructor_WithAnonymityRequested_KeepsTheReporterForAccountability()
    {
        Denunciation denunciation = CreateDenunciation(userId: 7, isAnonymous: true);

        Assert.True(denunciation.IsAnonymous);
        Assert.Equal(7, denunciation.UserId);
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    [InlineData("Curta")]
    [InlineData("         x")]
    public void Constructor_WithADescriptionShorterThanTenCharacters_IsRefused(string description)
    {
        InvalidDenunciationDescriptionException exception =
            Assert.Throws<InvalidDenunciationDescriptionException>(
                () => CreateDenunciation(description: description));

        Assert.Equal(
            "A descrição da denúncia deve conter pelo menos 10 caracteres para fornecer contexto suficiente.",
            exception.Message);
    }

    [Fact]
    public void Constructor_WithACategoryOutsideTheEnum_IsRefused()
    {
        InvalidDenunciationCategoryException exception =
            Assert.Throws<InvalidDenunciationCategoryException>(
                () => CreateDenunciation(category: (EnumDenunciationCategory)77));

        Assert.Equal(
            "A categoria selecionada para a denúncia é inválida ou não existe no sistema.",
            exception.Message);
    }

    [Theory]
    [InlineData(0)]
    [InlineData(-3)]
    public void Constructor_WithoutAReporter_IsRefused(int userId)
    {
        Assert.Throws<InvalidUserIdentifierException>(() => CreateDenunciation(userId: userId));
    }

    [Fact]
    public void IsReportedBy_AnswersOnlyForWhoReportedIt()
    {
        Denunciation denunciation = CreateDenunciation(userId: 7);

        Assert.True(denunciation.IsReportedBy(7));
        Assert.False(denunciation.IsReportedBy(8));
    }

    [Fact]
    public void AttachImage_TrimsTheStoredAddress()
    {
        Denunciation denunciation = CreateDenunciation();

        denunciation.AttachImage($"  {StoredImage}  ");

        Assert.Equal(StoredImage, denunciation.ImageUrl);
    }

    [Theory]
    [InlineData(EnumDenunciationStatus.InReview)]
    [InlineData(EnumDenunciationStatus.Dismissed)]
    public void UpdateStatus_FromOpen_AcceptsReviewAndDismissal(EnumDenunciationStatus newStatus)
    {
        Denunciation denunciation = CreateDenunciation();

        denunciation.UpdateStatus(newStatus);

        Assert.Equal(newStatus, denunciation.Status);
        Assert.NotNull(denunciation.UpdatedAt);
    }

    [Theory]
    [InlineData(EnumDenunciationStatus.Resolved)]
    [InlineData(EnumDenunciationStatus.Dismissed)]
    public void UpdateStatus_FromReview_ReachesTheTerminalStatuses(EnumDenunciationStatus terminalStatus)
    {
        Denunciation denunciation = CreateDenunciation();
        denunciation.UpdateStatus(EnumDenunciationStatus.InReview);

        denunciation.UpdateStatus(terminalStatus);

        Assert.Equal(terminalStatus, denunciation.Status);
    }

    [Fact]
    public void UpdateStatus_SkippingTheReviewToResolve_NamesBothStatuses()
    {
        Denunciation denunciation = CreateDenunciation();

        InvalidDenunciationStatusTransitionException exception =
            Assert.Throws<InvalidDenunciationStatusTransitionException>(
                () => denunciation.UpdateStatus(EnumDenunciationStatus.Resolved));

        Assert.Equal(
            "Transição inválida: não é possível alterar o status de 'Open' para 'Resolved'.",
            exception.Message);
        Assert.Equal(EnumDenunciationStatus.Open, denunciation.Status);
    }

    [Fact]
    public void UpdateStatus_ToTheStatusItAlreadyCarries_NamesTheCurrentStatus()
    {
        Denunciation denunciation = CreateDenunciation();

        InvalidDenunciationStatusTransitionException exception =
            Assert.Throws<InvalidDenunciationStatusTransitionException>(
                () => denunciation.UpdateStatus(EnumDenunciationStatus.Open));

        Assert.Equal("A denúncia já se encontra no status 'Open'.", exception.Message);
        Assert.Null(denunciation.UpdatedAt);
    }

    [Theory]
    [InlineData(EnumDenunciationStatus.Open)]
    [InlineData(EnumDenunciationStatus.InReview)]
    [InlineData(EnumDenunciationStatus.Resolved)]
    public void UpdateStatus_FromATerminalStatus_IsRefused(EnumDenunciationStatus newStatus)
    {
        Denunciation denunciation = CreateDenunciation();
        denunciation.UpdateStatus(EnumDenunciationStatus.Dismissed);

        Assert.Throws<InvalidDenunciationStatusTransitionException>(
            () => denunciation.UpdateStatus(newStatus));
    }

    [Fact]
    public void UpdateStatus_WithAStatusOutsideTheEnum_IsRefused()
    {
        Denunciation denunciation = CreateDenunciation();

        InvalidDenunciationStatusException exception =
            Assert.Throws<InvalidDenunciationStatusException>(
                () => denunciation.UpdateStatus((EnumDenunciationStatus)99));

        Assert.Equal("O status informado para a denúncia é inválido.", exception.Message);
    }
}
