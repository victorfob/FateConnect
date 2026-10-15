namespace FateConnect.Api.Infrastructure.Observability;

using System;
using Microsoft.AspNetCore.Http;
using Sentry;

public sealed class SentryErrorReporter(IHub hub) : IErrorReporter
{
    public const string RequestIdTag = "request_id";
    public const string RouteTag = "route";

    public void Report(Exception exception, HttpContext context)
    {
        hub.CaptureException(exception, scope =>
        {
            scope.SetTag(RequestIdTag, context.TraceIdentifier);
            scope.SetTag(RouteTag, context.RouteTemplate());
        });
    }
}
