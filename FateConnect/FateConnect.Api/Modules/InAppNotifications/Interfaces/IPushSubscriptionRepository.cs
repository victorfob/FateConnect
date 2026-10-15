namespace FateConnect.Api.Modules.InAppNotifications.Interfaces;

using System.Collections.Generic;
using System.Threading.Tasks;
using FateConnect.Api.Modules.InAppNotifications.Entities;

public interface IPushSubscriptionRepository
{
    Task<PushSubscription?> GetByEndpointAsync(string endpoint);
    Task<IReadOnlyList<PushSubscription>> GetByUserAsync(int userId);
    Task AddAsync(PushSubscription subscription);
    Task RemoveAsync(int subscriptionId);
    Task<int> RemoveAllOfUserAsync(int userId);
    Task SaveChangesAsync();
}
