namespace FateConnect.Api.Modules.InAppNotifications.Repositories;

using FateConnect.Api.Infrastructure.Database;
using FateConnect.Api.Modules.Common.Utils;
using FateConnect.Api.Modules.InAppNotifications.DTOs;
using FateConnect.Api.Modules.InAppNotifications.Entities;
using FateConnect.Api.Modules.InAppNotifications.Interfaces;
using FateConnect.Api.Modules.Users.Enums;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

public class InAppNotificationRepository(FateConnectDbContext context) : IInAppNotificationRepository
{
    public async Task<List<int>> GetEligibleUserIdsAsync(IEnumerable<int> userIds)
    {
        return await context.Users
            .AsNoTracking()
            .Where(u => userIds.Contains(u.Id))
            .Where(u => u.Status == EnumAccountStatus.Active)
            .Where(u => u.Preferences.ReceiveNotifications)
            .Select(u => u.Id)
            .ToListAsync();
    }

    public async Task<List<int>> GetUserIdsInterestedInDestinationAsync(string destination, int driverId)
    {
        return await context.Users
            .AsNoTracking()
            .Where(u => u.Id != driverId)
            .Where(u => u.Status == EnumAccountStatus.Active)
            .Where(u => u.Preferences.ReceiveNotifications)
            .Where(u => u.Neighborhood != null &&
            EF.Functions.ILike(
                EF.Functions.Unaccent(destination),
                "%" + EF.Functions.Unaccent(u.Neighborhood)
                    .Replace(@"\", @"\\")
                    .Replace("%", @"\%")
                    .Replace("_", @"\_")
                    + "%"))
            .Select(u => u.Id)
            .ToListAsync();
    }

    public async Task AddRangeAsync(IEnumerable<InAppNotification> notifications)
    {
        await context.InAppNotifications.AddRangeAsync(notifications);
    }

    public async Task<(IReadOnlyList<InAppNotification> Items, int Total)> GetAllAsync(FilterInAppNotificationDto filter, int userId)
    {
        IQueryable<InAppNotification> query = context.InAppNotifications
            .AsNoTracking()
            .Where(n => n.UserId == userId);

        if (filter.IsRead.HasValue)
            query = query.Where(n => n.IsRead == filter.IsRead.Value);

        if (filter.Type.HasValue)
            query = query.Where(n => n.Type == filter.Type.Value);

        int total = await query.CountAsync();

        List<InAppNotification> items = await query
            .OrderByDescending(n => n.CreatedAt)
            .ThenByDescending(n => n.Id)
            .Skip(filter.ItemsToSkip)
            .Take(filter.EffectivePageSize)
            .ToListAsync();

        return (items, total);
    }

    public async Task<InAppNotification?> GetByIdAndUserAsync(int id, int userId)
    {
        return await context.InAppNotifications
            .FirstOrDefaultAsync(n => n.Id == id && n.UserId == userId);
    }

    public async Task<int> GetUnreadCountAsync(int userId)
    {
        return await context.InAppNotifications
            .CountAsync(n => n.UserId == userId && !n.IsRead);
    }

    public async Task MarkAllAsReadAsync(int userId, DateTime readAt)
    {
        await context.InAppNotifications
            .Where(n => n.UserId == userId && !n.IsRead)
            .ExecuteUpdateAsync(s => s
                .SetProperty(n => n.IsRead, true)
                .SetProperty(n => n.UpdatedAt, readAt));
    }

    public async Task SaveChangesAsync()
    {
        await context.SaveChangesAsync();
    }
}
