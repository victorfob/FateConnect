namespace FateConnect.Api.Modules.LostAndFound.Services;

using Microsoft.Extensions.Logging;

public partial class LostAndFoundService
{
    [LoggerMessage(Level = LogLevel.Information, Message = "Registro de Achados e Perdidos {RecordId} criado com sucesso.")]
    private static partial void LogRecordCreated(ILogger logger, Guid recordId);

    [LoggerMessage(Level = LogLevel.Information, Message = "Recuperados {Count} registros de Achados e Perdidos.")]
    private static partial void LogRecordsRetrieved(ILogger logger, int count);

    [LoggerMessage(Level = LogLevel.Warning, Message = "Registro de Achados e Perdidos {RecordId} não encontrado.")]
    private static partial void LogRecordNotFound(ILogger logger, Guid recordId);

    [LoggerMessage(Level = LogLevel.Information, Message = "Registro de Achados e Perdidos {RecordId} encontrado.")]
    private static partial void LogRecordFound(ILogger logger, Guid recordId);

    [LoggerMessage(Level = LogLevel.Information, Message = "Registro de Achados e Perdidos {RecordId} atualizado.")]
    private static partial void LogRecordUpdated(ILogger logger, Guid recordId);

    [LoggerMessage(Level = LogLevel.Warning, Message = "Falha ao desativar registro. Registro {RecordId} não encontrado.")]
    private static partial void LogRecordDeactivationFailed(ILogger logger, Guid recordId);

    [LoggerMessage(Level = LogLevel.Information, Message = "Registro de Achados e Perdidos {RecordId} desativado com sucesso.")]
    private static partial void LogRecordDeactivated(ILogger logger, Guid recordId);

    [LoggerMessage(Level = LogLevel.Warning, Message = "Usuário {UserId} tentou alterar o registro {RecordId} sem ser o autor.")]
    private static partial void LogRecordChangeRefused(ILogger logger, int userId, Guid recordId);
}
