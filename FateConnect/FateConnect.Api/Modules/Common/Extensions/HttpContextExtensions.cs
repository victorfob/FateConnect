namespace FateConnect.Api.Modules.Common.Extensions;

using FateConnect.Api.Modules.Common.DTOs;
using Microsoft.AspNetCore.Http;

public static class HttpContextExtensions
{
    private const int UserAgentMaxLength = 512;

    public static RequestOrigin GetRequestOrigin(this HttpContext context) =>
        new(ReadIpAddress(context), ReadUserAgent(context));

    private static string ReadIpAddress(HttpContext context) =>
        context.Connection.RemoteIpAddress?.ToString() ?? string.Empty;

    private static string ReadUserAgent(HttpContext context)
    {
        string userAgent = context.Request.Headers.UserAgent.ToString();

        if (userAgent.Length <= UserAgentMaxLength)
            return userAgent;

        return userAgent[..UserAgentMaxLength];
    }
}
