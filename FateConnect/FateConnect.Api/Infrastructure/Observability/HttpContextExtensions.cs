namespace FateConnect.Api.Infrastructure.Observability;

using System.Security.Claims;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;

public static class HttpContextExtensions
{
    private const string AnonymousUser = "anonymous";

    public static string RouteTemplate(this HttpContext context)
    {
        if (context.GetEndpoint() is RouteEndpoint endpoint)
            return endpoint.RoutePattern.RawText ?? context.Request.Path.ToString();

        return context.Request.Path.ToString();
    }

    public static string UserIdOrAnonymous(this HttpContext context) =>
        context.User.FindFirstValue(ClaimTypes.NameIdentifier) ?? AnonymousUser;

    public static string? UserEmail(this HttpContext context) =>
        context.User.FindFirstValue(ClaimTypes.Email);
}
