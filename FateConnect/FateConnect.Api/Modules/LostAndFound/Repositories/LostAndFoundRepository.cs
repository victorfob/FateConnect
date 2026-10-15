namespace FateConnect.Api.Modules.LostAndFound.Repositories;

using System.Linq.Expressions;
using FateConnect.Api.Infrastructure.Database;
using FateConnect.Api.Modules.Common.Extensions;
using FateConnect.Api.Modules.Common.Utils;
using FateConnect.Api.Modules.LostAndFound.DTOs;
using FateConnect.Api.Modules.LostAndFound.Entities;
using FateConnect.Api.Modules.LostAndFound.Enums;
using FateConnect.Api.Modules.LostAndFound.Interfaces;
using FateConnect.Api.Modules.Users.Enums;
using Microsoft.EntityFrameworkCore;

public class LostAndFoundRepository(FateConnectDbContext context) : ILostAndFoundRepository
{
    public async Task<(
        IReadOnlyList<LostAndFoundRecord> Items,
        int Total)> GetAllAsync(LostAndFoundFilterDto filter, int? currentUserId = null)
    {
        IQueryable<LostAndFoundRecord> query = context.LostAndFoundRecords
            .AsNoTracking()
            .Include(r => r.User)
            .Where(IsVisible());

        if (currentUserId.HasValue)
            query = query.Where(r => r.UserId == currentUserId.Value);

        query = query.WhereMatchesEveryWord(filter.SearchTerm);

        if (filter.LostAndFoundType.HasValue)
            query = query.Where(r => r.LostAndFoundType == filter.LostAndFoundType.Value);

        if (filter.Status.HasValue)
            query = query.Where(r => r.Status == filter.Status.Value);

        query = query.WhereWithin(filter, OccurredWithin);

        return await query.ToPageAsync(filter, records => records.OrderByDescending(r => r.CreatedAt).ThenBy(r => r.Id));
    }

    private static Expression<Func<LostAndFoundRecord, bool>> IsVisible() =>
        record => record.User.Status == EnumAccountStatus.Active
            && record.DeletionReason != EnumDeletionReason.Administrator;

    private static Expression<Func<LostAndFoundRecord, bool>> OccurredWithin(DateOnly rangeStart, DateOnly rangeEnd) =>
        record => record.OccurredOn >= rangeStart && record.OccurredOn <= rangeEnd;

    public async Task<LostAndFoundRecord?> GetByIdAsync(Guid id, bool forChange = true)
    {
        return await context.LostAndFoundRecords
            .Include(r => r.User)
            .AsTrackingWhen(forChange)
            .Where(IsVisible())
            .FirstOrDefaultAsync(r => r.Id == id);
    }

    public async Task<LostAndFoundRecord> AddAsync(LostAndFoundRecord lostAndFoundRecord)
    {
        return await context.AddAndLoadAsync(lostAndFoundRecord, r => r.User);
    }

    public async Task<IReadOnlyList<LostAndFoundRecord>> GetOpenRecordsUntouchedSinceAsync(DateTime untouchedSince)
    {
        return await context.LostAndFoundRecords
            .Where(UntouchedWhileOpenSince(untouchedSince))
            .ToListAsync();
    }

    public async Task<IReadOnlyList<LostAndFoundRecord>> GetTerminalRecordsWithImageSinceAsync(DateTime terminalSince)
    {
        return await context.LostAndFoundRecords
            .Where(HoldsAnImageAndIsTerminalSince(terminalSince))
            .ToListAsync();
    }

    private static Expression<Func<LostAndFoundRecord, bool>> UntouchedWhileOpenSince(DateTime untouchedSince) =>
        record => record.Status == EnumLostAndFoundStatus.Open
            && (record.UpdatedAt ?? record.CreatedAt) <= untouchedSince;

    private static Expression<Func<LostAndFoundRecord, bool>> HoldsAnImageAndIsTerminalSince(DateTime terminalSince) =>
        record => record.ImageUrl != null
            && (record.Status == EnumLostAndFoundStatus.Resolved || record.Status == EnumLostAndFoundStatus.Deleted)
            && record.StatusChangedAt != null
            && record.StatusChangedAt <= terminalSince;

    public async Task SaveChangesAsync()
    {
        await context.SaveChangesAsync();
    }
}
