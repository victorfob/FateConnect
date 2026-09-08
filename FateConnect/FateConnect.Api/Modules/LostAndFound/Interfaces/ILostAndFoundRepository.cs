namespace FateConnect.Api.Modules.LostAndFound.Interfaces;

using FateConnect.Api.Modules.LostAndFound.DTOs;
using FateConnect.Api.Modules.LostAndFound.Entities;

public interface ILostAndFoundRepository
{
    Task<(IReadOnlyList<LostAndFoundRecord> Items, int Total)> GetAllAsync(FilterLostAndFoundDto filter, int? currentUserId = null);
    Task<LostAndFoundRecord?> GetByIdAsync(Guid id);
    Task<LostAndFoundRecord> AddAsync(LostAndFoundRecord lostAndFoundRecord);
    Task SaveChangesAsync();
}
