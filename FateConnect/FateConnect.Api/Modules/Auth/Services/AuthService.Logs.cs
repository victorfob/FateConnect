namespace FateConnect.Api.Modules.Auth.Services;

using Microsoft.Extensions.Logging;

public partial class AuthService
{
    [LoggerMessage(Level = LogLevel.Information, Message = "O usuário de ID {UserId} confirmou o e-mail com sucesso.")]
    private static partial void LogEmailConfirmed(ILogger logger, int userId);

    [LoggerMessage(Level = LogLevel.Information, Message = "O usuário de ID {UserId} iniciou uma nova sessão com sucesso.")]
    private static partial void LogUserLoggedIn(ILogger logger, int userId);

    [LoggerMessage(Level = LogLevel.Information, Message = "O usuário de ID {UserId} encerrou a sessão (Logout).")]
    private static partial void LogUserLoggedOut(ILogger logger, int userId);

    [LoggerMessage(Level = LogLevel.Information, Message = "O usuário de ID {UserId} reativou a conta e iniciou a sessão.")]
    private static partial void LogUserReactivated(ILogger logger, int userId);
}
