namespace FateConnect.Api.Modules.InAppNotifications.Consumers;

using System;
using System.Threading.Tasks;
using FateConnect.Api.Modules.Common.Events;
using FateConnect.Api.Modules.InAppNotifications.Constants;
using FateConnect.Api.Modules.InAppNotifications.Enums;
using FateConnect.Api.Modules.InAppNotifications.Interfaces;
using MassTransit;
using Microsoft.Extensions.Logging;

public sealed partial class PublicationRemovedEventConsumer(
    IInAppNotificationService notificationService,
    ILogger<PublicationRemovedEventConsumer> logger
) : IConsumer<PublicationRemovedEvent>
{
    public async Task Consume(ConsumeContext<PublicationRemovedEvent> context)
    {
        var message = context.Message;

        try
        {
            int notifiedCount = await notificationService.NotifyAsync(
                [message.OwnerId],
                EnumInAppNotificationType.PublicationRemoved,
                NotificationContents.PublicationRemoved(message.Publication, message.Title, message.Reason),
                message.PublicationId.ToString()
            );

            if (notifiedCount == 0)
            {
                LogPublicationRemovedSkippedForInactiveUser(logger, message.OwnerId);
                return;
            }

            LogPublicationRemovedDispatchSucceeded(logger, message.OwnerId);
        }
        catch (Exception ex)
        {
            LogPublicationRemovedDispatchFailed(logger, ex, message.OwnerId);
            throw;
        }
    }
}
