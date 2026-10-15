namespace FateConnect.Api.Modules.Emails.Consumers;

using FateConnect.Api.Modules.Common.Events;
using FateConnect.Api.Modules.Emails.Enums;
using FateConnect.Api.Modules.Emails.Interfaces;
using FateConnect.Api.Modules.Emails.Options;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

public sealed class AccountLockedEventConsumer(
    IEmailService emailService,
    IOptions<EmailOptions> emailOptions,
    ILogger<AccountLockedEventConsumer> logger
) : AccountEmailConsumer<AccountLockedEvent>(emailService, emailOptions, logger)
{
    protected override AccountEmailDispatch DispatchFor(AccountLockedEvent message) =>
        new(EnumAccountEmail.AccountLocked, message.UserId, message.FullName, message.FatecEmail, message.UnlockToken);
}
