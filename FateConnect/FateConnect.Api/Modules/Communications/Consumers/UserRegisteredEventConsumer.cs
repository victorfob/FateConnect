namespace FateConnect.Api.Modules.Communications.Consumers;

using FateConnect.Api.Modules.Common.Events;
using FateConnect.Api.Modules.Communications.Enums;
using FateConnect.Api.Modules.Communications.Interfaces;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

public sealed class UserRegisteredEventConsumer(
    IEmailService emailService,
    IConfiguration configuration,
    ILogger<UserRegisteredEventConsumer> logger
) : AccountEmailConsumer<UserRegisteredEvent>(emailService, configuration, logger)
{
    protected override AccountEmailDispatch DispatchFor(UserRegisteredEvent message) =>
        new(EnumAccountEmail.Confirmation, message.UserId, message.FullName, message.FatecEmail, message.ConfirmationToken);
}
