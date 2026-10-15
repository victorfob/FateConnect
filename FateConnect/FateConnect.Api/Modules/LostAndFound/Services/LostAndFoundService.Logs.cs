namespace FateConnect.Api.Modules.LostAndFound.Services;

using Microsoft.Extensions.Logging;

public partial class LostAndFoundService
{
    [LoggerMessage(
        EventId = 1,
        Level = LogLevel.Information,
        Message = "Lost and found record {RecordId} created successfully.")]
    private static partial void LogRecordCreated(ILogger logger, Guid recordId);

    [LoggerMessage(
        EventId = 2,
        Level = LogLevel.Information,
        Message = "{Count} lost and found records retrieved successfully.")]
    private static partial void LogRecordsRetrieved(ILogger logger, int count);

    [LoggerMessage(EventId = 3, Level = LogLevel.Warning, Message = "Lost and found record {RecordId} not found.")]
    private static partial void LogRecordNotFound(ILogger logger, Guid recordId);

    [LoggerMessage(EventId = 4, Level = LogLevel.Information, Message = "Lost and found record {RecordId} found.")]
    private static partial void LogRecordFound(ILogger logger, Guid recordId);

    [LoggerMessage(
        EventId = 5,
        Level = LogLevel.Information,
        Message = "Lost and found record {RecordId} updated successfully.")]
    private static partial void LogRecordUpdated(ILogger logger, Guid recordId);

    [LoggerMessage(
        EventId = 6,
        Level = LogLevel.Warning,
        Message = "Lost and found record {RecordId} was already deleted or not found.")]
    private static partial void LogRecordDeletionFailed(ILogger logger, Guid recordId);

    [LoggerMessage(
        EventId = 7,
        Level = LogLevel.Information,
        Message = "Lost and found record {RecordId} deleted successfully.")]
    private static partial void LogRecordDeleted(ILogger logger, Guid recordId);

    [LoggerMessage(
        EventId = 8,
        Level = LogLevel.Warning,
        Message = "User ID {UserId} tried to change lost and found record {RecordId}, reported by another user.")]
    private static partial void LogRecordChangeRefused(ILogger logger, int userId, Guid recordId);

    [LoggerMessage(
        EventId = 9,
        Level = LogLevel.Information,
        Message = "Lost and found record {RecordId} removed by the administrator with user ID {UserId}.")]
    private static partial void LogRecordRemoved(ILogger logger, Guid recordId, int userId);
}
