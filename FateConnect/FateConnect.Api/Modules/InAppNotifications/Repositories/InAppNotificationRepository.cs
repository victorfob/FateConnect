namespace FateConnect.Api.Modules.InAppNotifications.Repositories;

using FateConnect.Api.Infrastructure.Database;
using FateConnect.Api.Modules.InAppNotifications.Entities;
using FateConnect.Api.Modules.InAppNotifications.Interfaces;
using Microsoft.EntityFrameworkCore;
using System.Linq;
using System.Threading.Tasks;

public class InAppNotificationRepository(FateConnectDbContext context) : IInAppNotificationRepository
{
    public async Task<bool> UserAllowsInAppNotificationsAsync(int userId)
    {
        return await context.UserPreferences
            .AsNoTracking()
            .Where(p => p.UserId == userId)
            .Select(p => p.ReceiveNotifications)
            .SingleAsync();
    }

    public async Task<InAppNotification> AddAsync(InAppNotification notification)
    {
        context.InAppNotifications.Add(notification);
        await context.SaveChangesAsync();

        return notification;
    }
}
