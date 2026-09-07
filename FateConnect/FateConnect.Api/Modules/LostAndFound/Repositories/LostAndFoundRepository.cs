namespace FateConnect.Api.Modules.LostAndFound.Repositories;

using FateConnect.Api.Infrastructure.Database;
using FateConnect.Api.Modules.LostAndFound.DTOs;
using FateConnect.Api.Modules.LostAndFound.Entities;
using FateConnect.Api.Modules.LostAndFound.Enums;
using FateConnect.Api.Modules.LostAndFound.Interfaces;
using Microsoft.EntityFrameworkCore;

public class LostAndFoundRepository(FateConnectDbContext context) : ILostAndFoundRepository
{
    public async Task<(IReadOnlyList<LostAndFoundRecord> Items, int Total)> GetAllAsync(FilterLostAndFoundDto filter, int? currentUserId = null)
    {
        IQueryable<LostAndFoundRecord> query = context.LostAndFoundRecords
            .AsNoTracking()
            .Include(r => r.User.Contacts);

        if (currentUserId.HasValue)
            query = query.Where(r => r.UserId == currentUserId.Value);

        if (!string.IsNullOrWhiteSpace(filter.Name))
        {
            string escapedName = filter.Name
                .Replace(@"\", @"\\")
                .Replace("%", @"\%")
                .Replace("_", @"\_");

            query = query.Where(r =>
                EF.Functions.ILike(
                    EF.Functions.Unaccent(r.Name),
                    "%" + EF.Functions.Unaccent(escapedName) + "%",
                    @"\"
                ) ||
                EF.Functions.ILike(
                    EF.Functions.Unaccent(r.Description),
                    "%" + EF.Functions.Unaccent(escapedName) + "%",
                    @"\"
                )
            );
        }

        if (filter.LostAndFoundType.HasValue)
            query = query.Where(r => r.LostAndFoundType == filter.LostAndFoundType.Value);

        query = filter.Status is not null
            ? query.Where(r => r.Status == filter.Status)
            : query.Where(r => r.Status == EnumStatusLostAndFound.Open);

        if (filter.OcurredOn.HasValue)
            query = query.Where(r => r.OcurredOn == filter.OcurredOn.Value);

        int total = await query.CountAsync();

        List<LostAndFoundRecord> items = await query
            .OrderByDescending(r => r.CreatedAt)
            .ThenBy(r => r.Id)
            .Skip(filter.ItemsToSkip)
            .Take(filter.EffectivePageSize)
            .ToListAsync();

        return (items, total);
    }

    public async Task<LostAndFoundRecord?> GetByIdAsync(Guid id)
    {
        return await context.LostAndFoundRecords
            .Include(r => r.User.Contacts)
            .FirstOrDefaultAsync(r => r.Id == id);
    }

    public async Task<LostAndFoundRecord> AddAsync(LostAndFoundRecord lostAndFoundRecord)
    {
        context.LostAndFoundRecords.Add(lostAndFoundRecord);
        await context.SaveChangesAsync();

        await context.Entry(lostAndFoundRecord).Reference(r => r.User).LoadAsync();
        await context.Entry(lostAndFoundRecord.User).Collection(user => user.Contacts).LoadAsync();

        return lostAndFoundRecord;
    }

    public async Task UpdateAsync(LostAndFoundRecord lostAndFoundRecord)
    {
        context.LostAndFoundRecords.Update(lostAndFoundRecord);
        await context.SaveChangesAsync();
    }
}
