namespace FateConnect.Api.Modules.InAppNotifications.Consumers;

using FateConnect.Api.Modules.Common.Events;
using FateConnect.Api.Modules.InAppNotifications.Constants;
using FateConnect.Api.Modules.InAppNotifications.Entities;
using FateConnect.Api.Modules.InAppNotifications.Enums;
using FateConnect.Api.Modules.InAppNotifications.Interfaces;
using MassTransit;
using Microsoft.Extensions.Logging;
using System;
using System.Threading.Tasks;

public sealed partial class DenunciationReceivedEventConsumer(
    IInAppNotificationRepository repository,
    TimeProvider timeProvider,
    ILogger<DenunciationReceivedEventConsumer> logger
) : IConsumer<DenunciationReceivedEvent>
{
    public async Task Consume(ConsumeContext<DenunciationReceivedEvent> context)
    {
        var message = context.Message;

        try
        {
            LogNotificationDispatchStarted(logger, message.ReporterId);

            if (message.IsAnonymous)
            {
                LogNotificationSkippedDueToAnonymous(logger, message.ReporterId);
                return;
            }

            bool userAllowsNotifications = await repository.UserAllowsInAppNotificationsAsync(message.ReporterId);

            if (!userAllowsNotifications)
            {
                LogNotificationSkippedDueToPreferences(logger, message.ReporterId);
                return;
            }

            string content = NotificationContents.DenunciationReceived(message.Reason);

            var notification = new InAppNotification(
                userId: message.ReporterId,
                type: EnumInAppNotificationType.DenunciationReceived,
                content: content,
                referenceId: message.DenunciationId.ToString(),
                createdAt: timeProvider.GetUtcNow().UtcDateTime
            );

            await repository.AddAsync(notification);

            LogNotificationDispatchSucceeded(logger, message.ReporterId);
        }
        catch (Exception ex)
        {
            LogNotificationDispatchFailed(logger, ex, message.ReporterId);
            throw;
        }
    }
}
