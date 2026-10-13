using FateConnect.Api.Modules.Common.Exceptions;
using FateConnect.Api.Modules.LostAndFound.Entities;
using FateConnect.Api.Modules.LostAndFound.Enums;
using FateConnect.Api.Modules.LostAndFound.Exceptions;

namespace FateConnect.Api.Tests.LostAndFound;

public class LostAndFoundRecordTests
{
    private const int ReporterId = 7;

    private static readonly DateOnly Yesterday = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(-1));

    private static LostAndFoundRecord NewRecord(
        string name = "Garrafa térmica azul",
        EnumLostAndFoundType type = EnumLostAndFoundType.Lost,
        string place = "Biblioteca do bloco B",
        string? description = "Ficou na mesa do fundo.") =>
        new(name, type, place, Yesterday, description, ReporterId, DateTime.UtcNow);

    [Fact]
    public void Constructor_WithValidData_StartsOpenAndWithoutDeletionReason()
    {
        LostAndFoundRecord record = NewRecord();

        Assert.NotEqual(Guid.Empty, record.Id);
        Assert.Equal(EnumLostAndFoundStatus.Open, record.Status);
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
            ReporterId, DateTime.UtcNow);

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
            ReporterId, DateTime.UtcNow));
    }

    [Fact]
    public void Constructor_WithATypeOutsideTheEnum_IsRejected()
    {
        Assert.Throws<InvalidLostAndFoundTypeException>(() => NewRecord(type: (EnumLostAndFoundType)99));
    }

    [Fact]
    public void Constructor_WithoutAnIdentifiedReporter_IsRejected()
    {
        Assert.Throws<InvalidUserIdentifierException>(() => new LostAndFoundRecord(
            "Garrafa térmica azul",
            EnumLostAndFoundType.Lost,
            "Biblioteca do bloco B",
            Yesterday,
            null,
            0, DateTime.UtcNow));
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
            EnumLostAndFoundStatus.Resolved, DateTime.UtcNow);

        record.AttachImage("uploads/lostandfound/outra.png");

        Assert.Equal("Guarda-chuva preto", record.Name);
        Assert.Equal(EnumLostAndFoundType.Found, record.LostAndFoundType);
        Assert.Equal("Cantina", record.Place);
        Assert.Equal(lastWeek, record.OccurredOn);
        Assert.Equal("Estava embaixo da mesa.", record.Description);
        Assert.Equal(EnumLostAndFoundStatus.Resolved, record.Status);
        Assert.Equal("uploads/lostandfound/outra.png", record.ImageUrl);
        Assert.NotNull(record.UpdatedAt);
    }

    [Fact]
    public void UpdateBasicAttributes_WithoutAnyField_KeepsWhatWasThere()
    {
        LostAndFoundRecord record = NewRecord();

        record.UpdateBasicAttributes(null, null, null, null, null, null, DateTime.UtcNow);

        Assert.Equal("Garrafa térmica azul", record.Name);
        Assert.Equal(EnumLostAndFoundType.Lost, record.LostAndFoundType);
        Assert.Equal("Biblioteca do bloco B", record.Place);
        Assert.Equal("Ficou na mesa do fundo.", record.Description);
        Assert.Equal(EnumLostAndFoundStatus.Open, record.Status);
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
            1, DateTime.UtcNow));
    }

    [Fact]
    public void UpdateBasicAttributes_WithoutAnOccurrenceDate_IsRejected()
    {
        LostAndFoundRecord record = NewRecord();

        Assert.Throws<MissingOccurrenceDateException>(
            () => record.UpdateBasicAttributes(null, null, null, default(DateOnly), null, null, DateTime.UtcNow));
    }

    [Fact]
    public void UpdateBasicAttributes_WithAnUnusableName_IsRejected()
    {
        LostAndFoundRecord record = NewRecord();

        Assert.Throws<InvalidLostAndFoundNameException>(
            () => record.UpdateBasicAttributes("ab", null, null, null, null, null, DateTime.UtcNow));
    }

    [Fact]
    public void UpdateBasicAttributes_WithAnUnusablePlace_IsRejected()
    {
        LostAndFoundRecord record = NewRecord();

        Assert.Throws<InvalidLostAndFoundPlaceException>(
            () => record.UpdateBasicAttributes(null, null, "ab", null, null, null, DateTime.UtcNow));
    }

    [Fact]
    public void UpdateBasicAttributes_WithAnOccurrenceInTheFuture_IsRejected()
    {
        LostAndFoundRecord record = NewRecord();
        DateOnly tomorrow = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(2));

        Assert.Throws<InvalidOccurrenceDateException>(
            () => record.UpdateBasicAttributes(null, null, null, tomorrow, null, null, DateTime.UtcNow));
    }

    [Fact]
    public void UpdateBasicAttributes_WithATypeOutsideTheEnum_IsRejected()
    {
        LostAndFoundRecord record = NewRecord();

        Assert.Throws<InvalidLostAndFoundTypeException>(
            () => record.UpdateBasicAttributes(null, (EnumLostAndFoundType)99, null, null, null, null, DateTime.UtcNow));
    }

    [Fact]
    public void UpdateBasicAttributes_WithAStatusOutsideTheEnum_IsRejected()
    {
        LostAndFoundRecord record = NewRecord();

        Assert.Throws<InvalidLostAndFoundStatusException>(
            () => record.UpdateBasicAttributes(null, null, null, null, null, (EnumLostAndFoundStatus)99, DateTime.UtcNow));
    }

    [Fact]
    public void MarkAsDeleted_RecordsTheReasonAlongsideTheStatus()
    {
        LostAndFoundRecord record = NewRecord();

        record.MarkAsDeleted(EnumDeletionReason.User, DateTime.UtcNow);

        Assert.Equal(EnumLostAndFoundStatus.Deleted, record.Status);
        Assert.Equal(EnumDeletionReason.User, record.DeletionReason);
        Assert.NotNull(record.UpdatedAt);
        Assert.Equal(record.UpdatedAt, record.StatusChangedAt);
    }

    [Fact]
    public void Constructor_LeavesTheRecordWithoutAStatusStamp()
    {
        LostAndFoundRecord record = NewRecord();

        Assert.Null(record.StatusChangedAt);
    }

    [Theory]
    [InlineData(EnumLostAndFoundStatus.Resolved)]
    [InlineData(EnumLostAndFoundStatus.Deleted)]
    public void UpdateBasicAttributes_ReachingATerminalStatus_StampsTheChange(EnumLostAndFoundStatus status)
    {
        LostAndFoundRecord record = NewRecord();

        record.UpdateBasicAttributes(null, null, null, null, null, status, DateTime.UtcNow);

        Assert.NotNull(record.StatusChangedAt);
    }

    [Theory]
    [InlineData(EnumLostAndFoundStatus.Resolved)]
    [InlineData(EnumLostAndFoundStatus.Deleted)]
    public void UpdateBasicAttributes_ReopeningARecord_ClearsTheStatusStamp(EnumLostAndFoundStatus terminalStatus)
    {
        LostAndFoundRecord record = NewRecord();
        record.UpdateBasicAttributes(null, null, null, null, null, terminalStatus, DateTime.UtcNow);

        record.UpdateBasicAttributes(null, null, null, null, null, EnumLostAndFoundStatus.Open, DateTime.UtcNow);

        Assert.Equal(EnumLostAndFoundStatus.Open, record.Status);
        Assert.Null(record.StatusChangedAt);
    }

    [Fact]
    public void DetachImage_LeavesTheRecordWithoutAnImage()
    {
        LostAndFoundRecord record = NewRecord();
        record.AttachImage("uploads/lostandfound/foto.png");

        record.DetachImage();

        Assert.Null(record.ImageUrl);
    }

    [Theory]
    [InlineData(EnumLostAndFoundStatus.Open)]
    [InlineData(EnumLostAndFoundStatus.Resolved)]
    public void UpdateBasicAttributes_LeavingDeleted_ClearsTheDeletionReason(EnumLostAndFoundStatus status)
    {
        LostAndFoundRecord record = NewRecord();
        record.MarkAsDeleted(EnumDeletionReason.Inactivity, DateTime.UtcNow);

        record.UpdateBasicAttributes(null, null, null, null, null, status, DateTime.UtcNow);

        Assert.Equal(status, record.Status);
        Assert.Null(record.DeletionReason);
    }

    [Fact]
    public void UpdateBasicAttributes_ReachingDeleted_RecordsTheReasonItSelf()
    {
        LostAndFoundRecord record = NewRecord();

        record.UpdateBasicAttributes(null, null, null, null, null, EnumLostAndFoundStatus.Deleted, DateTime.UtcNow);

        Assert.Equal(EnumLostAndFoundStatus.Deleted, record.Status);
        Assert.Equal(EnumDeletionReason.User, record.DeletionReason);
    }
}
