namespace FateConnect.Api.Infrastructure.Observability;

using Sentry;

public static class SentryEventScrubber
{
    public static SentryEvent Scrub(SentryEvent sentryEvent, SentryHint hint)
    {
        sentryEvent.Request = new SentryRequest { Method = sentryEvent.Request.Method };
        sentryEvent.User = new SentryUser { Email = sentryEvent.User.Email };

        return sentryEvent;
    }
}
