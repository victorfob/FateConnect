namespace FateConnect.Api.Modules.InAppNotifications.DTOs;

using FateConnect.Api.Modules.InAppNotifications.Enums;
using System;

public record ReadInAppNotificationDto(
    int Id,
    EnumInAppNotificationType Type,
    string Content,
    string? ReferenceId,
    bool IsRead,
    DateTime CreatedAt
);
