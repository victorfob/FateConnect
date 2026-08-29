using FateConnect.Api.Modules.Users.Entities;

namespace FateConnect.Api.Modules.Users.Interfaces;

public interface IUserRepository
{
    Task<bool> ExisteEmailAsync(string email);
    Task<User?> ObterUsuarioPorEmailAsync(string email);
    Task AdicionarAsync(User usuario);
}
