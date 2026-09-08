namespace FateConnect.Api.Modules.Common.Services;

using Microsoft.Extensions.Logging;

public partial class StorageService
{
    [LoggerMessage(Level = LogLevel.Warning, Message = "Stored image {FilePath} could not be removed and was left behind.")]
    private static partial void LogImageDeletionFailed(ILogger logger, string filePath, Exception exception);
}
