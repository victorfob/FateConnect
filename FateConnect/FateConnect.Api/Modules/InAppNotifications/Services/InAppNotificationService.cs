namespace FateConnect.Api.Modules.InAppNotifications.Services;

using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using FateConnect.Api.Modules.Common.DTOs;
using FateConnect.Api.Modules.InAppNotifications.DTOs;
using FateConnect.Api.Modules.InAppNotifications.Entities;
using FateConnect.Api.Modules.InAppNotifications.Enums;
using FateConnect.Api.Modules.InAppNotifications.Events;
using FateConnect.Api.Modules.InAppNotifications.Exceptions;
using FateConnect.Api.Modules.InAppNotifications.Interfaces;
using MassTransit;
using Microsoft.Extensions.Logging;

public partial class InAppNotificationService(
    IInAppNotificationRepository repository,
    IPublishEndpoint publishEndpoint,
    TimeProvider timeProvider,
    ILogger<InAppNotificationService> logger
) : IInAppNotificationService
{
    public async Task<PagedResultDto<ReadInAppNotificationDto>> GetAllAsync(
        FilterInAppNotificationDto filter,
        int currentUserId)
    {
        (IReadOnlyList<InAppNotification> records, int total) = await repository.GetAllAsync(filter, currentUserId);

        LogNotificationsRetrieved(logger, currentUserId, records.Count);

        return filter.ToResult<ReadInAppNotificationDto>([.. records.Select(MapToReadDto)], total);
    }

    public async Task<int> GetUnreadCountAsync(int currentUserId)
    {
        return await repository.GetUnreadCountAsync(currentUserId);
    }

    public async Task MarkAsReadAsync(int notificationId, int currentUserId)
    {
        var notification = await repository.GetByIdAndUserAsync(notificationId, currentUserId);

        if (notification is null)
        {
            LogNotificationNotFound(logger, notificationId, currentUserId);
            throw new InAppNotificationNotFoundException();
        }

        notification.MarkAsRead(timeProvider.GetUtcNow().UtcDateTime);

        await repository.SaveChangesAsync();
        LogNotificationMarkedAsRead(logger, notificationId, currentUserId);
    }

    public async Task MarkAllAsReadAsync(int currentUserId)
    {
        DateTime now = timeProvider.GetUtcNow().UtcDateTime;

        await repository.MarkAllAsReadAsync(currentUserId, now);

        LogAllNotificationsMarkedAsRead(logger, currentUserId);
    }

    public async Task<int> NotifyAsync(
        IEnumerable<int> userIds,
        EnumInAppNotificationType type,
        string content,
        string referenceId)
    {
        List<int> validUserIds = await repository.GetEligibleUserIdsAsync(userIds);

        if (validUserIds.Count == 0)
            return 0;

        DateTime now = timeProvider.GetUtcNow().UtcDateTime;

        var notifications = validUserIds.Select(userId => new InAppNotification(
            userId: userId,
            type: type,
            content: content,
            referenceId: referenceId,
            createdAt: now
        )).ToList();

        await repository.AddRangeAsync(notifications);
        await repository.SaveChangesAsync();

        foreach (var notification in notifications)
            await publishEndpoint.Publish(
                new NotificationDispatchedEvent(MapToReadDto(notification), notification.UserId));

        await repository.SaveChangesAsync();

        return notifications.Count;
    }

    private static ReadInAppNotificationDto MapToReadDto(InAppNotification entity) =>
        new(
            Id: entity.Id,
            Type: entity.Type,
            Content: entity.Content,
            ReferenceId: entity.ReferenceId,
            IsRead: entity.IsRead,
            CreatedAt: entity.CreatedAt
        );
}
