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
        var message = context.Message;

        try
        {
            LogEmailDispatchStarted(logger, message.UserId);

            string frontendUrl = configuration["PUBLIC_URL"]
                ?? throw new MissingCommunicationConfigurationException("PUBLIC_URL");

            string safeEmail = Uri.EscapeDataString(message.FatecEmail);

            string confirmationLink = $"{frontendUrl.TrimEnd('/')}/confirmar-email?token={message.ConfirmationToken}&email={safeEmail}";

            await emailService.SendConfirmationEmailAsync(message.FatecEmail, message.FullName, confirmationLink);

            LogEmailDispatchSucceeded(logger, message.UserId);
        }
        catch (Exception ex)
        {
            LogEmailDispatchFailed(logger, ex, message.UserId);
            throw;
        }
    }
}
