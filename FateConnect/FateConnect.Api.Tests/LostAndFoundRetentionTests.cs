using FateConnect.Api.Infrastructure.Database;
using FateConnect.Api.Modules.Common.Services;
using FateConnect.Api.Modules.LostAndFound.Entities;
using FateConnect.Api.Modules.LostAndFound.Enums;
using FateConnect.Api.Modules.LostAndFound.Repositories;
using FateConnect.Api.Modules.LostAndFound.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging.Abstractions;

namespace FateConnect.Api.Tests;

public sealed class LostAndFoundRetentionTests : IClassFixture<ApiFactory>, IDisposable
{
    private const int InactivityDays = 60;
    private const int ImageRetentionDays = 30;

    private readonly ApiFactory _factory;
    private readonly int _reporterId;
    private readonly DateTime _now = DateTime.UtcNow;

    private readonly string _webRoot =
        Path.Combine(Path.GetTempPath(), $"fateconnect-retention-{Guid.NewGuid():N}");

    public LostAndFoundRetentionTests(ApiFactory factory)
    {
        _factory = factory;
        _reporterId = factory.SeedUser("Mariana Alves Rocha").Id;
    }

    public void Dispose()
    {
        if (Directory.Exists(_webRoot))
            Directory.Delete(_webRoot, recursive: true);
    }

    private DateTime DaysAgo(int days) => _now.AddDays(-days);

    private string StoredImage()
    {
        string relativePath = $"uploads/lostandfound/{Guid.NewGuid():N}.png";

        Directory.CreateDirectory(Path.Combine(_webRoot, "uploads", "lostandfound"));
        File.WriteAllText(PhysicalPathOf(relativePath), "conteudo sem valor fora desta suite");

        return relativePath;
    }

    private string PhysicalPathOf(string relativePath) =>
        Path.Combine(_webRoot, relativePath.Replace('/', Path.DirectorySeparatorChar));

    private async Task SweepAsync()
    {
        using IServiceScope scope = _factory.Services.CreateScope();
        FateConnectDbContext context = scope.ServiceProvider.GetRequiredService<FateConnectDbContext>();

        LostAndFoundRetentionService service = new(
            new LostAndFoundRepository(context),
            new StorageService(new TemporaryWebRoot(_webRoot), NullLogger<StorageService>.Instance),
            new FixedTimeProvider(_now),
            NullLogger<LostAndFoundRetentionService>.Instance);

        await service.SweepAsync();
    }

    private async Task<LostAndFoundRecord> ReloadAsync(Guid id)
    {
        using IServiceScope scope = _factory.Services.CreateScope();
        FateConnectDbContext context = scope.ServiceProvider.GetRequiredService<FateConnectDbContext>();

        return await context.LostAndFoundRecords.AsNoTracking().SingleAsync(record => record.Id == id);
    }

    [Fact]
    public async Task Sweep_WithAnOpenRecordUntouchedForOneDayLessThanTheLimit_LeavesItOpen()
    {
        Guid id = _factory.SeedLostAndFoundRecord(_reporterId, createdAt: DaysAgo(InactivityDays - 1));

        await SweepAsync();

        LostAndFoundRecord record = await ReloadAsync(id);

        Assert.Equal(EnumStatusLostAndFound.Open, record.Status);
        Assert.Null(record.DeletionReason);
        Assert.Null(record.StatusChangedAt);
    }

    [Fact]
    public async Task Sweep_WithAnOpenRecordUntouchedForTheWholeLimit_ArchivesItForInactivity()
    {
        Guid id = _factory.SeedLostAndFoundRecord(_reporterId, createdAt: DaysAgo(InactivityDays));

        await SweepAsync();

        LostAndFoundRecord record = await ReloadAsync(id);

        Assert.Equal(EnumStatusLostAndFound.Deleted, record.Status);
        Assert.Equal(EnumDeletionReason.Inactivity, record.DeletionReason);
        Assert.NotNull(record.StatusChangedAt);
    }

    [Fact]
    public async Task Sweep_WithAnOldRecordEditedRecently_CountsFromTheEditAndKeepsItOpen()
    {
        Guid id = _factory.SeedLostAndFoundRecord(
            _reporterId,
            createdAt: DaysAgo(InactivityDays * 2),
            updatedAt: DaysAgo(InactivityDays - 1));

        await SweepAsync();

        LostAndFoundRecord record = await ReloadAsync(id);

        Assert.Equal(EnumStatusLostAndFound.Open, record.Status);
    }

