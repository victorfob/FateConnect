namespace FateConnect.Api.Modules.LostAndFound.Workers;

using Microsoft.Extensions.Logging;

public sealed partial class LostAndFoundRetentionWorker
{
    [LoggerMessage(
        EventId = 1,
        Level = LogLevel.Information,
        Message = "The lost and found retention sweep loop stopped with the host.")]
    private static partial void LogSweepLoopStopped(ILogger logger);

    [LoggerMessage(
        EventId = 2,
        Level = LogLevel.Error,
        Message = "A lost and found retention sweep cycle failed and the loop kept running.")]
    private static partial void LogSweepFailed(ILogger logger, Exception exception);
}
