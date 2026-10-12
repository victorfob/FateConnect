namespace FateConnect.Api.Modules.InAppNotifications.Consumers;

using FateConnect.Api.Modules.Common.Events;
using FateConnect.Api.Modules.InAppNotifications.Constants;
using FateConnect.Api.Modules.InAppNotifications.Entities;
using FateConnect.Api.Modules.InAppNotifications.Enums;
using FateConnect.Api.Modules.InAppNotifications.Interfaces;
using MassTransit;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Threading.Tasks;

public sealed partial class RideCreatedEventConsumer(
    IInAppNotificationRepository repository,
    TimeProvider timeProvider,
    ILogger<RideCreatedEventConsumer> logger
) : IConsumer<RideCreatedEvent>
{
    public async Task Consume(ConsumeContext<RideCreatedEvent> context)
    {
        var message = context.Message;

        try
        {
            LogRideNotificationDispatchStarted(logger, message.RideId, message.DestinationNeighborhood);

            List<int> targetUserIds = await repository.GetUserIdsInterestedInNeighborhoodAsync(
                message.DestinationNeighborhood,
                message.DriverId);

            if (targetUserIds.Count == 0)
            {
                LogRideNotificationSkippedNoUsers(logger, message.RideId);
                return;
            }

            string content = NotificationContents.RideToNeighborhood(message.DestinationNeighborhood);

            DateTime now = timeProvider.GetUtcNow().UtcDateTime;
            string referenceId = message.RideId.ToString();

            var notifications = targetUserIds.Select(userId => new InAppNotification(
                userId: userId,
                type: EnumInAppNotificationType.RideToNeighborhood,
                content: content,
                referenceId: referenceId,
                createdAt: now
            )).ToList();

            await repository.AddRangeAsync(notifications);

            LogRideNotificationDispatchSucceeded(logger, notifications.Count, message.RideId);
        }
        catch (Exception ex)
        {
            LogRideNotificationDispatchFailed(logger, ex, message.RideId);
            throw;
        }
    }
}
