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

        query = query.WhereAnyColumnContains(filter.SearchTerm, d => d.Description);

        if (filter.Category.HasValue)
            query = query.Where(d => d.Category == filter.Category.Value);

        if (filter.Status.HasValue)
            query = query.Where(d => d.Status == filter.Status.Value);

        query = query.WhereWithin(filter, CreatedWithin);

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
        return await context.Reports
            .Include(d => d.User)
            .AsTrackingWhen(forChange)
            .FirstOrDefaultAsync(d => d.Id == id);
    }

    public async Task<Report> AddAsync(Report report)
    {
        return await context.AddAndLoadAsync(report, d => d.User, loadsReference: !report.IsAnonymous);
    }

    public async Task SaveChangesAsync()
    {
        await context.SaveChangesAsync();
    }
}
