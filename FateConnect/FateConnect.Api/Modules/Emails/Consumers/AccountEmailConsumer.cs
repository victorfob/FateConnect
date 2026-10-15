namespace FateConnect.Api.Modules.Emails.Consumers;

using System;
using System.Threading.Tasks;
using FateConnect.Api.Modules.Emails.Interfaces;
using FateConnect.Api.Modules.Emails.Options;
using FateConnect.Api.Modules.Emails.Templates;
using MassTransit;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

public abstract partial class AccountEmailConsumer<TEvent>(
    IEmailService emailService,
    IOptions<EmailOptions> emailOptions,
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
            string route = AccountEmails.For(dispatch.Email).Route;
            string link = $"{emailOptions.Value.PublicUrl}/{route}?token={dispatch.Token}&email={safeEmail}";

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
