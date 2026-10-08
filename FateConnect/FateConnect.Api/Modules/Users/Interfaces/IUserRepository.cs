namespace FateConnect.Api.Modules.Users.Interfaces;

using System.Linq.Expressions;
using FateConnect.Api.Modules.Users.DTOs;
using FateConnect.Api.Modules.Users.Entities;

public interface IUserRepository
{
    Task<bool> EmailExistsAsync(string email, int? excludeUserId = null);
    Task<bool> ContactPhoneExistsAsync(string phone, int? excludeUserId = null);
    Task<bool> ContactEmailExistsAsync(string contactEmail, int? excludeUserId = null);

    Task<User?> GetByEmailAsync(string email);
    Task<User?> GetByIdAsync(int id, bool includePreferences = false, bool asNoTracking = false);
    Task<User?> GetByTokenAsync(string token);
    Task<UserPreferences?> GetPreferencesByUserIdAsync(int userId);
    Task<(IReadOnlyList<TResult> Items, int Total)> GetAllAsync<TResult>(
        UserFilterDto filter,
        Expression<Func<User, TResult>> selector
    );

    Task AddAsync(User user);
    void AddAdministrativeAction(AdministrativeAction action);
    Task SaveChangesAsync();

    Task<int?> GetTokenVersionAsync(int userId);
    Task IncrementTokenVersionAsync(int userId);
    Task ReactivateAsync(int userId);
}
