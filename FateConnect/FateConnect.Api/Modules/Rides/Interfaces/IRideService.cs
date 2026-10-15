namespace FateConnect.Api.Modules.Rides.Interfaces;

using FateConnect.Api.Modules.Common.DTOs;
using FateConnect.Api.Modules.Rides.DTOs;
using FateConnect.Api.Modules.Users.Enums;

public interface IRideService
{
    Task<ReadRideDto> CreateAsync(CreateRideDto dto, int currentUserId);
    Task<PagedResultDto<ReadRideDto>> GetAllAsync(RideFilterDto filter, int currentUserId);
    Task<ReadRideDto?> GetByIdAsync(Guid id, int currentUserId);
    Task<ReadRideDto?> UpdateAsync(Guid id, UpdateRideDto dto, int currentUserId);
    Task<bool> DeactivateAsync(Guid id, int currentUserId);
    Task<bool> RemoveAsync(Guid id, EnumRemovalReason reason, int administratorId);
}
