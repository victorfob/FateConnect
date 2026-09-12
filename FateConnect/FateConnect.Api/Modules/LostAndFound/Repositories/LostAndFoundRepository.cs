namespace FateConnect.Api.Modules.LostAndFound.Repositories;

using System.Linq.Expressions;
using FateConnect.Api.Infrastructure.Database;
using FateConnect.Api.Modules.Common.Utils;
using FateConnect.Api.Modules.LostAndFound.DTOs;
using FateConnect.Api.Modules.LostAndFound.Entities;
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

        if (!string.IsNullOrWhiteSpace(filter.SearchTerm))
        {
            string escapedSearchTerm = filter.SearchTerm.SanitizeSearchTerm();

            query = query.Where(r =>
                EF.Functions.ILike(
                    EF.Functions.Unaccent(r.Name),
                    "%" + EF.Functions.Unaccent(escapedSearchTerm) + "%",
                    @"\"
                ) ||
                EF.Functions.ILike(
                    EF.Functions.Unaccent(r.Description ?? ""),
                    "%" + EF.Functions.Unaccent(escapedSearchTerm) + "%",
                    @"\"
                )
            );
        }

        if (filter.LostAndFoundType.HasValue)
            query = query.Where(r => r.LostAndFoundType == filter.LostAndFoundType.Value);

        if (filter.Status.HasValue)
            query = query.Where(r => r.Status == filter.Status.Value);

        DateOnly? rangeStart = filter.EffectiveDateFrom;
        DateOnly? rangeEnd = filter.EffectiveDateTo;

        if (rangeStart.HasValue && rangeEnd.HasValue)
            query = query.Where(OccurredWithin(rangeStart.Value, rangeEnd.Value));

        int total = await query.CountAsync();

        List<LostAndFoundRecord> items = await query
            .OrderByDescending(r => r.CreatedAt)
            .ThenBy(r => r.Id)
            .Skip(filter.ItemsToSkip)
            .Take(filter.EffectivePageSize)
            .ToListAsync();

        return (items, total);
    }

    private static Expression<Func<LostAndFoundRecord, bool>> OccurredWithin(DateOnly rangeStart, DateOnly rangeEnd) =>
        record => record.OcurredOn >= rangeStart && record.OcurredOn <= rangeEnd;

    public async Task<LostAndFoundRecord?> GetByIdAsync(Guid id, bool forChange = true)
    {
        IQueryable<LostAndFoundRecord> query = context.LostAndFoundRecords
            .Include(r => r.User.Contacts);

        if (!forChange)
            query = query.AsNoTracking();

        return await query.FirstOrDefaultAsync(r => r.Id == id);
    }

    public async Task<LostAndFoundRecord> AddAsync(LostAndFoundRecord lostAndFoundRecord)
    {
        context.LostAndFoundRecords.Add(lostAndFoundRecord);
        await context.SaveChangesAsync();

        await context.Entry(lostAndFoundRecord).Reference(r => r.User).LoadAsync();
        await context.Entry(lostAndFoundRecord.User).Collection(user => user.Contacts).LoadAsync();

        return lostAndFoundRecord;
    }

    public async Task SaveChangesAsync()
    {
        await context.SaveChangesAsync();
    }
}
