namespace FateConnect.Api.Modules.InAppNotifications.DTOs;

using System;
using FateConnect.Api.Modules.InAppNotifications.Enums;

public record ReadInAppNotificationDto(
    int Id,
    EnumInAppNotificationType Type,
    string Content,
    string? ReferenceId,
    bool IsRead,
    DateTime CreatedAt
);
