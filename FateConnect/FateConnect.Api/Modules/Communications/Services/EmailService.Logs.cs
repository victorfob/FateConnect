namespace FateConnect.Api.Modules.Communications.Services;

using Microsoft.Extensions.Logging;

public partial class EmailService
{
    [LoggerMessage(Level = LogLevel.Debug, Message = "Sending payload to Resend API. Subject: '{Subject}'")]
    private static partial void LogResendPayloadSent(ILogger logger, string subject);

    [LoggerMessage(Level = LogLevel.Debug, Message = "Resend API accepted the email. Subject: '{Subject}'")]
    private static partial void LogResendAccepted(ILogger logger, string subject);
}
