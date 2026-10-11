namespace FateConnect.Api.Modules.Users.Repositories;

using System.Linq.Expressions;
using FateConnect.Api.Infrastructure.Database;
using FateConnect.Api.Modules.Common.Utils;
using FateConnect.Api.Modules.Users.DTOs;
using FateConnect.Api.Modules.Users.Entities;
using FateConnect.Api.Modules.Users.Enums;
using FateConnect.Api.Modules.Users.Interfaces;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage;

public class UserRepository : IUserRepository
{
    private readonly FateConnectDbContext _context;

    public UserRepository(FateConnectDbContext context)
    {
        _context = context;
    }

    public async Task<bool> EmailExistsAsync(string email, int? excludeUserId = null)
    {
        var normalizedEmail = email.Trim().ToLowerInvariant();

        return await _context.Users.AnyAsync(u => u.FatecEmail == normalizedEmail && u.Id != excludeUserId);
    }

    public async Task<bool> ContactPhoneExistsAsync(string phone, int? excludeUserId = null)
    {
        return await _context.Users.AnyAsync(u => u.Phone == phone && u.Id != excludeUserId);
    }

    public async Task<bool> ContactEmailExistsAsync(string contactEmail, int? excludeUserId = null)
    {
        var normalizedEmail = contactEmail.Trim().ToLowerInvariant();

        return await _context.Users.AnyAsync(u => u.ContactEmail == normalizedEmail && u.Id != excludeUserId);
    }

    public async Task<User?> GetByEmailAsync(string email)
    {
        var normalizedEmail = email.Trim().ToLowerInvariant();

        return await _context.Users
            .FirstOrDefaultAsync(u => u.FatecEmail == normalizedEmail);
    }

    public async Task<User?> GetByEmailWithTokensAsync(string email, EnumTokenType tokenType)
    {
        var normalizedEmail = email.Trim().ToLowerInvariant();

        return await _context.Users
            .Include(u => u.Tokens.Where(token => token.Type == tokenType))
            .FirstOrDefaultAsync(u => u.FatecEmail == normalizedEmail);
    }

    public async Task<User?> GetByIdAsync(int id, bool includePreferences = false, bool asNoTracking = false)
    {
        var query = _context.Users.AsQueryable();

        if (asNoTracking)
        {
            query = query.AsNoTracking();
        }

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

    public async Task<(IReadOnlyList<TResult> Items, int Total)> GetAllAsync<TResult>(
        UserFilterDto filter,
        Expression<Func<User, TResult>> selector)
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
                    EF.Functions.Unaccent(u.ContactEmail!),
                    "%" + EF.Functions.Unaccent(escapedSearchTerm) + "%",
                    @"\"
                ) ||
                EF.Functions.ILike(
                    u.Phone!,
                    "%" + escapedSearchTerm + "%",
                    @"\"
                ));
        }

        int total = await query.CountAsync();

        List<TResult> items = await query
        .OrderByDescending(u => u.CreatedAt)
        .ThenBy(u => u.Id)
        .Skip(filter.ItemsToSkip)
        .Take(filter.EffectivePageSize)
        .Select(selector)
        .ToListAsync();

        return (items, total);
    }

    public async Task AddAsync(User user)
    {
        _context.Users.Add(user);
        await _context.SaveChangesAsync();
    }

    public void AddAdministrativeAction(AdministrativeAction action)
    {
        _context.AdministrativeActions.Add(action);
    }

    public async Task SaveChangesAsync()
    {
        await _context.SaveChangesAsync();
    }

    public async Task InTransactionAsync(Func<Task> work)
    {
        await using IDbContextTransaction transaction = await _context.Database.BeginTransactionAsync();

        await work();

        await transaction.CommitAsync();
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

    public async Task<UserToken?> GetTokenAsync(string tokenHash)
    {
        return await _context.Set<UserToken>()
            .Include(t => t.User)
            .FirstOrDefaultAsync(t => t.Token == tokenHash);
    }
}
