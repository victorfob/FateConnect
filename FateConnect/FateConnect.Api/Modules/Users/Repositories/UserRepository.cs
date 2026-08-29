using FateConnect.Api.Infrastructure.Database;
using FateConnect.Api.Modules.Users.Entities;
using FateConnect.Api.Modules.Users.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace FateConnect.Api.Modules.Users.Repositories;

public class UserRepository : IUserRepository
{
    private readonly FateConnectDbContext _context;

    public UserRepository(FateConnectDbContext context)
    {
        _context = context;
    }

    public async Task<bool> ExisteEmailAsync(string email)
    {
        return await _context.Users.AnyAsync(u => u.FatecEmail == email);
    }

    public async Task<User?> ObterUsuarioPorEmailAsync(string email)
    {
        return await _context.Users.FirstOrDefaultAsync(u => u.FatecEmail == email);
    }

    public async Task AdicionarAsync(User usuario)
    {
        _context.Users.Add(usuario);
        await _context.SaveChangesAsync();
    }
}
