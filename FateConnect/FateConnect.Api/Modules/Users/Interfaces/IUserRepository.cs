namespace FateConnect.Api.Modules.Users.Interfaces;

using FateConnect.Api.Modules.Users.DTOs;
using FateConnect.Api.Modules.Users.Entities;

public interface IUserRepository
{
    Task<bool> EmailExistsAsync(string email, int? excludeUserId = null);
    Task<bool> ContactPhoneExistsAsync(string phone, int? excludeUserId = null);
    Task<bool> ContactEmailExistsAsync(string contactEmail, int? excludeUserId = null);

    Task<User?> GetByEmailAsync(string email);
    Task<User?> GetByIdAsync(int id, bool includePreferences = false);
    Task<(IReadOnlyList<User> Users, int Total)> GetAllAsync(UserFilterDto filter);

    Task AddAsync(User user);
    Task SaveChangesAsync();

    Task<int?> GetTokenVersionAsync(int userId);
    Task IncrementTokenVersionAsync(int userId);
    Task ReactivateAsync(int userId);
}
