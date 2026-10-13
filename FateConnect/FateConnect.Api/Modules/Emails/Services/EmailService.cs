namespace FateConnect.Api.Modules.Emails.Services;

using FateConnect.Api.Modules.Common.Utils;
using FateConnect.Api.Modules.Emails.Enums;
using FateConnect.Api.Modules.Emails.Interfaces;
using FateConnect.Api.Modules.Emails.Options;
using FateConnect.Api.Modules.Emails.Templates;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Resend;

public partial class EmailService(
    IResend resend,
    IOptions<EmailOptions> emailOptions,
    TimeProvider clock,
    ILogger<EmailService> logger
) : IEmailService
{
    private readonly string _senderEmail = emailOptions.Value.Sender;

    private readonly string _logoUrl = emailOptions.Value.PublicUrl + EmailTheme.LogoPath;

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
