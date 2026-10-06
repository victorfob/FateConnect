namespace FateConnect.Api.Modules.Communications.Services;

using FateConnect.Api.Modules.Communications.Exceptions;
using FateConnect.Api.Modules.Communications.Interfaces;
using FateConnect.Api.Modules.Communications.Templates;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Resend;
using System.Threading.Tasks;

public partial class EmailService(
    IResend resend,
    IConfiguration configuration,
    ILogger<EmailService> logger
) : IEmailService
{
    private readonly string _senderEmail = configuration["EMAIL_SENDER"]
        ?? throw new MissingCommunicationConfigurationException("EMAIL_SENDER");

    public async Task SendConfirmationEmailAsync(string toEmail, string fullName, string confirmationLink)
    {
        var subject = "Confirme sua conta no FateConnect";

        var message = new EmailMessage
        {
            From = _senderEmail,
            To = toEmail,
            Subject = subject,
            HtmlBody = ConfirmationEmailTemplate.Build(fullName, confirmationLink)
        };

        LogResendPayloadSent(logger, toEmail, subject);

        await resend.EmailSendAsync(message);

        LogResendAccepted(logger, toEmail);
    }
}
