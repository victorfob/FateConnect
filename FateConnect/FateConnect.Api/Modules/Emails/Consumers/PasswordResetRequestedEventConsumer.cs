namespace FateConnect.Api.Modules.Emails.Consumers;

using FateConnect.Api.Modules.Common.Events;
using FateConnect.Api.Modules.Emails.Enums;
using FateConnect.Api.Modules.Emails.Interfaces;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

public sealed class PasswordResetRequestedEventConsumer(
    IEmailService emailService,
    IConfiguration configuration,
    ILogger<PasswordResetRequestedEventConsumer> logger
) : AccountEmailConsumer<PasswordResetRequestedEvent>(emailService, configuration, logger)
{
    protected override AccountEmailDispatch DispatchFor(PasswordResetRequestedEvent message) =>
        new(EnumAccountEmail.PasswordReset, message.UserId, message.FullName, message.FatecEmail, message.ResetToken);
}
