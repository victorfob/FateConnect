namespace FateConnect.Api.Modules.Rides.Repositories;

using System.Linq.Expressions;
using FateConnect.Api.Infrastructure.Database;
using FateConnect.Api.Modules.Rides.DTOs;
using FateConnect.Api.Modules.Rides.Entities;
using FateConnect.Api.Modules.Rides.Interfaces;
using Microsoft.EntityFrameworkCore;

public class RideRepository(FateConnectDbContext context) : IRideRepository
{
    public async Task<(IReadOnlyList<Ride> Items, int Total)> GetAllAsync(FilterRideDto filter)
    {
        DateTime nowInProductTimeZone = Ride.NowInProductTimeZone();
        DateOnly today = DateOnly.FromDateTime(nowInProductTimeZone);
        TimeOnly currentTime = TimeOnly.FromDateTime(nowInProductTimeZone);

        IQueryable<Ride> query = context.Rides
            .AsNoTracking()
            .Include(r => r.Driver.Contacts)
            .Where(r => r.IsActive)
            .Where(HasNotDeparted(today, currentTime));

        if (filter.DepartureDate.HasValue)
            query = query.Where(r => r.DepartureDate == filter.DepartureDate.Value);

        if (filter.DepartureTime.HasValue)
            query = query.Where(r => r.DepartureTime == filter.DepartureTime.Value);

        if (!string.IsNullOrWhiteSpace(filter.Destination))
        {
            string escapedDestination = filter.Destination
                .Replace(@"\", @"\\")
                .Replace("%", @"\%")
                .Replace("_", @"\_");

            query = query.Where(r =>
                EF.Functions.ILike(
                    EF.Functions.Unaccent(r.Destination),
                    "%" + EF.Functions.Unaccent(escapedDestination) + "%",
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
