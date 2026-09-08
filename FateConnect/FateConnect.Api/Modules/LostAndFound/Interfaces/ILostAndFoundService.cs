namespace FateConnect.Api.Modules.LostAndFound.Interfaces;

using FateConnect.Api.Modules.Common.DTOs;
using FateConnect.Api.Modules.LostAndFound.DTOs;

public interface ILostAndFoundService
{
    Task<ReadLostAndFoundDto> CreateAsync(CreateLostAndFoundDto dto, int currentUserId);
    Task<PagedResultDto<ReadLostAndFoundDto>> GetAllAsync(FilterLostAndFoundDto filter, int currentUserId);
    Task<ReadLostAndFoundDto?> GetByIdAsync(Guid id, int currentUserId);
    Task<ReadLostAndFoundDto?> UpdateAsync(Guid id, UpdateLostAndFoundDto dto, int currentUserId);
    Task<bool> DeleteAsync(Guid id, int currentUserId);
}
