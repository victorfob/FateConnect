namespace FateConnect.Api.Modules.InAppNotifications.Services;

using System;
using System.Collections.Generic;
using System.Text.Json;
using System.Text.Json.Serialization;
using System.Threading.Tasks;
using FateConnect.Api.Modules.InAppNotifications.DTOs;
using FateConnect.Api.Modules.InAppNotifications.Entities;
using FateConnect.Api.Modules.InAppNotifications.Enums;
using FateConnect.Api.Modules.InAppNotifications.Interfaces;
using FateConnect.Api.Modules.InAppNotifications.Options;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

public partial class PushNotificationService(
    IPushSubscriptionRepository repository,
    IPushSender sender,
    IOptions<PushOptions> options,
    TimeProvider timeProvider,
    ILogger<PushNotificationService> logger
) : IPushNotificationService
{
    private static readonly JsonSerializerOptions PayloadOptions = new(JsonSerializerDefaults.Web)
    {
        Converters = { new JsonStringEnumConverter() },
    };

    public ReadPushPublicKeyDto GetPublicKey() => new(options.Value.PublicKey);

    public async Task SaveSubscriptionAsync(int currentUserId, SavePushSubscriptionDto dto)
    {
        PushSubscription? existing = await repository.GetByEndpointAsync(dto.Endpoint);

        if (existing is null)
            await repository.AddAsync(new PushSubscription(
                currentUserId,
                dto.Endpoint,
                dto.P256dh,
                dto.Auth,
                timeProvider.GetUtcNow().UtcDateTime));
        else
            existing.Renew(currentUserId, dto.P256dh, dto.Auth);

        await repository.SaveChangesAsync();
        LogPushSubscriptionSaved(logger, currentUserId);
    }

    public async Task SendAsync(ReadInAppNotificationDto notification, int userId)
    {
        IReadOnlyList<PushSubscription> subscriptions = await repository.GetByUserAsync(userId);

        string payload = JsonSerializer.Serialize(
            new PushPayloadDto(notification.Id, notification.Type, notification.Content, notification.ReferenceId),
            PayloadOptions);

        foreach (PushSubscription subscription in subscriptions)
            await DeliverAsync(subscription, payload, notification.Id, userId);
    }

    public async Task RemoveAllAsync(int userId)
    {
        int removed = await repository.RemoveAllOfUserAsync(userId);

        if (removed > 0)
            LogPushSubscriptionsRemoved(logger, removed, userId);
    }

    private async Task DeliverAsync(PushSubscription subscription, string payload, int notificationId, int userId)
    {
        EnumPushDelivery delivery = await sender.SendAsync(subscription, payload);

        switch (delivery)
        {
            case EnumPushDelivery.Delivered:
                LogPushDelivered(logger, notificationId, userId);
                break;
            case EnumPushDelivery.Gone:
                await repository.RemoveAsync(subscription.Id);
                LogPushDeviceGone(logger, subscription.Id, userId);
                break;
            default:
                LogPushDeliveryFailed(logger, notificationId, userId);
                break;
        }
    }
}
