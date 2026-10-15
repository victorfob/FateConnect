namespace FateConnect.Api.Modules.InAppNotifications.Interfaces;

using System.Threading.Tasks;
using FateConnect.Api.Modules.InAppNotifications.DTOs;
using FateConnect.Api.Modules.InAppNotifications.Entities;

public interface IInAppNotificationRepository
{
    Task<List<int>> GetEligibleUserIdsAsync(IEnumerable<int> userIds, bool ignoresPreference);
    Task<List<int>> GetUserIdsInterestedInDestinationAsync(string destination, int driverId);
    Task AddRangeAsync(IEnumerable<InAppNotification> notifications);
    Task<(
        IReadOnlyList<InAppNotification> Items,
        int Total)> GetAllAsync(FilterInAppNotificationDto filter, int userId);
    Task<InAppNotification?> GetByIdAndUserAsync(int id, int userId);
    Task<int> GetUnreadCountAsync(int userId);
    Task MarkAllAsReadAsync(int userId, DateTime readAt);
    Task SaveChangesAsync();
}
