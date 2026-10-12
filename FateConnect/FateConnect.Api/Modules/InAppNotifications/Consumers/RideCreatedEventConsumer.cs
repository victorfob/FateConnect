namespace FateConnect.Api.Modules.InAppNotifications.Consumers;

using FateConnect.Api.Modules.Common.Events;
using FateConnect.Api.Modules.InAppNotifications.Constants;
using FateConnect.Api.Modules.InAppNotifications.Enums;
using FateConnect.Api.Modules.InAppNotifications.Interfaces;
using MassTransit;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

public sealed partial class RideCreatedEventConsumer(
    IInAppNotificationRepository repository,
    IInAppNotificationService notificationService,
    ILogger<RideCreatedEventConsumer> logger
) : IConsumer<RideCreatedEvent>
{
    public async Task Consume(ConsumeContext<RideCreatedEvent> context)
    {
        var message = context.Message;

        try
        {
            LogRideNotificationDispatchStarted(logger, message.RideId, message.Destination);

            List<int> interestedUserIds = await repository.GetUserIdsInterestedInDestinationAsync(
                message.Destination,
                message.DriverId);

            int notifiedCount = await notificationService.NotifyAsync(
                interestedUserIds,
                EnumInAppNotificationType.RideToNeighborhood,
                NotificationContents.RideToDestination(message.Destination),
                message.RideId.ToString()
            );

            if (notifiedCount == 0)
            {
                LogRideNotificationSkippedNoUsers(logger, message.RideId);
                return;
            }

            LogRideNotificationDispatchSucceeded(logger, notifiedCount, message.RideId);
        }
        catch (Exception ex)
        {
            LogRideNotificationDispatchFailed(logger, ex, message.RideId);
            throw;
        }
    }
}
