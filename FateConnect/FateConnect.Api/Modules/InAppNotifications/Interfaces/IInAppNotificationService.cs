namespace FateConnect.Api.Modules.InAppNotifications.Interfaces;

using FateConnect.Api.Modules.Common.DTOs;
using FateConnect.Api.Modules.InAppNotifications.DTOs;
using FateConnect.Api.Modules.InAppNotifications.Enums;
using System.Threading.Tasks;

public interface IInAppNotificationService
{
    Task<PagedResultDto<ReadInAppNotificationDto>> GetAllAsync(FilterInAppNotificationDto filter, int currentUserId);
    Task<int> GetUnreadCountAsync(int currentUserId);
    Task MarkAsReadAsync(int notificationId, int currentUserId);
    Task MarkAllAsReadAsync(int currentUserId);
    Task<int> NotifyAsync(IEnumerable<int> userIds, EnumInAppNotificationType type, string content, string referenceId);
}
