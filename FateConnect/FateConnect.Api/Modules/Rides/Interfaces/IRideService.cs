namespace FateConnect.Api.Modules.Rides.Interfaces;

using FateConnect.Api.Modules.Rides.DTOs;

public interface IRideService
{
    Task<ReadRideDto> CreateAsync(CreateRideDto dto);
    Task<IEnumerable<ReadRideDto>> GetAllAsync(FilterRideDto filter);
    Task<ReadRideDto?> GetByIdAsync(Guid id);
    Task<ReadRideDto?> UpdateAsync(Guid id, UpdateRideDto dto);
    Task<bool> DeleteAsync(Guid id);
}
