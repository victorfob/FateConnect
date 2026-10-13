namespace FateConnect.Api.Modules.LostAndFound.Services;

using Microsoft.Extensions.Logging;

public partial class LostAndFoundRetentionService
{
    [LoggerMessage(EventId = 1, Level = LogLevel.Information, Message = "{ArchivedCount} inactive lost and found records were archived.")]
    private static partial void LogInactiveRecordsArchived(ILogger logger, int archivedCount);

    [LoggerMessage(EventId = 2, Level = LogLevel.Information, Message = "{RemovedCount} lost and found images past the retention window were removed.")]
    private static partial void LogExpiredImagesRemoved(ILogger logger, int removedCount);
}
