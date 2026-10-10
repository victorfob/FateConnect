namespace FateConnect.Api.Modules.Communications.Consumers;

using FateConnect.Api.Modules.Common.Events;
using FateConnect.Api.Modules.Communications.Exceptions;
using FateConnect.Api.Modules.Communications.Interfaces;
using MassTransit;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using System;
using System.Threading.Tasks;

public sealed partial class UserRegisteredEventConsumer(
    ILogger<UserRegisteredEventConsumer> logger,
    IConfiguration configuration,
    IEmailService emailService
) : IConsumer<UserRegisteredEvent>
{
    public async Task Consume(ConsumeContext<UserRegisteredEvent> context)
    {
        var evento = context.Message;

        try
        {
            LogEmailDispatchStarted(logger, evento.FatecEmail);

            string frontendUrl = configuration["PUBLIC_URL"]
                ?? throw new MissingCommunicationConfigurationException("PUBLIC_URL");

            string confirmationLink = $"{frontendUrl.TrimEnd('/')}/confirmar-email?token={evento.ConfirmationToken}&email={evento.FatecEmail}";

            await emailService.SendConfirmationEmailAsync(evento.FatecEmail, evento.FullName, confirmationLink);

            LogEmailDispatchSucceeded(logger, evento.FatecEmail);
        }
        catch (Exception ex)
        {
            LogEmailDispatchFailed(logger, ex, evento.FatecEmail);
            throw;
        }
    }
}
