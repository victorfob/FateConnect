using FateConnect.Api.Modules.LostAndFound.Entities;
using FateConnect.Api.Modules.LostAndFound.Enums;
using FateConnect.Api.Modules.LostAndFound.Exceptions;

namespace FateConnect.Api.Tests;

public class LostAndFoundRecordTests
{
    private const int ReporterId = 7;

    private static readonly DateOnly Yesterday = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(-1));

    private static LostAndFoundRecord NewRecord(
        string name = "Garrafa térmica azul",
        EnumLostAndFoundType type = EnumLostAndFoundType.Lost,
        string place = "Biblioteca do bloco B",
        string? description = "Ficou na mesa do fundo.") =>
        new(name, type, place, Yesterday, description, ReporterId);

    [Fact]
    public void Constructor_WithValidData_StartsOpenAndWithoutDeletionReason()
    {
        LostAndFoundRecord record = NewRecord();

        Assert.NotEqual(Guid.Empty, record.Id);
        Assert.Equal(EnumStatusLostAndFound.Open, record.Status);
        Assert.Null(record.DeletionReason);
        Assert.Null(record.UpdatedAt);
        Assert.True(record.IsReportedBy(ReporterId));
        Assert.False(record.IsReportedBy(ReporterId + 1));
    }

    [Fact]
    public void Constructor_TrimsTheTextItReceives()
    {
        LostAndFoundRecord record = new(
            "  Garrafa térmica azul  ",
            EnumLostAndFoundType.Lost,
            "  Biblioteca do bloco B  ",
            Yesterday,
            "  Ficou na mesa do fundo.  ",
            ReporterId);

        record.AttachImage("  uploads/lostandfound/foto.png  ");

        Assert.Equal("Garrafa térmica azul", record.Name);
        Assert.Equal("Biblioteca do bloco B", record.Place);
        Assert.Equal("Ficou na mesa do fundo.", record.Description);
        Assert.Equal("uploads/lostandfound/foto.png", record.ImageUrl);
    }

    [Fact]
    public void Constructor_WithoutDescription_KeepsItNull()
    {
        LostAndFoundRecord record = NewRecord(description: null);

        Assert.Null(record.Description);
        Assert.Null(record.ImageUrl);
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    [InlineData("ab")]
    public void Constructor_WithAnUnusableName_IsRejected(string name)
    {
        Assert.Throws<InvalidLostAndFoundNameException>(() => NewRecord(name: name));
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    [InlineData("ab")]
    public void Constructor_WithAnUnusablePlace_IsRejected(string place)
    {
        Assert.Throws<InvalidLostAndFoundPlaceException>(() => NewRecord(place: place));
    }

    [Fact]
    public void Constructor_WithAnOccurrenceInTheFuture_IsRejected()
    {
        DateOnly tomorrow = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(2));

        Assert.Throws<InvalidOccurrenceDateException>(() => new LostAndFoundRecord(
            "Garrafa térmica azul",
            EnumLostAndFoundType.Lost,
            "Biblioteca do bloco B",
            tomorrow,
            null,
            ReporterId));
    }

    [Fact]
    public void Constructor_WithATypeOutsideTheEnum_IsRejected()
    {
        Assert.Throws<InvalidLostAndFoundTypeException>(() => NewRecord(type: (EnumLostAndFoundType)99));
    }

    [Fact]
    public void Constructor_WithoutAnIdentifiedReporter_IsRejected()
    {
        Assert.Throws<InvalidReporterException>(() => new LostAndFoundRecord(
            "Garrafa térmica azul",
            EnumLostAndFoundType.Lost,
            "Biblioteca do bloco B",
            Yesterday,
            null,
            0));
    }

    [Fact]
    public void UpdateBasicAttributes_WithEveryField_ReplacesThemAndStampsTheUpdate()
    {
        LostAndFoundRecord record = NewRecord();
        DateOnly lastWeek = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(-7));

        record.UpdateBasicAttributes(
            "Guarda-chuva preto",
            EnumLostAndFoundType.Found,
            "Cantina",
            lastWeek,
            "Estava embaixo da mesa.",
            EnumStatusLostAndFound.Resolved);

        record.AttachImage("uploads/lostandfound/outra.png");

        Assert.Equal("Guarda-chuva preto", record.Name);
        Assert.Equal(EnumLostAndFoundType.Found, record.LostAndFoundType);
        Assert.Equal("Cantina", record.Place);
        Assert.Equal(lastWeek, record.OcurredOn);
        Assert.Equal("Estava embaixo da mesa.", record.Description);
        Assert.Equal(EnumStatusLostAndFound.Resolved, record.Status);
        Assert.Equal("uploads/lostandfound/outra.png", record.ImageUrl);
        Assert.NotNull(record.UpdatedAt);
    }

    [Fact]
    public void UpdateBasicAttributes_WithoutAnyField_KeepsWhatWasThere()
    {
        LostAndFoundRecord record = NewRecord();

        record.UpdateBasicAttributes(null, null, null, null, null, null);

        Assert.Equal("Garrafa térmica azul", record.Name);
        Assert.Equal(EnumLostAndFoundType.Lost, record.LostAndFoundType);
        Assert.Equal("Biblioteca do bloco B", record.Place);
        Assert.Equal("Ficou na mesa do fundo.", record.Description);
        Assert.Equal(EnumStatusLostAndFound.Open, record.Status);
        Assert.Null(record.UpdatedAt);
    }

    [Fact]
    public void Constructor_WithoutAnOccurrenceDate_IsRejected()
    {
        Assert.Throws<MissingOccurrenceDateException>(() => new LostAndFoundRecord(
            "Garrafa térmica azul",
            EnumLostAndFoundType.Lost,
            "Biblioteca do bloco B",
            default,
            null,
            1));
    }

    [Fact]
    public void UpdateBasicAttributes_WithoutAnOccurrenceDate_IsRejected()
    {
        LostAndFoundRecord record = NewRecord();

        Assert.Throws<MissingOccurrenceDateException>(
            () => record.UpdateBasicAttributes(null, null, null, default(DateOnly), null, null));
    }

    [Fact]
    public void UpdateBasicAttributes_WithAnUnusableName_IsRejected()
    {
        LostAndFoundRecord record = NewRecord();

        Assert.Throws<InvalidLostAndFoundNameException>(
            () => record.UpdateBasicAttributes("ab", null, null, null, null, null));
    }

    [Fact]
    public void UpdateBasicAttributes_WithAnUnusablePlace_IsRejected()
    {
        LostAndFoundRecord record = NewRecord();

        Assert.Throws<InvalidLostAndFoundPlaceException>(
            () => record.UpdateBasicAttributes(null, null, "ab", null, null, null));
    }

    [Fact]
    public void UpdateBasicAttributes_WithAnOccurrenceInTheFuture_IsRejected()
    {
        LostAndFoundRecord record = NewRecord();
        DateOnly tomorrow = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(2));

        Assert.Throws<InvalidOccurrenceDateException>(
            () => record.UpdateBasicAttributes(null, null, null, tomorrow, null, null));
    }

    [Fact]
    public void UpdateBasicAttributes_WithATypeOutsideTheEnum_IsRejected()
    {
        LostAndFoundRecord record = NewRecord();

        Assert.Throws<InvalidLostAndFoundTypeException>(
            () => record.UpdateBasicAttributes(null, (EnumLostAndFoundType)99, null, null, null, null));
    }

    [Fact]
    public void UpdateBasicAttributes_WithAStatusOutsideTheEnum_IsRejected()
    {
        LostAndFoundRecord record = NewRecord();

        Assert.Throws<InvalidLostAndFoundStatusException>(
            () => record.UpdateBasicAttributes(null, null, null, null, null, (EnumStatusLostAndFound)99));
    }

    [Fact]
    public void MarkAsDeleted_RecordsTheReasonAlongsideTheStatus()
    {
        LostAndFoundRecord record = NewRecord();

        record.MarkAsDeleted(EnumDeletionReason.User);

        Assert.Equal(EnumStatusLostAndFound.Deleted, record.Status);
        Assert.Equal(EnumDeletionReason.User, record.DeletionReason);
        Assert.NotNull(record.UpdatedAt);
    }

    [Theory]
    [InlineData(EnumStatusLostAndFound.Open)]
    [InlineData(EnumStatusLostAndFound.Resolved)]
    public void UpdateBasicAttributes_LeavingDeleted_ClearsTheDeletionReason(EnumStatusLostAndFound status)
    {
        LostAndFoundRecord record = NewRecord();
        record.MarkAsDeleted(EnumDeletionReason.Inactivity);

        record.UpdateBasicAttributes(null, null, null, null, null, status);

        Assert.Equal(status, record.Status);
        Assert.Null(record.DeletionReason);
    }

    [Fact]
    public void UpdateBasicAttributes_ReachingDeleted_RecordsTheReasonItSelf()
    {
        LostAndFoundRecord record = NewRecord();

        record.UpdateBasicAttributes(null, null, null, null, null, EnumStatusLostAndFound.Deleted);

        Assert.Equal(EnumStatusLostAndFound.Deleted, record.Status);
        Assert.Equal(EnumDeletionReason.User, record.DeletionReason);
    }
}
