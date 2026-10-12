namespace FateConnect.Api.Modules.InAppNotifications.Consumers;

using FateConnect.Api.Modules.Common.Events;
using FateConnect.Api.Modules.InAppNotifications.Constants;
using FateConnect.Api.Modules.InAppNotifications.Enums;
using FateConnect.Api.Modules.InAppNotifications.Interfaces;
using MassTransit;
using Microsoft.Extensions.Logging;
using System;
using System.Threading.Tasks;

public sealed partial class ItemArchivedEventConsumer(
    IInAppNotificationService notificationService,
    ILogger<ItemArchivedEventConsumer> logger
) : IConsumer<ItemArchivedEvent>
{
    public async Task Consume(ConsumeContext<ItemArchivedEvent> context)
    {
        var message = context.Message;

        try
        {
            LogItemArchivedDispatchStarted(logger, message.OwnerId);

            int notifiedCount = await notificationService.NotifyAsync(
                [message.OwnerId],
                EnumInAppNotificationType.ItemArchived,
                NotificationContents.ItemArchived(message.ItemName),
                message.RecordId.ToString()
            );

            if (notifiedCount == 0)
            {
                LogItemArchivedSkippedForIneligibleUser(logger, message.OwnerId);
                return;
            }

            LogItemArchivedDispatchSucceeded(logger, message.OwnerId);
        }
        catch (Exception ex)
        {
            LogItemArchivedDispatchFailed(logger, ex, message.OwnerId);
            throw;
        }
    }
}
