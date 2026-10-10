namespace FateConnect.Api.Modules.Communications.Consumers;

using System;
using System.Threading.Tasks;
using FateConnect.Api.Modules.Common.Events;
using FateConnect.Api.Modules.Communications.Exceptions;
using FateConnect.Api.Modules.Communications.Interfaces;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using MassTransit;

public partial class AccountLockedEventConsumer(
    IEmailService emailService,
    IConfiguration configuration,
    ILogger<AccountLockedEventConsumer> logger
) : IConsumer<AccountLockedEvent>
{
    public async Task Consume(ConsumeContext<AccountLockedEvent> context)
    {
        var message = context.Message;

        try
        {
            LogAccountLockedDispatchStarted(logger, message.UserId);

            string frontendUrl = configuration["PUBLIC_URL"]
                ?? throw new MissingCommunicationConfigurationException("PUBLIC_URL");

            string safeEmail = Uri.EscapeDataString(message.FatecEmail);

            string unlockLink = $"{frontendUrl.TrimEnd('/')}/desbloquear-conta?token={message.UnlockToken}&email={safeEmail}";

            await emailService.SendAccountLockedEmailAsync(message.FatecEmail, message.FullName, unlockLink);

            LogAccountLockedDispatchSucceeded(logger, message.UserId);
        }
        catch (Exception ex)
        {
            LogAccountLockedDispatchFailed(logger, ex, message.UserId);
            throw;
        }
    }
}
