namespace FateConnect.Api.Modules.Communications.Consumers;

using FateConnect.Api.Modules.Common.Events;
using FateConnect.Api.Modules.Communications.Enums;
using FateConnect.Api.Modules.Communications.Interfaces;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

public sealed class AccountLockedEventConsumer(
    IEmailService emailService,
    IConfiguration configuration,
    ILogger<AccountLockedEventConsumer> logger
) : AccountEmailConsumer<AccountLockedEvent>(emailService, configuration, logger)
{
    protected override AccountEmailDispatch DispatchFor(AccountLockedEvent message) =>
        new(EnumAccountEmail.AccountLocked, message.UserId, message.FullName, message.FatecEmail, message.UnlockToken);
}