    [Fact]
    public async Task Sweep_WithAResolvedRecordUntouchedBeyondTheLimit_LeavesTheStatusAlone()
    {
        Guid id = _factory.SeedLostAndFoundRecord(
            _reporterId,
            EnumStatusLostAndFound.Resolved,
            createdAt: DaysAgo(InactivityDays * 2),
            statusChangedAt: DaysAgo(ImageRetentionDays - 1));

        await SweepAsync();

        LostAndFoundRecord record = await ReloadAsync(id);

        Assert.Equal(EnumStatusLostAndFound.Resolved, record.Status);
        Assert.Null(record.DeletionReason);
    }

    [Fact]
    public async Task Sweep_WithATerminalRecordOneDayBeforeTheImageLimit_KeepsTheImage()
    {
        string imageUrl = StoredImage();
        Guid id = _factory.SeedLostAndFoundRecord(
            _reporterId,
            EnumStatusLostAndFound.Resolved,
            statusChangedAt: DaysAgo(ImageRetentionDays - 1),
            imageUrl: imageUrl);

        await SweepAsync();

        LostAndFoundRecord record = await ReloadAsync(id);

        Assert.Equal(imageUrl, record.ImageUrl);
        Assert.True(File.Exists(PhysicalPathOf(imageUrl)));
    }

    [Theory]
    [InlineData(EnumStatusLostAndFound.Resolved)]
    [InlineData(EnumStatusLostAndFound.Deleted)]
    public async Task Sweep_WithATerminalRecordAtTheImageLimit_ClearsTheImageFromDiskAndFromTheRecord(
        EnumStatusLostAndFound status)
    {
        string imageUrl = StoredImage();
        Guid id = _factory.SeedLostAndFoundRecord(
            _reporterId,
            status,
            statusChangedAt: DaysAgo(ImageRetentionDays),
            imageUrl: imageUrl);

        await SweepAsync();

        LostAndFoundRecord record = await ReloadAsync(id);

        Assert.Null(record.ImageUrl);
        Assert.Equal(status, record.Status);
        Assert.False(File.Exists(PhysicalPathOf(imageUrl)));
    }

    [Fact]
    public async Task Sweep_WithATerminalRecordEditedAfterItClosed_CountsFromTheStatusChangeAndClearsTheImage()
    {
        string imageUrl = StoredImage();
        Guid id = _factory.SeedLostAndFoundRecord(
            _reporterId,
            EnumStatusLostAndFound.Resolved,
            createdAt: DaysAgo(InactivityDays),
            updatedAt: DaysAgo(1),
            statusChangedAt: DaysAgo(ImageRetentionDays),
            imageUrl: imageUrl);

        await SweepAsync();

        LostAndFoundRecord record = await ReloadAsync(id);

        Assert.Null(record.ImageUrl);
        Assert.False(File.Exists(PhysicalPathOf(imageUrl)));
    }

    [Fact]
    public async Task Sweep_ArchivingARecordWithAnImage_KeepsTheImageForTheRetentionWindow()
    {
        string imageUrl = StoredImage();
        Guid id = _factory.SeedLostAndFoundRecord(
            _reporterId,
            createdAt: DaysAgo(InactivityDays),
            imageUrl: imageUrl);

        await SweepAsync();

        LostAndFoundRecord record = await ReloadAsync(id);

        Assert.Equal(EnumDeletionReason.Inactivity, record.DeletionReason);
        Assert.Equal(imageUrl, record.ImageUrl);
        Assert.True(File.Exists(PhysicalPathOf(imageUrl)));
    }

    [Fact]
    public async Task Sweep_WithATerminalRecordWithoutAStatusStamp_LeavesTheImageAlone()
    {
        string imageUrl = StoredImage();
        Guid id = _factory.SeedLostAndFoundRecord(
            _reporterId,
            EnumStatusLostAndFound.Deleted,
            createdAt: DaysAgo(InactivityDays * 2),
            imageUrl: imageUrl);

        await SweepAsync();

        LostAndFoundRecord record = await ReloadAsync(id);

        Assert.Equal(imageUrl, record.ImageUrl);
        Assert.True(File.Exists(PhysicalPathOf(imageUrl)));
    }
}
