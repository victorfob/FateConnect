namespace FateConnect.Api.Modules.Users.Repositories;

using FateConnect.Api.Infrastructure.Database;
using FateConnect.Api.Modules.Common.Utils;
using FateConnect.Api.Modules.Users.DTOs;
using FateConnect.Api.Modules.Users.Entities;
using FateConnect.Api.Modules.Users.Enums;
using FateConnect.Api.Modules.Users.Interfaces;
using Microsoft.EntityFrameworkCore;

public class UserRepository : IUserRepository
{
    private readonly FateConnectDbContext _context;

    public UserRepository(FateConnectDbContext context)
    {
        _context = context;
    }

    public async Task<bool> EmailExistsAsync(string email, int? excludeUserId = null)
    {
        return await _context.Users.AnyAsync(u => u.FatecEmail == email && u.Id != excludeUserId);
    }

    public async Task<bool> ContactPhoneExistsAsync(string phone, int? excludeUserId = null)
    {
        return await _context.Users.AnyAsync(u => u.Phone == phone && u.Id != excludeUserId);
    }

    public async Task<bool> ContactEmailExistsAsync(string contactEmail, int? excludeUserId = null)
    {
        return await _context.Users.AnyAsync(u => u.ContactEmail == contactEmail && u.Id != excludeUserId);
    }

    public async Task<User?> GetByEmailAsync(string email)
    {
        return await _context.Users.FirstOrDefaultAsync(u => u.FatecEmail == email);
    }

    public async Task<User?> GetByIdAsync(int id, bool includePreferences = false)
    {
        var query = _context.Users.AsQueryable();

        if (includePreferences)
        {
            query = query.Include(u => u.Preferences);
        }

        return await query.FirstOrDefaultAsync(u => u.Id == id);
    }

    public async Task<UserPreferences?> GetPreferencesByUserIdAsync(int userId)
    {
        return await _context.Users
            .Where(u => u.Id == userId)
            .Select(u => u.Preferences)
            .FirstOrDefaultAsync();
    }

    public async Task<(IReadOnlyList<ReadUserSummaryDto> Users, int Total)> GetAllAsync(UserFilterDto filter)
    {
        IQueryable<User> query = _context.Users.AsNoTracking();

        if (filter.Status.HasValue)
            query = query.Where(u => u.Status == filter.Status.Value);

        if (filter.ProfileType.HasValue)
            query = query.Where(u => u.ProfileType == filter.ProfileType.Value);

        if (!string.IsNullOrWhiteSpace(filter.Search))
        {
            string escapedSearchTerm = filter.Search.SanitizeSearchTerm();

            query = query.Where(u =>
                EF.Functions.ILike(
                    EF.Functions.Unaccent(u.FullName),
                    "%" + EF.Functions.Unaccent(escapedSearchTerm) + "%",
                    @"\"
                ) ||
                EF.Functions.ILike(
                    EF.Functions.Unaccent(u.FatecEmail),
                    "%" + EF.Functions.Unaccent(escapedSearchTerm) + "%",
                    @"\"
                ) ||
                EF.Functions.ILike(
                    EF.Functions.Unaccent(u.ContactEmail),
                    "%" + EF.Functions.Unaccent(escapedSearchTerm) + "%",
                    @"\"
                ) ||
                EF.Functions.ILike(
                    u.Phone,
                    "%" + escapedSearchTerm + "%",
                    @"\"
                ));
        }

        int total = await query.CountAsync();

        List<ReadUserSummaryDto> items = await query
            .OrderByDescending(u => u.CreatedAt)
            .ThenBy(u => u.Id)
            .Skip(filter.ItemsToSkip)
            .Take(filter.EffectivePageSize)
            .Select(u => new ReadUserSummaryDto(
                u.Id,
                u.FullName,
                u.FatecEmail,
                u.Phone == "" ? null : u.Phone,
                u.Status
            ))
            .ToListAsync();

        return (items, total);
    }

    public async Task AddAsync(User user)
    {
        _context.Users.Add(user);
        await _context.SaveChangesAsync();
    }

    public async Task SaveChangesAsync()
    {
        await _context.SaveChangesAsync();
    }

    public async Task<int?> GetTokenVersionAsync(int userId)
    {
        return await _context.Users
            .Where(user => user.Id == userId)
            .Select(user => (int?)user.TokenVersion)
            .FirstOrDefaultAsync();
    }

    public async Task IncrementTokenVersionAsync(int userId)
    {
        await _context.Users
            .Where(user => user.Id == userId)
            .ExecuteUpdateAsync(update => update
                .SetProperty(user => user.TokenVersion, user => user.TokenVersion + 1)
                .SetProperty(user => user.UpdatedAt, DateTime.UtcNow));
    }

    public async Task ReactivateAsync(int userId)
    {
        await _context.Users
            .Where(user => user.Id == userId)
            .ExecuteUpdateAsync(update => update
                .SetProperty(user => user.Status, EnumAccountStatus.Active)
                .SetProperty(user => user.UpdatedAt, DateTime.UtcNow));
    }
}
