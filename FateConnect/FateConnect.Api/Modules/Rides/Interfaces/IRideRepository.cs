namespace FateConnect.Api.Modules.Rides.Interfaces;

using FateConnect.Api.Modules.Rides.DTOs;
using FateConnect.Api.Modules.Rides.Entities;

public interface IRideRepository
{
    Task<IReadOnlyList<Ride>> GetAllAsync(FilterRideDto filter);
    Task<Ride?> GetByIdAsync(Guid id);
    Task<Ride> AddAsync(Ride ride);
    Task UpdateAsync(Ride ride);
}
