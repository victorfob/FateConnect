namespace FateConnect.Api.Modules.Rides.Entities;

using FateConnect.Api.Modules.Rides.Enums;
using FateConnect.Api.Modules.Rides.Exceptions;
using FateConnect.Api.Modules.Users.Entities;

public class Ride
{
    private static readonly TimeZoneInfo ProductTimeZone =
        TimeZoneInfo.FindSystemTimeZoneById("America/Sao_Paulo");

    public Guid Id { get; private set; }
    public int AvailableSeats { get; private set; }
    public string Destination { get; private set; } = default!;
    public DateOnly DepartureDate { get; private set; }
    public TimeOnly DepartureTime { get; private set; }
    public DateTime CreatedAt { get; private set; }
    public EnumRideType RideType { get; private set; }
    public string? Description { get; private set; }
    public bool IsActive { get; private set; }
    public int DriverId { get; private set; }
    public User Driver { get; private set; } = null!;

    private Ride() { }

    public Ride(
        int availableSeats,
        string destination,
        DateOnly departureDate,
        TimeOnly departureTime,
        EnumRideType rideType,
        int driverId,
        string? description = null)
    {
        ValidateAvailableSeats(availableSeats);
        ValidateDestination(destination);
        ValidateDepartureDateTime(departureDate, departureTime);
        ValidateRideType(rideType);
        ValidateDriver(driverId);

        Id = Guid.NewGuid();
        DriverId = driverId;
        AvailableSeats = availableSeats;
        Destination = destination.Trim();
        DepartureDate = departureDate;
        DepartureTime = departureTime;
        CreatedAt = DateTime.UtcNow;
        RideType = rideType;
        Description = description?.Trim();
        IsActive = true;
    }

    public void UpdateBasicAttributes(
        int? availableSeats,
        string? destination,
        EnumRideType? rideType,
        string? description)
    {
        if (availableSeats.HasValue)
        {
            ValidateAvailableSeats(availableSeats.Value);
            AvailableSeats = availableSeats.Value;
        }

        if (destination is not null)
        {
            ValidateDestination(destination);
            Destination = destination.Trim();
        }

        if (rideType.HasValue)
        {
            ValidateRideType(rideType.Value);
            RideType = rideType.Value;
        }

        if (description is not null)
            Description = description.Trim();
    }

    public void ChangeDepartureSchedule(DateOnly? departureDate, TimeOnly? departureTime)
    {
        var newDate = departureDate ?? DepartureDate;
        var newTime = departureTime ?? DepartureTime;

        ValidateDepartureDateTime(newDate, newTime);

        DepartureDate = newDate;
        DepartureTime = newTime;
    }

    public void Deactivate()
    {
        IsActive = false;
    }

    public bool IsDrivenBy(int userId) => DriverId == userId;

    private static void ValidateDriver(int driverId)
    {
        if (driverId < 1)
            throw new InvalidRideDriverException();
    }

    private static void ValidateRideType(EnumRideType rideType)
    {
        bool isInvalidRideType = !Enum.IsDefined(rideType);

        if (isInvalidRideType)
            throw new InvalidRideTypeException();

    }

    private static void ValidateDepartureDateTime(DateOnly date, TimeOnly time)
    {
        DateTime departureUtc = TimeZoneInfo.ConvertTimeToUtc(date.ToDateTime(time), ProductTimeZone);

        if (departureUtc < DateTime.UtcNow)
            throw new InvalidDepartureScheduleException();
    }

    private static void ValidateAvailableSeats(int seats)
    {
        if (seats is < 1 or > 7)
            throw new InvalidAvailableSeatsException(seats);
    }

    private static void ValidateDestination(string? destination)
    {
        bool isInvalidDestination = string.IsNullOrWhiteSpace(destination) || destination.Trim().Length < 3;

        if (isInvalidDestination)
            throw new InvalidDestinationException();
    }
}
