namespace FateConnect.Api.Modules.InAppNotifications.Interfaces;

using System.Threading.Tasks;
using FateConnect.Api.Modules.InAppNotifications.Entities;
using FateConnect.Api.Modules.InAppNotifications.Enums;

public interface IPushSender
{
    Task<EnumPushDelivery> SendAsync(PushSubscription subscription, string payload);
}
