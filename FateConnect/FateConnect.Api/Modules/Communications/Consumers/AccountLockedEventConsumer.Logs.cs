namespace FateConnect.Api.Modules.Communications.Consumers;

using Microsoft.Extensions.Logging;

public sealed partial class AccountLockedEventConsumer
{
    [LoggerMessage(EventId = 1, Level = LogLevel.Information, Message = "Iniciando envio de e-mail de bloqueio para {Email}.")]
    private static partial void LogAccountLockedDispatchStarted(ILogger logger, string email);

    [LoggerMessage(EventId = 2, Level = LogLevel.Information, Message = "E-mail de bloqueio enviado com sucesso para {Email}.")]
    private static partial void LogAccountLockedDispatchSucceeded(ILogger logger, string email);

    [LoggerMessage(EventId = 3, Level = LogLevel.Error, Message = "Falha ao enviar e-mail de bloqueio para {Email}.")]
    private static partial void LogAccountLockedDispatchFailed(ILogger logger, Exception ex, string email);
}
