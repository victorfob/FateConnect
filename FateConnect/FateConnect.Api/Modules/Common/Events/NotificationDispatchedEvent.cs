namespace FateConnect.Api.Modules.Common.Events;

using FateConnect.Api.Modules.InAppNotifications.DTOs;

public sealed record NotificationDispatchedEvent(
    ReadInAppNotificationDto Notification,
    int TargetUserId
);
