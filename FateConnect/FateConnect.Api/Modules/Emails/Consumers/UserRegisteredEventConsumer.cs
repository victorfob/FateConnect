namespace FateConnect.Api.Modules.Emails.Consumers;

using FateConnect.Api.Modules.Common.Events;
using FateConnect.Api.Modules.Emails.Enums;
using FateConnect.Api.Modules.Emails.Interfaces;
using FateConnect.Api.Modules.Emails.Options;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

public sealed class UserRegisteredEventConsumer(
    IEmailService emailService,
    IOptions<EmailOptions> emailOptions,
    ILogger<UserRegisteredEventConsumer> logger
) : AccountEmailConsumer<UserRegisteredEvent>(emailService, emailOptions, logger)
{
    protected override AccountEmailDispatch DispatchFor(UserRegisteredEvent message) =>
        new(EnumAccountEmail.Confirmation, message.UserId, message.FullName, message.FatecEmail, message.ConfirmationToken);
}
