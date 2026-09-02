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

    public async Task<bool> EmailExistsAsync(string email)
    {
        return await _context.Users.AnyAsync(u => u.FatecEmail == email);
    }

    public async Task<bool> ContactPhoneExistsAsync(string phone)
    {
        return await _context.Contacts.AnyAsync(c => c.Phone == phone);
    }

    public async Task<bool> ContactEmailExistsAsync(string contactEmail)
    {
        return await _context.Contacts.AnyAsync(c => c.ContactEmail == contactEmail);
    }

    public async Task<User?> GetByEmailAsync(string email)
    {
        return await _context.Users.FirstOrDefaultAsync(u => u.FatecEmail == email);
    }

    public async Task AddAsync(User user)
    {
        _context.Users.Add(user);
        await _context.SaveChangesAsync();
    }
}
