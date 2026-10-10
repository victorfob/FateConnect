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
        var evento = context.Message;

        try
        {
            LogPasswordResetDispatchStarted(logger, evento.FatecEmail);

            string frontendUrl = configuration["PUBLIC_URL"]
                ?? throw new MissingCommunicationConfigurationException("PUBLIC_URL");

            string safeEmail = Uri.EscapeDataString(evento.FatecEmail);

            string resetLink = $"{frontendUrl.TrimEnd('/')}/redefinir-senha?token={evento.ResetToken}&email={safeEmail}";

            await emailService.SendPasswordResetEmailAsync(evento.FatecEmail, evento.FullName, resetLink);

            LogPasswordResetDispatchSucceeded(logger, evento.FatecEmail);
        }
        catch (Exception ex)
        {
            LogPasswordResetDispatchFailed(logger, ex, evento.FatecEmail);
            throw;
        }
    }
}
