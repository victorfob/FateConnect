namespace FateConnect.Api.Modules.InAppNotifications.Consumers;

using System;
using System.Threading.Tasks;
using FateConnect.Api.Modules.Common.Events;
using FateConnect.Api.Modules.InAppNotifications.Constants;
using FateConnect.Api.Modules.InAppNotifications.Enums;
using FateConnect.Api.Modules.InAppNotifications.Interfaces;
using MassTransit;
using Microsoft.Extensions.Logging;

public sealed partial class ReportReceivedEventConsumer(
    IInAppNotificationService notificationService,
    ILogger<ReportReceivedEventConsumer> logger
) : IConsumer<ReportReceivedEvent>
{
    public async Task Consume(ConsumeContext<ReportReceivedEvent> context)
    {
        var message = context.Message;

        try
        {
            LogNotificationDispatchStarted(logger, message.ReporterId);

            int notifiedCount = await notificationService.NotifyAsync(
                [message.ReporterId],
                EnumInAppNotificationType.ReportReceived,
                NotificationContents.ReportReceived(message.Category),
                message.ReportId.ToString()
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
