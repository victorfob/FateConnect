namespace FateConnect.Api.Modules.Communications.Services;

using Microsoft.Extensions.Logging;

public partial class EmailService
{
    [LoggerMessage(Level = LogLevel.Debug, Message = "Enviando payload para a API do Resend. Destinatário: {ToEmail}, Assunto: '{Subject}'")]
    private static partial void LogResendPayloadSent(ILogger logger, string toEmail, string subject);

    [LoggerMessage(Level = LogLevel.Debug, Message = "A API do Resend aceitou o e-mail para: {ToEmail}")]
    private static partial void LogResendAccepted(ILogger logger, string toEmail);
}
