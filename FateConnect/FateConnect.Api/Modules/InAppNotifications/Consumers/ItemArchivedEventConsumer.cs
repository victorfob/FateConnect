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

public sealed partial class ItemArchivedEventConsumer(
    IInAppNotificationRepository repository,
    TimeProvider timeProvider,
    ILogger<ItemArchivedEventConsumer> logger
) : IConsumer<ItemArchivedEvent>
{
    public async Task Consume(ConsumeContext<ItemArchivedEvent> context)
    {
        var message = context.Message;

        try
        {
            LogItemArchivedDispatchStarted(logger, message.OwnerId);

            bool userAllowsNotifications = await repository.UserAllowsInAppNotificationsAsync(message.OwnerId);

            if (!userAllowsNotifications)
            {
                LogItemArchivedSkippedDueToPreferences(logger, message.OwnerId);
                return;
            }

            string content = NotificationContents.ItemArchived(message.ItemName);

            var notification = new InAppNotification(
                userId: message.OwnerId,
                type: EnumInAppNotificationType.ItemArchived,
                content: content,
                referenceId: message.RecordId.ToString(),
                createdAt: timeProvider.GetUtcNow().UtcDateTime
            );

            await repository.AddAsync(notification);

            LogItemArchivedDispatchSucceeded(logger, message.OwnerId);
        }
        catch (Exception ex)
        {
            LogItemArchivedDispatchFailed(logger, ex, message.OwnerId);
            throw;
        }
    }
}
