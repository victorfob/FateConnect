namespace FateConnect.Api.Modules.Communications.Consumers;

using FateConnect.Api.Modules.Common.Events;
using FateConnect.Api.Modules.Communications.Exceptions;
using FateConnect.Api.Modules.Communications.Interfaces;
using MassTransit;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using System;
using System.Threading.Tasks;

public partial class PasswordResetRequestedEventConsumer(
    IEmailService emailService,
    IConfiguration configuration,
    ILogger<PasswordResetRequestedEventConsumer> logger
) : IConsumer<PasswordResetRequestedEvent>
{
    public async Task Consume(ConsumeContext<PasswordResetRequestedEvent> context)
    {
        var message = context.Message;

        try
        {
            LogPasswordResetDispatchStarted(logger, message.UserId);

            string frontendUrl = configuration["PUBLIC_URL"]
                ?? throw new MissingCommunicationConfigurationException("PUBLIC_URL");

            string safeEmail = Uri.EscapeDataString(message.FatecEmail);

            string resetLink = $"{frontendUrl.TrimEnd('/')}/redefinir-senha?token={message.ResetToken}&email={safeEmail}";

            await emailService.SendPasswordResetEmailAsync(message.FatecEmail, message.FullName, resetLink);

            LogPasswordResetDispatchSucceeded(logger, message.UserId);
        }
        catch (Exception ex)
        {
            LogPasswordResetDispatchFailed(logger, ex, message.UserId);
            throw;
        }
    }
}
