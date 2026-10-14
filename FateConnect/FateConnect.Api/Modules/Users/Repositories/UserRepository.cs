namespace FateConnect.Api.Modules.Users.Repositories;

using System.Linq.Expressions;
using FateConnect.Api.Infrastructure.Database;
using FateConnect.Api.Modules.Common.Extensions;
using FateConnect.Api.Modules.Common.Utils;
using FateConnect.Api.Modules.Users.DTOs;
using FateConnect.Api.Modules.Users.Entities;
using FateConnect.Api.Modules.Users.Enums;
using FateConnect.Api.Modules.Users.Interfaces;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage;

public class UserRepository(FateConnectDbContext context, TimeProvider clock) : IUserRepository
{
    public async Task<bool> EmailExistsAsync(string email, int? excludeUserId = null)
    {
        var normalizedEmail = email.Trim().ToLowerInvariant();

        return await context.Users.AnyAsync(u => u.FatecEmail == normalizedEmail && u.Id != excludeUserId);
    }

    public async Task<bool> ContactPhoneExistsAsync(string phone, int? excludeUserId = null)
    {
        return await context.Users.AnyAsync(u => u.Phone == phone && u.Id != excludeUserId);
    }

    public async Task<bool> ContactEmailExistsAsync(string contactEmail, int? excludeUserId = null)
    {
        var normalizedEmail = contactEmail.Trim().ToLowerInvariant();

        return await context.Users.AnyAsync(u => u.ContactEmail == normalizedEmail && u.Id != excludeUserId);
    }

    public async Task<User?> GetByEmailAsync(string email)
    {
        var normalizedEmail = email.Trim().ToLowerInvariant();

        return await context.Users
            .FirstOrDefaultAsync(u => u.FatecEmail == normalizedEmail);
    }

    public async Task<User?> GetByEmailWithTokensAsync(string email, EnumTokenType tokenType)
    {
        var normalizedEmail = email.Trim().ToLowerInvariant();

        return await context.Users
            .Include(u => u.Tokens.Where(token => token.Type == tokenType))
            .FirstOrDefaultAsync(u => u.FatecEmail == normalizedEmail);
    }

    public async Task<User?> GetByIdAsync(int id, bool includePreferences = false, bool asNoTracking = false)
    {
        IQueryable<User> query = context.Users.AsTrackingWhen(!asNoTracking);

        if (includePreferences)
            query = query.Include(u => u.Preferences);

        return await query.FirstOrDefaultAsync(u => u.Id == id);
    }

    public async Task<UserPreferences?> GetPreferencesByUserIdAsync(int userId)
    {
        return await context.Users
            .Where(u => u.Id == userId)
            .Select(u => u.Preferences)
            .FirstOrDefaultAsync();
    }

    public async Task<(IReadOnlyList<TResult> Items, int Total)> GetAllAsync<TResult>(
        UserFilterDto filter,
        Expression<Func<User, TResult>> selector)
    {
        IQueryable<User> query = context.Users.AsNoTracking();

        if (filter.Status.HasValue)
            query = query.Where(u => u.Status == filter.Status.Value);

        if (filter.ProfileType.HasValue)
            query = query.Where(u => u.ProfileType == filter.ProfileType.Value);

        query = query.WhereAnyColumnContains(
            filter.SearchTerm,
            u => u.FullName,
            u => u.FatecEmail,
            u => u.ContactEmail!,
            u => u.Phone!);

        return await query.ToPageAsync(
            filter,
            users => users.OrderByDescending(u => u.CreatedAt).ThenBy(u => u.Id),
            selector);
    }

    public async Task AddAsync(User user)
    {
        context.Users.Add(user);
        await context.SaveChangesAsync();
    }

    public void AddAdministrativeAction(AdministrativeAction action)
    {
        context.AdministrativeActions.Add(action);
    }

    public async Task SaveChangesAsync()
    {
        await context.SaveChangesAsync();
    }

    public async Task InTransactionAsync(Func<Task> work)
    {
        await using IDbContextTransaction transaction = await context.Database.BeginTransactionAsync();

        await work();

        await transaction.CommitAsync();
    }

    public async Task<int?> GetTokenVersionAsync(int userId)
    {
        return await context.Users
            .Where(user => user.Id == userId)
            .Select(user => (int?)user.TokenVersion)
            .FirstOrDefaultAsync();
    }

    public async Task IncrementTokenVersionAsync(int userId)
    {
        await context.Users
            .Where(user => user.Id == userId)
            .ExecuteUpdateAsync(update => update
                .SetProperty(user => user.TokenVersion, user => user.TokenVersion + 1)
                .SetProperty(user => user.UpdatedAt, clock.GetUtcNow().UtcDateTime));
    }

    public async Task ReactivateAsync(int userId)
    {
        await context.Users
            .Where(user => user.Id == userId)
            .ExecuteUpdateAsync(update => update
                .SetProperty(user => user.Status, EnumAccountStatus.Active)
                .SetProperty(user => user.UpdatedAt, clock.GetUtcNow().UtcDateTime));
    }

    public async Task<UserToken?> GetTokenAsync(string tokenHash)
    {
        return await context.Set<UserToken>()
            .Include(t => t.User)
            .FirstOrDefaultAsync(t => t.Token == tokenHash);
    }
}
