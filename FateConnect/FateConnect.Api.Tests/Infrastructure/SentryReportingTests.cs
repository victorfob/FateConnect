using System.Reflection;
using FateConnect.Api.Infrastructure.Observability;
using Microsoft.AspNetCore.Http;
using Sentry;

namespace FateConnect.Api.Tests.Infrastructure;

public class SentryReportingTests
{
    public class RecordingHub : DispatchProxy
    {
        public List<SentryEvent> Captured { get; } = [];

        public Scope LastScope { get; private set; } = new(new SentryOptions());

        protected override object? Invoke(MethodInfo? targetMethod, object?[]? args)
        {
            if (targetMethod?.Name == nameof(IHub.CaptureEvent) && args?[0] is SentryEvent sentryEvent)
            {
                Captured.Add(sentryEvent);
                LastScope = new Scope(new SentryOptions());
                args.OfType<Action<Scope>>().Single()(LastScope);
            }

            Type returnType = targetMethod!.ReturnType;

            return returnType == typeof(void) ? null : Activator.CreateInstance(returnType);
        }
    }

    [Fact]
    public void Report_TagsTheEventWithTheRequestIdAndTheRoute()
    {
        IHub hub = DispatchProxy.Create<IHub, RecordingHub>();
        RecordingHub recorder = (RecordingHub)hub;
        DefaultHttpContext context = new() { TraceIdentifier = "0HN7Q2:00000001" };
        context.Request.Path = "/Rides";
        InvalidOperationException thrown = new("banco fora");

        new SentryErrorReporter(hub).Report(thrown, context);

        Assert.Same(thrown, Assert.Single(recorder.Captured).Exception);
        Assert.Equal("0HN7Q2:00000001", recorder.LastScope.Tags[SentryErrorReporter.RequestIdTag]);
        Assert.Equal("/Rides", recorder.LastScope.Tags[SentryErrorReporter.RouteTag]);
    }

    [Fact]
    public void Scrub_KeepsTheMethodAndDropsEverythingThatCouldIdentifySomeone()
    {
        SentryEvent sentryEvent = new()
        {
            Request = new SentryRequest
            {
                Method = "PATCH",
                Url = "https://fateconnect.test/api/Users/42?busca=Jardim",
                QueryString = "busca=Jardim",
                Cookies = "sessao=abc",
                Data = "{\"password\":\"SenhaForte123!\"}",
            },
            User = new SentryUser { Id = "42", IpAddress = "203.0.113.7" },
        };
        sentryEvent.Request.Headers["Authorization"] = "Bearer token";

        SentryEvent scrubbed = SentryEventScrubber.Scrub(sentryEvent, new SentryHint());

        Assert.Equal("PATCH", scrubbed.Request.Method);
        Assert.Null(scrubbed.Request.Url);
        Assert.Null(scrubbed.Request.QueryString);
        Assert.Null(scrubbed.Request.Cookies);
        Assert.Null(scrubbed.Request.Data);
        Assert.Empty(scrubbed.Request.Headers);
        Assert.Null(scrubbed.User.Id);
        Assert.Null(scrubbed.User.IpAddress);
    }
}
