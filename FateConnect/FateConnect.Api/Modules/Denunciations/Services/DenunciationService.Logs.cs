namespace FateConnect.Api.Modules.Denunciations.Services;

using Microsoft.Extensions.Logging;
using System;

public partial class DenunciationService
{
    [LoggerMessage(Level = LogLevel.Information, Message = "Denunciation record {RecordId} created successfully.")]
    private static partial void LogRecordCreated(ILogger logger, Guid recordId);

    [LoggerMessage(Level = LogLevel.Information, Message = "{Count} denunciation records retrieved successfully.")]
    private static partial void LogRecordsRetrieved(ILogger logger, int count);

    [LoggerMessage(Level = LogLevel.Warning, Message = "Denunciation record {RecordId} not found.")]
    private static partial void LogRecordNotFound(ILogger logger, Guid recordId);

    [LoggerMessage(Level = LogLevel.Information, Message = "Denunciation record {RecordId} found.")]
    private static partial void LogRecordFound(ILogger logger, Guid recordId);

    [LoggerMessage(Level = LogLevel.Information, Message = "Denunciation record {RecordId} status updated to {Status} successfully.")]
    private static partial void LogRecordStatusUpdated(ILogger logger, Guid recordId, string status);
}
