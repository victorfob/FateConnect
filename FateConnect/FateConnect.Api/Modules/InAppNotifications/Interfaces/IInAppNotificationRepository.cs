namespace FateConnect.Api.Modules.InAppNotifications.Interfaces;

using FateConnect.Api.Modules.InAppNotifications.Entities;
using System.Threading.Tasks;

public interface IInAppNotificationRepository
{
    Task<bool> UserAllowsInAppNotificationsAsync(int userId);
    Task<InAppNotification> AddAsync(InAppNotification notification);
    Task<List<int>> GetUserIdsInterestedInNeighborhoodAsync(string neighborhood, int driverId);
    Task AddRangeAsync(IEnumerable<InAppNotification> notifications);
}
