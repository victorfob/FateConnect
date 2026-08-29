namespace FateConnect.Api.Modules.Rides.Services;

using Microsoft.Extensions.Logging;

public partial class RideService
{
    [LoggerMessage(Level = LogLevel.Information, Message = "Ride {RideId} created successfully.")]
    private static partial void LogRideCreated(ILogger logger, Guid rideId);

    [LoggerMessage(Level = LogLevel.Information, Message = "{RidesCount} rides retrieved successfully.")]
    private static partial void LogRidesRetrieved(ILogger logger, int ridesCount);

    [LoggerMessage(Level = LogLevel.Information, Message = "Ride {RideId} found.")]
    private static partial void LogRideFound(ILogger logger, Guid rideId);

    [LoggerMessage(Level = LogLevel.Warning, Message = "Ride {RideId} not found.")]
    private static partial void LogRideNotFound(ILogger logger, Guid rideId);

    [LoggerMessage(Level = LogLevel.Information, Message = "Ride {RideId} updated successfully.")]
    private static partial void LogRideUpdated(ILogger logger, Guid rideId);

    [LoggerMessage(Level = LogLevel.Information, Message = "Ride {RideId} deactivated successfully.")]
    private static partial void LogRideDeactivated(ILogger logger, Guid rideId);

    [LoggerMessage(Level = LogLevel.Warning, Message = "Ride {RideId} was already deactivated or not found.")]
    private static partial void LogRideDeactivationFailed(ILogger logger, Guid rideId);
}
