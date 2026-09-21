namespace FateConnect.Api.Modules.Denunciations.Services;

using Microsoft.Extensions.Logging;
using System;

public partial class DenunciationService
{
    [LoggerMessage(Level = LogLevel.Information, Message = "Denunciation {DenunciationId} created successfully.")]
    private static partial void LogDenunciationCreated(ILogger logger, Guid denunciationId);

    [LoggerMessage(Level = LogLevel.Information, Message = "{DenunciationsCount} denunciations retrieved successfully.")]
    private static partial void LogDenunciationsRetrieved(ILogger logger, int denunciationsCount);

    [LoggerMessage(Level = LogLevel.Warning, Message = "Denunciation {DenunciationId} not found.")]
    private static partial void LogDenunciationNotFound(ILogger logger, Guid denunciationId);

    [LoggerMessage(Level = LogLevel.Information, Message = "Denunciation {DenunciationId} found.")]
    private static partial void LogDenunciationFound(ILogger logger, Guid denunciationId);

    [LoggerMessage(Level = LogLevel.Information, Message = "Denunciation {DenunciationId} status updated to {Status} successfully.")]
    private static partial void LogDenunciationStatusUpdated(ILogger logger, Guid denunciationId, string status);

    [LoggerMessage(Level = LogLevel.Warning, Message = "User {UserId} was refused the image of denunciation {DenunciationId}.")]
    private static partial void LogDenunciationImageRefused(ILogger logger, int userId, Guid denunciationId);
}
