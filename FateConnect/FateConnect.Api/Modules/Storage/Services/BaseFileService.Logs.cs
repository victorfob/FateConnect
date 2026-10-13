namespace FateConnect.Api.Modules.Storage.Services;

using Microsoft.Extensions.Logging;

public abstract partial class BaseFileService
{
    [LoggerMessage(EventId = 1, Level = LogLevel.Warning, Message = "Saving failed, so the image {FilePath} stored for it is being removed.")]
    private static partial void LogImageDroppedAfterFailedSave(ILogger logger, string filePath);
}
