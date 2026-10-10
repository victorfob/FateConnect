namespace FateConnect.Api.Modules.Auth.Services;

using Microsoft.Extensions.Logging;
using System;

public partial class TokenService
{
    [LoggerMessage(Level = LogLevel.Debug, Message = "JWT token internally issued for user ID {UserId}. Expiration: {ExpirationDate} UTC.")]
    private static partial void LogJwtTokenGenerated(ILogger logger, int userId, DateTime expirationDate);
}
