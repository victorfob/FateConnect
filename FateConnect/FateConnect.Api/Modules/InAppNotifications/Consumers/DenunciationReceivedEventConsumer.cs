namespace FateConnect.Api.Modules.InAppNotifications.Consumers;

using FateConnect.Api.Modules.Common.Events;
using FateConnect.Api.Modules.InAppNotifications.Constants;
using FateConnect.Api.Modules.InAppNotifications.Enums;
using FateConnect.Api.Modules.InAppNotifications.Interfaces;
using MassTransit;
using Microsoft.Extensions.Logging;
using System;
using System.Threading.Tasks;

public sealed partial class DenunciationReceivedEventConsumer(
    IInAppNotificationService notificationService,
    ILogger<DenunciationReceivedEventConsumer> logger
) : IConsumer<DenunciationReceivedEvent>
{
    public async Task Consume(ConsumeContext<DenunciationReceivedEvent> context)
    {
        var message = context.Message;

        try
        {
            LogNotificationDispatchStarted(logger, message.ReporterId);

            int notifiedCount = await notificationService.NotifyAsync(
                [message.ReporterId],
                EnumInAppNotificationType.DenunciationReceived,
                NotificationContents.DenunciationReceived(message.Category),
                message.DenunciationId.ToString()
            );

            if (notifiedCount == 0)
            {
                LogNotificationSkippedForIneligibleUser(logger, message.ReporterId);
                return;
            }

            LogNotificationDispatchSucceeded(logger, message.ReporterId);
        }
        catch (Exception ex)
        {
            LogNotificationDispatchFailed(logger, ex, message.ReporterId);
            throw;
        }
    }
}
