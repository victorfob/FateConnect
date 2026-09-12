namespace FateConnect.Api.Modules.Denunciations.Infrastructure;

using FateConnect.Api.Infrastructure.Database;
using FateConnect.Api.Modules.Common.Utils;
using FateConnect.Api.Modules.Denunciations.DTOs;
using FateConnect.Api.Modules.Denunciations.Entities;
using FateConnect.Api.Modules.Denunciations.Interfaces;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Threading.Tasks;

public class DenunciationRepository(FateConnectDbContext context) : IDenunciationRepository
{
    public async Task<(IReadOnlyList<Denunciation> Items, int Total)> GetAllAsync(DenunciationFilterDto filter)
    {
        IQueryable<Denunciation> query = context.Denunciations
            .AsNoTracking()
            .Include(d => d.User.Contacts);

        if (!string.IsNullOrWhiteSpace(filter.SearchTerm))
        {
            string escapedSearchTerm = filter.SearchTerm.SanitizeSearchTerm();

            query = query.Where(d =>
                EF.Functions.ILike(
                    EF.Functions.Unaccent(d.Description),
                    "%" + EF.Functions.Unaccent(escapedSearchTerm) + "%",
                    @"\"
                )
            );
        }

        if (filter.Category.HasValue)
            query = query.Where(d => d.Category == filter.Category.Value);

        if (filter.Status.HasValue)
            query = query.Where(d => d.Status == filter.Status.Value);

        DateOnly? rangeStart = filter.EffectiveDateFrom;
        DateOnly? rangeEnd = filter.EffectiveDateTo;

        if (rangeStart.HasValue && rangeEnd.HasValue)
            query = query.Where(CreatedWithin(rangeStart.Value, rangeEnd.Value));

        int total = await query.CountAsync();

        List<Denunciation> items = await query
            .OrderByDescending(d => d.CreatedAt)
            .ThenBy(d => d.Id)
            .Skip(filter.ItemsToSkip)
            .Take(filter.EffectivePageSize)
            .ToListAsync();

        return (items, total);
    }
    private static Expression<Func<Denunciation, bool>> CreatedWithin(DateOnly rangeStart, DateOnly rangeEnd)
    {
        DateTime startUtc = rangeStart.ToDateTime(TimeOnly.MinValue, DateTimeKind.Utc);
        DateTime endUtc = rangeEnd.ToDateTime(TimeOnly.MaxValue, DateTimeKind.Utc);

        return d => d.CreatedAt >= startUtc && d.CreatedAt <= endUtc;
    }

    public async Task<Denunciation?> GetByIdAsync(Guid id)
    {
        return await context.Denunciations
            .Include(d => d.User.Contacts)
            .FirstOrDefaultAsync(d => d.Id == id);
    }

    public async Task<Denunciation> AddAsync(Denunciation denunciation)
    {
        context.Denunciations.Add(denunciation);
        await context.SaveChangesAsync();

        await context.Entry(denunciation).Reference(d => d.User).LoadAsync();
        await context.Entry(denunciation.User).Collection(user => user.Contacts).LoadAsync();

        return denunciation;
    }

    public async Task UpdateAsync(Denunciation denunciation)
    {
        context.Denunciations.Update(denunciation);

        await context.SaveChangesAsync();
    }
}
