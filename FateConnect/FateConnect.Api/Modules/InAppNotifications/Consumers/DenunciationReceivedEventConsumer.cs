namespace FateConnect.Api.Modules.InAppNotifications.Consumers;

using FateConnect.Api.Modules.Common.Events;
using FateConnect.Api.Modules.InAppNotifications.Constants;
using FateConnect.Api.Modules.InAppNotifications.DTOs;
using FateConnect.Api.Modules.InAppNotifications.Entities;
using FateConnect.Api.Modules.InAppNotifications.Enums;
using FateConnect.Api.Modules.InAppNotifications.Hubs;
using FateConnect.Api.Modules.InAppNotifications.Interfaces;
using MassTransit;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.Logging;
using System;
using System.Globalization;
using System.Threading.Tasks;

public sealed partial class DenunciationReceivedEventConsumer(
    IInAppNotificationRepository repository,
    IHubContext<NotificationHub> hubContext,
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

            var dto = new ReadInAppNotificationDto(
                Id: notification.Id,
                Type: notification.Type,
                Content: notification.Content,
                ReferenceId: notification.ReferenceId,
                IsRead: notification.IsRead,
                CreatedAt: notification.CreatedAt
            );

            string targetUserId = message.ReporterId.ToString(CultureInfo.InvariantCulture);

            await hubContext.Clients
                .User(targetUserId)
                .SendAsync(NotificationHub.ReceiveNotificationEvent, dto);

            LogNotificationDispatchSucceeded(logger, message.ReporterId);
        }
        catch (Exception ex)
        {
            LogNotificationDispatchFailed(logger, ex, message.ReporterId);
            throw;
        }
    }
}
