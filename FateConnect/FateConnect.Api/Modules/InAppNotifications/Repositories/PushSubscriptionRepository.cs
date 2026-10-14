namespace FateConnect.Api.Modules.InAppNotifications.Repositories;

using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using FateConnect.Api.Infrastructure.Database;
using FateConnect.Api.Modules.InAppNotifications.Entities;
using FateConnect.Api.Modules.InAppNotifications.Interfaces;
using Microsoft.EntityFrameworkCore;

public class PushSubscriptionRepository(FateConnectDbContext context) : IPushSubscriptionRepository
{
    public async Task<PushSubscription?> GetByEndpointAsync(string endpoint)
    {
        return await context.PushSubscriptions
            .FirstOrDefaultAsync(subscription => subscription.Endpoint == endpoint);
    }

    public async Task<IReadOnlyList<PushSubscription>> GetByUserAsync(int userId)
    {
        return await context.PushSubscriptions
            .AsNoTracking()
            .Where(subscription => subscription.UserId == userId)
            .OrderBy(subscription => subscription.Id)
            .ToListAsync();
    }

    public async Task AddAsync(PushSubscription subscription)
    {
        await context.PushSubscriptions.AddAsync(subscription);
    }

    public async Task RemoveAsync(int subscriptionId)
    {
        await context.PushSubscriptions
            .Where(subscription => subscription.Id == subscriptionId)
            .ExecuteDeleteAsync();
    }

    public async Task<int> RemoveAllOfUserAsync(int userId)
    {
        return await context.PushSubscriptions
            .Where(subscription => subscription.UserId == userId)
            .ExecuteDeleteAsync();
    }

    public async Task SaveChangesAsync()
    {
        await context.SaveChangesAsync();
    }
}
