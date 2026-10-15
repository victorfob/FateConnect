namespace FateConnect.Api.Modules.InAppNotifications.Events;

using FateConnect.Api.Modules.InAppNotifications.DTOs;

public sealed record NotificationDispatchedEvent(
    ReadInAppNotificationDto Notification,
    int TargetUserId
);
