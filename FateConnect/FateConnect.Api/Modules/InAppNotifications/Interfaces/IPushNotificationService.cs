namespace FateConnect.Api.Modules.InAppNotifications.Interfaces;

using System.Threading.Tasks;
using FateConnect.Api.Modules.InAppNotifications.DTOs;

public interface IPushNotificationService
{
    ReadPushPublicKeyDto GetPublicKey();
    Task SaveSubscriptionAsync(int currentUserId, SavePushSubscriptionDto dto);
    Task SendAsync(ReadInAppNotificationDto notification, int userId);
    Task RemoveAllAsync(int userId);
}
