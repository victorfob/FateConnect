namespace FateConnect.Api.Modules.InAppNotifications.Consumers;

using System;
using Microsoft.Extensions.Logging;

public sealed partial class RideCreatedEventConsumer
{
    [LoggerMessage(EventId = 1, Level = LogLevel.Information, Message = "Starting dispatch of ride notifications for Ride ID {RideId} to '{Destination}'.")]
    private static partial void LogRideNotificationDispatchStarted(ILogger logger, Guid rideId, string destination);

    [LoggerMessage(EventId = 2, Level = LogLevel.Information, Message = "No eligible users found for Ride ID {RideId}. Notifications skipped.")]
    private static partial void LogRideNotificationSkippedNoUsers(ILogger logger, Guid rideId);

    [LoggerMessage(EventId = 3, Level = LogLevel.Information, Message = "Successfully dispatched {Count} notifications for Ride ID {RideId}.")]
    private static partial void LogRideNotificationDispatchSucceeded(ILogger logger, int count, Guid rideId);

    [LoggerMessage(EventId = 4, Level = LogLevel.Error, Message = "Failed to dispatch notifications for Ride ID {RideId}.")]
    private static partial void LogRideNotificationDispatchFailed(ILogger logger, Exception ex, Guid rideId);
}
