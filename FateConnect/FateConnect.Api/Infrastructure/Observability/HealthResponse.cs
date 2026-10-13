namespace FateConnect.Api.Infrastructure.Observability;

using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Diagnostics.HealthChecks;

public static class HealthResponse
{
    public static Task WriteAsync(HttpContext context, HealthReport report)
    {
        if (report.Status is HealthStatus.Healthy)
        {
            context.Response.ContentType = "text/plain";
            return context.Response.WriteAsync(report.Status.ToString(), context.RequestAborted);
        }

        Dictionary<string, object?> extensions = new() { ["health"] = report.Status.ToString() };

        return TypedResults
            .Problem(statusCode: context.Response.StatusCode, extensions: extensions)
            .ExecuteAsync(context);
    }
}
