namespace FateConnect.Api.Modules.Communications.Services;

using System;
using System.Threading.Tasks;
using FateConnect.Api.Modules.Common.Utils;
using FateConnect.Api.Modules.Communications.Enums;
using FateConnect.Api.Modules.Communications.Exceptions;
using FateConnect.Api.Modules.Communications.Extensions;
using FateConnect.Api.Modules.Communications.Interfaces;
using FateConnect.Api.Modules.Communications.Templates;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Resend;

public partial class EmailService(
    IResend resend,
    IConfiguration configuration,
    TimeProvider clock,
    ILogger<EmailService> logger
) : IEmailService
{
    private readonly string _senderEmail = configuration["EMAIL_SENDER"]
        ?? throw new MissingCommunicationConfigurationException("EMAIL_SENDER");

    private readonly string _logoUrl = configuration.RequiredPublicUrl() + EmailTheme.LogoPath;

    public async Task SendAsync(EnumAccountEmail email, string toEmail, string fullName, string link)
    {
        AccountEmail content = AccountEmails.For(email);
        int year = DateTimeUtils.NowInProductTimeZone(clock).Year;

        var message = new EmailMessage
        {
            From = _senderEmail,
            To = toEmail,
            Subject = content.Subject,
            HtmlBody = EmailLayout.Html(content, fullName, link, _logoUrl, year),
            TextBody = EmailLayout.Text(content, fullName, link, year)
        };

        LogResendPayloadSent(logger, content.Subject);

        await resend.EmailSendAsync(message);

        LogResendAccepted(logger, content.Subject);
    }
}
