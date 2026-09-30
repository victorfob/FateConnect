namespace FateConnect.Api.Modules.Rides.Entities;

using FateConnect.Api.Modules.Common.Exceptions;
using FateConnect.Api.Modules.Common.Utils;
using FateConnect.Api.Modules.Rides.Enums;
using FateConnect.Api.Modules.Rides.Exceptions;
using FateConnect.Api.Modules.Rides.Interfaces;
using FateConnect.Api.Modules.Users.Entities;

public class Ride
{
    private const int MonthsARideRepeatsAtMost = 6;

    private readonly List<RideDeparture> _departures = [];

    public Guid Id { get; private set; }
    public string Destination { get; private set; } = default!;
    public DateOnly DepartureDate { get; private set; }
    public TimeOnly DepartureTime { get; private set; }
    public DateTime CreatedAt { get; private set; }
    public DateTime? UpdatedAt { get; private set; }
    public EnumRideType RideType { get; private set; }
    public string? Description { get; private set; }
    public bool IsActive { get; private set; }
    public int DriverId { get; private set; }
    public User Driver { get; private set; } = null!;
    public EnumRideFrequency Frequency { get; private set; }
    public DateOnly? RepeatUntil { get; private set; }
    public IReadOnlyCollection<RideDeparture> Departures => _departures;

    private Ride() { }

    public Ride(
        string destination,
        DateOnly departureDate,
        TimeOnly departureTime,
        EnumRideType rideType,
        int driverId,
        string? description = null)
    {
        ValidateDestination(destination);
        ValidateDepartureDateTime(departureDate, departureTime);
        ValidateRideType(rideType);
        ValidateDriver(driverId);

        Id = Guid.NewGuid();
        DriverId = driverId;
        Destination = destination.Trim();
        DepartureDate = departureDate;
        DepartureTime = departureTime;
        CreatedAt = DateTime.UtcNow;
        UpdatedAt = null;
        RideType = rideType;
        Description = description?.Trim();
        IsActive = true;
        Frequency = EnumRideFrequency.Once;
        _departures.Add(new RideDeparture(Id, departureDate));
    }

    public void ChangeRepetition(EnumRideFrequency frequency, DateOnly? repeatUntil, IHolidayCalendar holidays)
    {
        ValidateRepetition(frequency, DepartureDate, DepartureDate, repeatUntil, holidays);

        Frequency = frequency;
        RepeatUntil = repeatUntil;

        ReplaceDepartures(RideDepartureSchedule.Generate(frequency, DepartureDate, repeatUntil, holidays));
    }

    public void UpdateBasicAttributes(
        string? destination,
        EnumRideType? rideType,
        string? description)
    {
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

        UpdatedAt = DateTime.UtcNow;
    }

    public void Reschedule(RideScheduleChange change, DateTime nowInProductTimeZone, IHolidayCalendar holidays)
    {
        DateOnly nextDeparture = NextDepartureDate(nowInProductTimeZone);
        DateOnly shownDeparture = change.DepartureDate ?? nextDeparture;
        TimeOnly departureTime = change.DepartureTime ?? DepartureTime;
        EnumRideFrequency frequency = change.Frequency ?? Frequency;
        DateOnly? repeatUntil = ResolveRepeatUntil(change.RepeatUntil, frequency);

        bool keepsTheReference = shownDeparture == nextDeparture && frequency == Frequency;
        DateOnly reference = DepartureDate;

        if (!keepsTheReference)
            reference = shownDeparture;

        ValidateDepartureDateTime(shownDeparture, departureTime);
        ValidateRepetition(frequency, shownDeparture, reference, repeatUntil, holidays);

        DepartureDate = reference;
        DepartureTime = departureTime;
        Frequency = frequency;
        RepeatUntil = repeatUntil;

        IEnumerable<DateOnly> upcoming = RideDepartureSchedule
            .Generate(frequency, reference, repeatUntil, holidays)
            .Where(day => day >= shownDeparture);

        ReplaceDepartures(upcoming);

        UpdatedAt = DateTime.UtcNow;
    }

    public DateOnly NextDepartureDate(DateTime nowInProductTimeZone)
    {
        DateOnly today = DateOnly.FromDateTime(nowInProductTimeZone);
        bool departsLaterToday = DepartureTime >= TimeOnly.FromDateTime(nowInProductTimeZone);

        List<DateOnly> dates = [.. _departures.Select(departure => departure.Date).Order()];

        if (dates.Count == 0)
            return DepartureDate;

        return dates.FirstOrDefault(
            date => date > today || (date == today && departsLaterToday),
            dates[^1]);
    }

    public void Deactivate()
    {
        IsActive = false;
        UpdatedAt = DateTime.UtcNow;
    }

    public bool IsDrivenBy(int userId) => DriverId == userId;

    private DateOnly? ResolveRepeatUntil(DateOnly? requested, EnumRideFrequency frequency)
    {
        if (requested.HasValue)
            return requested;

        if (frequency == EnumRideFrequency.Once)
            return null;

        return RepeatUntil;
    }

    private void ReplaceDepartures(IEnumerable<DateOnly> dates)
    {
        HashSet<DateOnly> wanted = [.. dates];

        _departures.RemoveAll(departure => !wanted.Contains(departure.Date));

        IEnumerable<DateOnly> missing = wanted.Except(_departures.Select(departure => departure.Date));

        _departures.AddRange(missing.Select(date => new RideDeparture(Id, date)));
    }

    private static void ValidateRepetition(
        EnumRideFrequency frequency,
        DateOnly firstDeparture,
        DateOnly reference,
        DateOnly? repeatUntil,
        IHolidayCalendar holidays)
    {
        if (!Enum.IsDefined(frequency))
            throw new InvalidRideFrequencyException();

        bool isASingleRide = frequency == EnumRideFrequency.Once;

        if (isASingleRide && repeatUntil.HasValue)
            throw new RepeatUntilOnASingleRideException();

        if (holidays.IsHoliday(firstDeparture))
            throw new RideOnAHolidayException();

        if (isASingleRide)
            return;

        if (repeatUntil is null)
            throw new MissingRepeatUntilException();

        if (repeatUntil.Value < firstDeparture)
            throw new RepeatUntilBeforeDepartureException();

        if (repeatUntil.Value > reference.AddMonths(MonthsARideRepeatsAtMost))
            throw new RepeatUntilTooFarException();

        bool startsOnAWeekend = frequency == EnumRideFrequency.Weekdays && !RideDepartureSchedule.IsWeekday(firstDeparture);

        if (startsOnAWeekend)
            throw new WeekdaysRideOnAWeekendException();
    }

    private static void ValidateDriver(int driverId)
    {
        if (driverId < 1)
            throw new InvalidUserIdentifierException();
    }

    private static void ValidateRideType(EnumRideType rideType)
    {
        bool isInvalidRideType = !Enum.IsDefined(rideType);

        if (isInvalidRideType)
            throw new InvalidRideTypeException();

    }

    private static void ValidateDepartureDateTime(DateOnly date, TimeOnly time)
    {
        DateTime departureUtc = DateTimeUtils.ToUtcFromProductTimeZone(date, time);

        if (departureUtc < DateTime.UtcNow)
            throw new InvalidDepartureScheduleException();
    }

    private static void ValidateDestination(string? destination)
    {
        bool isInvalidDestination = string.IsNullOrWhiteSpace(destination) || destination.Trim().Length < 3;

        if (isInvalidDestination)
            throw new InvalidDestinationException();
    }
}
