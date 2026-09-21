namespace FateConnect.Api.Modules.LostAndFound.Services;

using FateConnect.Api.Modules.Common.Interfaces;
using FateConnect.Api.Modules.LostAndFound.Constants;
using FateConnect.Api.Modules.LostAndFound.Entities;
using FateConnect.Api.Modules.LostAndFound.Enums;
using FateConnect.Api.Modules.LostAndFound.Interfaces;
using Microsoft.Extensions.Logging;

public partial class LostAndFoundRetentionService(
    ILostAndFoundRepository repository,
    IStorageService storageService,
    TimeProvider clock,
    ILogger<LostAndFoundRetentionService> logger
) : ILostAndFoundRetentionService
{
    public async Task SweepAsync()
    {
        DateTime now = clock.GetUtcNow().UtcDateTime;

        await ArchiveInactiveRecordsAsync(now);
        await RemoveExpiredImagesAsync(now);
    }

    private async Task ArchiveInactiveRecordsAsync(DateTime now)
    {
        DateTime untouchedSince = now - LostAndFoundRetention.InactivityBeforeArchiving;

        IReadOnlyList<LostAndFoundRecord> inactiveRecords =
            await repository.GetOpenRecordsUntouchedSinceAsync(untouchedSince);

        foreach (LostAndFoundRecord record in inactiveRecords)
            record.MarkAsDeleted(EnumDeletionReason.Inactivity);

        await repository.SaveChangesAsync();

        LogInactiveRecordsArchived(logger, inactiveRecords.Count);
    }

    private async Task RemoveExpiredImagesAsync(DateTime now)
    {
        DateTime terminalSince = now - LostAndFoundRetention.TerminalStatusBeforeImageRemoval;

        IReadOnlyList<LostAndFoundRecord> expiredRecords =
            await repository.GetTerminalRecordsWithImageSinceAsync(terminalSince);

        foreach (LostAndFoundRecord record in expiredRecords)
            await RemoveImageOfAsync(record);

        await repository.SaveChangesAsync();

        LogExpiredImagesRemoved(logger, expiredRecords.Count);
    }

    private async Task RemoveImageOfAsync(LostAndFoundRecord record)
    {
        string imageToRemove = record.ImageUrl!;

        record.DetachImage();

        await storageService.DeleteImageAsync(imageToRemove);
    }
}
