namespace FateConnect.Api.Modules.LostAndFound.Services;

using Microsoft.Extensions.Logging;

public sealed partial class LostAndFoundRetentionWorker
{
    [LoggerMessage(Level = LogLevel.Information, Message = "The lost and found retention sweep loop stopped with the host.")]
    private static partial void LogSweepLoopStopped(ILogger logger);

    [LoggerMessage(Level = LogLevel.Error, Message = "A lost and found retention sweep cycle failed and the loop kept running.")]
    private static partial void LogSweepFailed(ILogger logger, Exception exception);
}
