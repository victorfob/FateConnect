using System.Collections.Concurrent;
using FateConnect.Api.Modules.InAppNotifications.Entities;
using FateConnect.Api.Modules.InAppNotifications.Enums;
using FateConnect.Api.Modules.InAppNotifications.Interfaces;

namespace FateConnect.Api.Tests.Fixtures;

public sealed record SentPush(string Endpoint, string Payload);

public sealed class RecordingPushSender : IPushSender
{
    private readonly ConcurrentQueue<SentPush> _sent = new();
    private readonly ConcurrentDictionary<string, EnumPushDelivery> _answers = new();

    public void AnswerFor(string endpoint, EnumPushDelivery delivery) => _answers[endpoint] = delivery;

    public Task<EnumPushDelivery> SendAsync(PushSubscription subscription, string payload)
    {
        _sent.Enqueue(new SentPush(subscription.Endpoint, payload));

        return Task.FromResult(_answers.GetValueOrDefault(subscription.Endpoint, EnumPushDelivery.Delivered));
    }

    public IReadOnlyList<SentPush> SentTo(string endpoint) =>
        _sent.Where(push => push.Endpoint == endpoint).ToList();
}
