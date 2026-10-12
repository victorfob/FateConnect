using System.Collections.Concurrent;
using FateConnect.Api.Modules.Communications.Enums;
using FateConnect.Api.Modules.Communications.Interfaces;

namespace FateConnect.Api.Tests.Fixtures;

public sealed record SentEmail(EnumAccountEmail Kind, string ToEmail, string Link)
{
    public string Token => QueryValue("token");

    public string QueryValue(string name) =>
        new Uri(Link).Query.TrimStart('?')
            .Split('&')
            .Select(pair => pair.Split('=', 2))
            .Single(pair => pair[0] == name)[1];
}

public sealed class RecordingEmailService : IEmailService
{
    private static readonly TimeSpan DeliveryTimeout = TimeSpan.FromSeconds(20);
    private static readonly TimeSpan PollInterval = TimeSpan.FromMilliseconds(100);

    private readonly ConcurrentQueue<SentEmail> _sent = new();

    public Task SendAsync(EnumAccountEmail email, string toEmail, string fullName, string link)
    {
        _sent.Enqueue(new SentEmail(email, toEmail, link));

        return Task.CompletedTask;
    }

    public IReadOnlyList<SentEmail> SentTo(string toEmail, EnumAccountEmail kind) =>
        _sent.Where(email => email.ToEmail == toEmail && email.Kind == kind).ToList();

    public async Task<IReadOnlyList<SentEmail>> WaitForAsync(string toEmail, EnumAccountEmail kind, int count = 1)
    {
        DateTime deadline = DateTime.UtcNow + DeliveryTimeout;

        while (DateTime.UtcNow < deadline)
        {
            IReadOnlyList<SentEmail> sent = SentTo(toEmail, kind);

            if (sent.Count >= count)
                return sent;

            await Task.Delay(PollInterval);
        }

        throw new TimeoutException($"Expected {count} {kind} email(s) to {toEmail}, got {SentTo(toEmail, kind).Count}.");
    }
}
