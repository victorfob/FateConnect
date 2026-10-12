namespace FateConnect.Api.Modules.InAppNotifications.Interfaces;

using FateConnect.Api.Modules.InAppNotifications.DTOs;
using FateConnect.Api.Modules.InAppNotifications.Entities;
using System.Threading.Tasks;

public interface IInAppNotificationRepository
{
    Task<List<int>> GetEligibleUserIdsAsync(IEnumerable<int> userIds);
    Task<InAppNotification> AddAsync(InAppNotification notification);
    Task<List<int>> GetUserIdsInterestedInDestinationAsync(string destination, int driverId);
    Task AddRangeAsync(IEnumerable<InAppNotification> notifications);
    Task<(IReadOnlyList<InAppNotification> Items, int Total)> GetAllAsync(FilterInAppNotificationDto filter, int userId);
    Task<InAppNotification?> GetByIdAndUserAsync(int id, int userId);
    Task<int> GetUnreadCountAsync(int userId);
    Task MarkAllAsReadAsync(int userId, DateTime readAt);
    Task SaveChangesAsync();
}
