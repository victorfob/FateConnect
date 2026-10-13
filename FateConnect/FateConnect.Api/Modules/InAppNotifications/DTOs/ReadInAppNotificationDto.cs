namespace FateConnect.Api.Modules.InAppNotifications.DTOs;

using System;
using FateConnect.Api.Modules.InAppNotifications.Enums;
using Swashbuckle.AspNetCore.Annotations;

public record ReadInAppNotificationDto(
    [property: SwaggerSchema("Notification ID.")]
    int Id,
    [property: SwaggerSchema("What the notification is about.")]
    EnumInAppNotificationType Type,
    [property: SwaggerSchema("Text of the notification, in Brazilian Portuguese.")]
    string Content,
    [property: SwaggerSchema("ID of what the notification points at, by type: the report, the ride or the item.")]
    string? ReferenceId,
    [property: SwaggerSchema("Whether the user already read it.")]
    bool IsRead,
    [property: SwaggerSchema("When it was created, in UTC.")]
    DateTime CreatedAt
);
