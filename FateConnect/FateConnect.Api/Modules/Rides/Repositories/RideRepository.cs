namespace FateConnect.Api.Modules.Rides.Repositories;

using FateConnect.Api.Infrastructure.Database;
using FateConnect.Api.Modules.Rides.DTOs;
using FateConnect.Api.Modules.Rides.Entities;
using FateConnect.Api.Modules.Rides.Interfaces;
using Microsoft.EntityFrameworkCore;

public class RideRepository(FateConnectDbContext context) : IRideRepository
{
    public async Task<IEnumerable<Ride>> GetAllAsync(FilterRideDto filter)
    {
        var (departureDate, departureTime, destination, rideType) = filter;

        IQueryable<Ride> query = context.Rides.AsNoTracking().Where(r => r.IsActive);

        if (departureDate.HasValue)
            query = query.Where(r => r.DepartureDate == departureDate.Value);

        if (departureTime.HasValue)
            query = query.Where(r => r.DepartureTime == departureTime.Value);

        if (!string.IsNullOrWhiteSpace(destination))
        {
            query = query.Where(r =>
                EF.Functions.ILike(
                    EF.Functions.Unaccent(r.Destination),
                    "%" + EF.Functions.Unaccent(destination) + "%"
                )
            );
        }

        if (rideType.HasValue)
            query = query.Where(r => r.RideType == rideType.Value);

        var orderedRidesQuery = query
            .OrderBy(r => r.DepartureDate)
            .ThenBy(r => r.DepartureTime)
            .ThenBy(r => r.Id);

        return await orderedRidesQuery.ToListAsync();
    }

    public async Task<Ride?> GetByIdAsync(Guid id)
    {
        return await context.Rides
            .FirstOrDefaultAsync(r => r.Id == id && r.IsActive);
    }

    public async Task<Ride> AddAsync(Ride ride)
    {
        context.Rides.Add(ride);
        await context.SaveChangesAsync();

        return ride;
    }

    public async Task UpdateAsync(Ride ride)
    {
        context.Rides.Update(ride);

        await context.SaveChangesAsync();
    }
}
