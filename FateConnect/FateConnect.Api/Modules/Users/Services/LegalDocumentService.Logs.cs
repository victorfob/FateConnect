namespace FateConnect.Api.Modules.Users.Services;

using FateConnect.Api.Modules.Users.Enums;
using Microsoft.Extensions.Logging;

public partial class LegalDocumentService
{
    [LoggerMessage(
        EventId = 1,
        Level = LogLevel.Information,
        Message = "User ID {UserId} accepted {Document} version {Version}.")]
    private static partial void LogDocumentAccepted(
        ILogger logger,
        int userId,
        EnumDocumentType document,
        string version);

    [LoggerMessage(EventId = 2, Level = LogLevel.Warning, Message = "User ID {UserId} not found.")]
    private static partial void LogUserNotFound(ILogger logger, int userId);
}
