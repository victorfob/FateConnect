namespace FateConnect.Api.Modules.Rides.Repositories;

using System.Linq.Expressions;
using FateConnect.Api.Infrastructure.Database;
using FateConnect.Api.Modules.Common.Utils;
using FateConnect.Api.Modules.Rides.DTOs;
using FateConnect.Api.Modules.Rides.Entities;
using FateConnect.Api.Modules.Rides.Enums;
using FateConnect.Api.Modules.Rides.Interfaces;
using Microsoft.EntityFrameworkCore;

public class RideRepository(FateConnectDbContext context) : IRideRepository
{
    private static readonly TimeOnly MorningStart = new(4, 0);
    private static readonly TimeOnly AfternoonStart = new(12, 0);
    private static readonly TimeOnly NightStart = new(18, 0);

    public async Task<(IReadOnlyList<Ride> Items, int Total)> GetAllAsync(FilterRideDto filter, int? currentUserId = null)
    {
        DateTime nowInProductTimeZone = DateTimeUtils.NowInProductTimeZone();
        DateOnly today = DateOnly.FromDateTime(nowInProductTimeZone);
        TimeOnly currentTime = TimeOnly.FromDateTime(nowInProductTimeZone);

        IQueryable<Ride> query = context.Rides
            .AsNoTracking()
            .Include(r => r.Driver.Contacts)
            .Where(r => r.IsActive)
            .Where(HasNotDeparted(today, currentTime));

        if (currentUserId.HasValue)
            query = query.Where(IsOfferedBy(currentUserId.Value));

        DateOnly? rangeStart = filter.EffectiveDateFrom;
        DateOnly? rangeEnd = filter.EffectiveDateTo;

        if (rangeStart.HasValue && rangeEnd.HasValue)
            query = query.Where(DepartsWithin(rangeStart.Value, rangeEnd.Value));

        if (filter.DepartureShift.HasValue)
            query = query.Where(DepartsInShift(filter.DepartureShift.Value));

        if (!string.IsNullOrWhiteSpace(filter.SearchTerm))
        {
            string escapedSearchTerm = filter.SearchTerm.SanitizeSearchTerm();

            query = query.Where(r =>
                EF.Functions.ILike(
                    EF.Functions.Unaccent(r.Destination),
                    "%" + EF.Functions.Unaccent(escapedSearchTerm) + "%",
                    @"\"
                ) ||
                EF.Functions.ILike(
                    EF.Functions.Unaccent(r.Description ?? ""),
                    "%" + EF.Functions.Unaccent(escapedSearchTerm) + "%",
                    @"\"
                ));
        }

        if (filter.RideType.HasValue)
            query = query.Where(r => r.RideType == filter.RideType.Value);

        int total = await query.CountAsync();

        List<Ride> items = await query
            .OrderBy(r => r.DepartureDate)
            .ThenBy(r => r.DepartureTime)
            .ThenBy(r => r.Id)
            .Skip(filter.ItemsToSkip)
            .Take(filter.EffectivePageSize)
            .ToListAsync();

        return (items, total);
    }

    private static Expression<Func<Ride, bool>> IsOfferedBy(int driverId) =>
        ride => ride.DriverId == driverId;

    private static Expression<Func<Ride, bool>> DepartsWithin(DateOnly rangeStart, DateOnly rangeEnd) =>
        ride => ride.DepartureDate >= rangeStart && ride.DepartureDate <= rangeEnd;

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

    private static Expression<Func<Ride, bool>> HasNotDeparted(DateOnly today, TimeOnly currentTime) =>
        ride => ride.DepartureDate > today
            || (ride.DepartureDate == today && ride.DepartureTime >= currentTime);

    public async Task<Ride?> GetByIdAsync(Guid id)
    {
        return await context.Rides
            .Include(r => r.Driver.Contacts)
            .FirstOrDefaultAsync(r => r.Id == id && r.IsActive);
    }

    public async Task<Ride> AddAsync(Ride ride)
    {
        context.Rides.Add(ride);
        await context.SaveChangesAsync();

        await context.Entry(ride).Reference(r => r.Driver).LoadAsync();
        await context.Entry(ride.Driver).Collection(driver => driver.Contacts).LoadAsync();

        return ride;
    }

    public async Task UpdateAsync(Ride ride)
    {
        context.Rides.Update(ride);

        await context.SaveChangesAsync();
    }
}
