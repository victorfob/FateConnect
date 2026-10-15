namespace FateConnect.Api.Infrastructure.Validation;

using System;
using System.Linq;
using FateConnect.Api.Infrastructure.Observability;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;

public static partial class InvalidModelStateLogging
{
    public static Func<ActionContext, IActionResult> LoggingFirst(Func<ActionContext, IActionResult> respond) =>
        context =>
        {
            ILogger logger = context.HttpContext.RequestServices
                .GetRequiredService<ILoggerFactory>()
                .CreateLogger(typeof(InvalidModelStateLogging));

            string refusedFields = string.Join(", ", context.ModelState
                .Where(entry => entry.Value?.Errors.Count > 0)
                .Select(entry => entry.Key));

            LogValidationRefused(
                logger,
                context.HttpContext.Request.Method,
                context.HttpContext.RouteTemplate(),
                context.HttpContext.UserIdOrAnonymous(),
                refusedFields);

            return respond(context);
        };

    [LoggerMessage(
        EventId = 1,
        Level = LogLevel.Warning,
        Message = "Validation refused {Method} {Route} for user ID {UserId}, on the fields: {Fields}.")]
    private static partial void LogValidationRefused(
        ILogger logger,
        string method,
        string route,
        string userId,
        string fields);
}
