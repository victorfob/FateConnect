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
        var evento = context.Message;

        try
        {
            LogAccountLockedDispatchStarted(logger, evento.FatecEmail);

            string frontendUrl = configuration["PUBLIC_URL"]
                ?? throw new MissingCommunicationConfigurationException("PUBLIC_URL");

            string unlockLink = $"{frontendUrl.TrimEnd('/')}/auth/unlock?token={evento.UnlockToken}&email={evento.FatecEmail}";

            await emailService.SendAccountLockedEmailAsync(evento.FatecEmail, evento.FullName, unlockLink);

            LogAccountLockedDispatchSucceeded(logger, evento.FatecEmail);
        }
        catch (Exception ex)
        {
            LogAccountLockedDispatchFailed(logger, ex, evento.FatecEmail);
            throw;
        }
    }
}
