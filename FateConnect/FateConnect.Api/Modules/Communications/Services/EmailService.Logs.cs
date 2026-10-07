namespace FateConnect.Api.Modules.Communications.Services;

using Microsoft.Extensions.Logging;

public partial class EmailService
{
    [LoggerMessage(Level = LogLevel.Debug, Message = "Sending payload to Resend API. Recipient: {ToEmail}, Subject: '{Subject}'")]
    private static partial void LogResendPayloadSent(ILogger logger, string toEmail, string subject);

    [LoggerMessage(Level = LogLevel.Debug, Message = "Resend API accepted the email to: {ToEmail}")]
    private static partial void LogResendAccepted(ILogger logger, string toEmail);
}
