namespace FateConnect.Api.Modules.Rides.Exceptions;

public abstract class RideDomainException(string message) : Exception(message);

public class InvalidDepartureScheduleException()
    : RideDomainException("The departure date and time must be in the future.");

public class InvalidAvailableSeatsException(int seats)
    : RideDomainException($"The number of seats must be between 1 and 7. Received: {seats}.");

public class InvalidDestinationException()
    : RideDomainException("The destination cannot be null, empty, or whitespace.");

public class RideAlreadyDeactivatedException()
    : RideDomainException("This ride is already deactivated.");
