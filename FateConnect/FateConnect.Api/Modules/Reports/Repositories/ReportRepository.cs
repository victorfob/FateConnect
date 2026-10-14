namespace FateConnect.Api.Modules.Reports.Repositories;

using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Threading.Tasks;
using FateConnect.Api.Infrastructure.Database;
using FateConnect.Api.Modules.Common.Extensions;
using FateConnect.Api.Modules.Common.Utils;
using FateConnect.Api.Modules.Reports.DTOs;
using FateConnect.Api.Modules.Reports.Entities;
using FateConnect.Api.Modules.Reports.Interfaces;
using Microsoft.EntityFrameworkCore;

public class ReportRepository(FateConnectDbContext context) : IReportRepository
{
    public async Task<(
        IReadOnlyList<Report> Items,
        int Total)> GetAllAsync(ReportFilterDto filter, int? reporterId = null)
    {
        IQueryable<Report> query = context.Reports
            .AsNoTracking()
            .Include(d => d.User);

        if (reporterId.HasValue)
            query = query.Where(d => d.UserId == reporterId.Value);

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

        return await query.ToPageAsync(filter, reports => reports.OrderByDescending(d => d.CreatedAt).ThenBy(d => d.Id));
    }
    private static Expression<Func<Report, bool>> CreatedWithin(DateOnly rangeStart, DateOnly rangeEnd)
    {
        DateTime startUtc = DateTimeUtils.ToUtcFromProductTimeZone(rangeStart, TimeOnly.MinValue);
        DateTime endUtc = DateTimeUtils.ToUtcFromProductTimeZone(rangeEnd, TimeOnly.MaxValue);

        return d => d.CreatedAt >= startUtc && d.CreatedAt <= endUtc;
    }

    public async Task<Report?> GetByIdAsync(Guid id, bool forChange = true)
    {
        IQueryable<Report> query = context.Reports
            .Include(d => d.User);

        if (!forChange)
            query = query.AsNoTracking();

        return await query.FirstOrDefaultAsync(d => d.Id == id);
    }

    public async Task<Report> AddAsync(Report report)
    {
        context.Reports.Add(report);
        await context.SaveChangesAsync();

        if (!report.IsAnonymous)
            await context.Entry(report).Reference(d => d.User).LoadAsync();

        return report;
    }

    public async Task SaveChangesAsync()
    {
        await context.SaveChangesAsync();
    }
}
