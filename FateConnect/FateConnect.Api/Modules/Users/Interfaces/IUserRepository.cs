using FateConnect.Api.Modules.Users.Entities;

namespace FateConnect.Api.Modules.Users.Interfaces;

public interface IUserRepository
{
    Task<bool> EmailExistsAsync(string email);
    Task<User?> GetByEmailAsync(string email);
    Task AddAsync(User user);
}
