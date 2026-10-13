namespace FateConnect.Api.Modules.Emails.Consumers;

using FateConnect.Api.Modules.Common.Events;
using FateConnect.Api.Modules.Emails.Enums;
using FateConnect.Api.Modules.Emails.Interfaces;
using FateConnect.Api.Modules.Emails.Options;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

public sealed class PasswordResetRequestedEventConsumer(
    IEmailService emailService,
    IOptions<EmailOptions> emailOptions,
    ILogger<PasswordResetRequestedEventConsumer> logger
) : AccountEmailConsumer<PasswordResetRequestedEvent>(emailService, emailOptions, logger)
{
    protected override AccountEmailDispatch DispatchFor(PasswordResetRequestedEvent message) =>
        new(EnumAccountEmail.PasswordReset, message.UserId, message.FullName, message.FatecEmail, message.ResetToken);
}
