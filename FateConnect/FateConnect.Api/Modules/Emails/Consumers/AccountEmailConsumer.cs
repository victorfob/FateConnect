namespace FateConnect.Api.Modules.Communications.Consumers;

using System;
using System.Threading.Tasks;
using FateConnect.Api.Modules.Emails.Extensions;
using FateConnect.Api.Modules.Emails.Interfaces;
using FateConnect.Api.Modules.Emails.Templates;
using MassTransit;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

public abstract partial class AccountEmailConsumer<TEvent>(
    IEmailService emailService,
    IConfiguration configuration,
    ILogger logger
) : IConsumer<TEvent> where TEvent : class
{
    protected abstract AccountEmailDispatch DispatchFor(TEvent message);

    public async Task Consume(ConsumeContext<TEvent> context)
    {
        AccountEmailDispatch dispatch = DispatchFor(context.Message);

        try
        {
            LogDispatchStarted(logger, dispatch.Email, dispatch.UserId);

            string safeEmail = Uri.EscapeDataString(dispatch.FatecEmail);
            string link = $"{configuration.RequiredPublicUrl()}/{AccountEmails.For(dispatch.Email).Route}?token={dispatch.Token}&email={safeEmail}";

            await emailService.SendAsync(dispatch.Email, dispatch.FatecEmail, dispatch.FullName, link);

            LogDispatchSucceeded(logger, dispatch.Email, dispatch.UserId);
        }
        catch (Exception ex)
        {
            LogDispatchFailed(logger, ex, dispatch.Email, dispatch.UserId);
            throw;
        }
    }
}
