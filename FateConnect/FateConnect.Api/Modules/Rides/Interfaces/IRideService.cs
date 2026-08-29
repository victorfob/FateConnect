namespace FateConnect.Api.Modules.Rides.Interfaces;

using FateConnect.Api.Modules.Rides.DTOs;

public interface IRideService
{
    Task<ReadRideDto> CreateAsync(CreateRideDto dto, int currentUserId);
    Task<IEnumerable<ReadRideDto>> GetAllAsync(FilterRideDto filter, int currentUserId);
    Task<ReadRideDto?> GetByIdAsync(Guid id, int currentUserId);
    Task<ReadRideDto?> UpdateAsync(Guid id, UpdateRideDto dto, int currentUserId);
    Task<bool> DeleteAsync(Guid id, int currentUserId);
}
