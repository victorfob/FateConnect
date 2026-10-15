namespace FateConnect.Api.Modules.InAppNotifications.Services;

using System;
using System.Net;
using System.Net.Http;
using System.Threading.Tasks;
using FateConnect.Api.Modules.InAppNotifications.Enums;
using FateConnect.Api.Modules.InAppNotifications.Interfaces;
using FateConnect.Api.Modules.InAppNotifications.Options;
using Microsoft.Extensions.Options;
using WebPush;
using WebPush.Model;

public sealed class WebPushSender(HttpClient httpClient, IOptions<PushOptions> options) : IPushSender, IDisposable
{
    private readonly WebPushClient _client = new(httpClient);

    private readonly WebPushOptions _options = new()
    {
        VapidDetails = new VapidDetails(options.Value.Subject, options.Value.PublicKey, options.Value.PrivateKey),
        ContentEncoding = ContentEncoding.Aes128gcm,
        Urgency = Urgency.High,
    };

    public async Task<EnumPushDelivery> SendAsync(Entities.PushSubscription subscription, string payload)
    {
        WebPush.PushSubscription device = new(subscription.Endpoint, subscription.P256dh, subscription.Auth);

        try
        {
            await _client.SendNotificationAsync(device, payload, _options);
            return EnumPushDelivery.Delivered;
        }
        catch (WebPushException exception)
            when (exception.StatusCode is HttpStatusCode.NotFound or HttpStatusCode.Gone)
        {
            return EnumPushDelivery.Gone;
        }
        catch (Exception exception) when (exception is WebPushException or HttpRequestException)
        {
            return EnumPushDelivery.Failed;
        }
    }

    public void Dispose() => _client.Dispose();
}
