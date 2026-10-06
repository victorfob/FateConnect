namespace FateConnect.Api.Modules.Auth.Services;

using Microsoft.Extensions.Logging;
using System;

public partial class TokenService
{
    [LoggerMessage(Level = LogLevel.Debug, Message = "Token JWT emitido internamente para o usuário de ID {UserId}. Expiração: {ExpirationDate} UTC.")]
    private static partial void LogJwtTokenGenerated(ILogger logger, int userId, DateTime expirationDate);
}
