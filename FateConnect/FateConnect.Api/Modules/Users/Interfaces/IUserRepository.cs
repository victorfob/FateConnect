using FateConnect.Api.Modules.Users.Entities;

namespace FateConnect.Api.Modules.Users.Interfaces;

public interface IUserRepository
{
    Task<bool> EmailExistsAsync(string email);
    Task<bool> ContactPhoneExistsAsync(string phone);
    Task<bool> ContactEmailExistsAsync(string contactEmail);
    Task<User?> GetByEmailAsync(string email);
    Task AddAsync(User user);
    Task<int?> GetTokenVersionAsync(int userId);
    Task IncrementTokenVersionAsync(int userId);
}
