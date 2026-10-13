namespace FateConnect.Api.Modules.Storage.Services;

using Microsoft.Extensions.Logging;

public partial class StorageService
{
    [LoggerMessage(EventId = 1, Level = LogLevel.Warning, Message = "Stored image {FilePath} could not be removed and was left behind.")]
    private static partial void LogImageDeletionFailed(ILogger logger, string filePath, Exception exception);

    [LoggerMessage(EventId = 2, Level = LogLevel.Information, Message = "Image {FilePath} stored, with its thumbnail.")]
    private static partial void LogImageStored(ILogger logger, string filePath);

    [LoggerMessage(EventId = 3, Level = LogLevel.Information, Message = "Image {FilePath} removed, with its thumbnail.")]
    private static partial void LogImageRemoved(ILogger logger, string filePath);
}
