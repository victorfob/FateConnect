namespace FateConnect.Api.Modules.Rides.Repositories;

using System.Linq.Expressions;
using FateConnect.Api.Infrastructure.Database;
using FateConnect.Api.Modules.Common.Extensions;
using FateConnect.Api.Modules.Common.Utils;
using FateConnect.Api.Modules.Rides.DTOs;
using FateConnect.Api.Modules.Rides.Entities;
using FateConnect.Api.Modules.Rides.Enums;
using FateConnect.Api.Modules.Rides.Interfaces;
using FateConnect.Api.Modules.Users.Enums;
using Microsoft.EntityFrameworkCore;

public class RideRepository(FateConnectDbContext context, TimeProvider clock) : IRideRepository
{
    private static readonly TimeOnly MorningStart = new(4, 0);
    private static readonly TimeOnly AfternoonStart = new(12, 0);
    private static readonly TimeOnly NightStart = new(18, 0);

    public async Task<(
        IReadOnlyList<Ride> Items,
        int Total)> GetAllAsync(RideFilterDto filter, int? currentUserId = null)
    {
        DateTime nowInProductTimeZone = DateTimeUtils.NowInProductTimeZone(clock);
        DateOnly today = DateOnly.FromDateTime(nowInProductTimeZone);
        TimeOnly currentTime = TimeOnly.FromDateTime(nowInProductTimeZone);

        IQueryable<Ride> query = context.Rides
            .AsNoTracking()
            .Include(r => r.Driver)
            .Include(r => r.Departures.Where(departure => departure.Date >= today))
            .Where(r => r.IsActive)
            .Where(IsOfferedByAnActiveAccount())
            .Where(HasAnUpcomingDeparture(today, currentTime));

        if (currentUserId.HasValue)
            query = query.Where(IsOfferedBy(currentUserId.Value));

        query = query.WhereWithin(
            filter,
            (rangeStart, rangeEnd) => HasAnUpcomingDepartureWithin(today, currentTime, rangeStart, rangeEnd));

        if (filter.DepartureShift.HasValue)
            query = query.Where(DepartsInShift(filter.DepartureShift.Value));

        query = query.WhereMatchesEveryWord(filter.SearchTerm);

        if (filter.RideType.HasValue)
            query = query.Where(r => r.RideType == filter.RideType.Value);

        if (filter.VehicleType.HasValue)
            query = query.Where(r => r.VehicleType == filter.VehicleType.Value);

        return await query.ToPageAsync(
            filter,
            rides => rides
                .OrderBy(NextDepartureDate(today, currentTime))
                .ThenBy(r => r.DepartureTime)
                .ThenBy(r => r.Id));
    }

    private static Expression<Func<Ride, bool>> IsOfferedByAnActiveAccount() =>
        ride => ride.Driver.Status == EnumAccountStatus.Active;

    private static Expression<Func<Ride, bool>> IsOfferedBy(int driverId) =>
        ride => ride.DriverId == driverId;

    private static Expression<Func<Ride, bool>> HasAnUpcomingDepartureWithin(
        DateOnly today,
        TimeOnly currentTime,
        DateOnly rangeStart,
        DateOnly rangeEnd) =>
        ride => ride.Departures.Any(departure =>
            (departure.Date > today || (departure.Date == today && ride.DepartureTime >= currentTime))
            && departure.Date >= rangeStart
            && departure.Date <= rangeEnd);

    private static Expression<Func<Ride, DateOnly>> NextDepartureDate(DateOnly today, TimeOnly currentTime) =>
        ride => ride.Departures
            .Where(
                departure => departure.Date > today || (departure.Date == today && ride.DepartureTime >= currentTime))
            .Min(departure => departure.Date);

    private static Expression<Func<Ride, bool>> DepartsInShift(EnumRideShift shift) => shift switch
    {
        EnumRideShift.Morning => DepartsBetween(MorningStart, AfternoonStart),
        EnumRideShift.Afternoon => DepartsBetween(AfternoonStart, NightStart),
        _ => DepartsAcrossMidnight(NightStart, MorningStart)
    };

    private static Expression<Func<Ride, bool>> DepartsBetween(TimeOnly shiftStart, TimeOnly nextShiftStart) =>
        ride => ride.DepartureTime >= shiftStart && ride.DepartureTime < nextShiftStart;

    private static Expression<Func<Ride, bool>> DepartsAcrossMidnight(TimeOnly shiftStart, TimeOnly shiftEnd) =>
        ride => ride.DepartureTime >= shiftStart || ride.DepartureTime < shiftEnd;

    private static Expression<Func<Ride, bool>> HasAnUpcomingDeparture(DateOnly today, TimeOnly currentTime) =>
        ride => ride.Departures.Any(departure =>
            departure.Date > today || (departure.Date == today && ride.DepartureTime >= currentTime));

    public async Task<Ride?> GetByIdAsync(Guid id)
    {
        return await context.Rides
            .Include(r => r.Driver)
            .Include(r => r.Departures)
            .Where(IsOfferedByAnActiveAccount())
            .FirstOrDefaultAsync(r => r.Id == id && r.IsActive);
    }

    public async Task<Ride> AddAsync(Ride ride)
    {
        return await context.AddAndLoadAsync(ride, r => r.Driver);
    }

    public async Task SaveChangesAsync()
    {
        await context.SaveChangesAsync();
    }
}
