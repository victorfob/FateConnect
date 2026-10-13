namespace FateConnect.Api.Modules.Rides.Exceptions;

public abstract class RideDomainException(string message) : Exception(message);

public class InvalidDepartureScheduleException()
    : RideDomainException("The ride must depart at a future date and time.");

public class InvalidDestinationException()
    : RideDomainException("The destination must have between 3 and 100 characters.");

public class InvalidRideTypeException()
    : RideDomainException("Invalid ride type.");

public class InvalidVehicleTypeException()
    : RideDomainException("Invalid vehicle.");

public class RideNotDrivenByUserException()
    : Exception("This ride was offered by someone else. Only who offered it can change it.");

public class InvalidRideFrequencyException()
    : RideDomainException("Invalid frequency.");

public class RepeatUntilOnASingleRideException()
    : RideDomainException("Only a repeated ride has an end date.");

public class MissingRepeatUntilException()
    : RideDomainException("The end date of the repetition is required.");

public class RepeatUntilBeforeDepartureException()
    : RideDomainException("The end date cannot be before the departure.");

public class RepeatUntilTooFarException()
    : RideDomainException("A ride repeats for at most 6 months after the departure.");

public class WeekdaysRideOnAWeekendException()
    : RideDomainException("A ride repeated on weekdays starts on a weekday.");

public class RideOnAHolidayException()
    : RideDomainException("Choose a day that is not a holiday.");
