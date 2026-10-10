using System.Collections.Concurrent;
using FateConnect.Api.Modules.Communications.Interfaces;

namespace FateConnect.Api.Tests.Fixtures;

public enum SentEmailKind
{
    Confirmation,
    PasswordReset,
    AccountLocked
}

public sealed record SentEmail(SentEmailKind Kind, string ToEmail, string Link)
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

    public Task SendConfirmationEmailAsync(string toEmail, string fullName, string confirmationLink) =>
        Record(SentEmailKind.Confirmation, toEmail, confirmationLink);

    public Task SendPasswordResetEmailAsync(string toEmail, string fullName, string resetLink) =>
        Record(SentEmailKind.PasswordReset, toEmail, resetLink);

    public Task SendAccountLockedEmailAsync(string toEmail, string fullName, string unlockLink) =>
        Record(SentEmailKind.AccountLocked, toEmail, unlockLink);

    public IReadOnlyList<SentEmail> SentTo(string toEmail, SentEmailKind kind) =>
        _sent.Where(email => email.ToEmail == toEmail && email.Kind == kind).ToList();

    public async Task<IReadOnlyList<SentEmail>> WaitForAsync(string toEmail, SentEmailKind kind, int count = 1)
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

    private Task Record(SentEmailKind kind, string toEmail, string link)
    {
        _sent.Enqueue(new SentEmail(kind, toEmail, link));

        return Task.CompletedTask;
    }
}
