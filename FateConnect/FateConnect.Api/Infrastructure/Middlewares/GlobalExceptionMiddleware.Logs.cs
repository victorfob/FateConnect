namespace FateConnect.Api.Infrastructure.Middlewares;

using Microsoft.Extensions.Logging;
using System;

public partial class GlobalExceptionMiddleware
{
    [LoggerMessage(EventId = 1, Level = LogLevel.Error, Message = "Unhandled error on {Method} {Route}.")]
    private static partial void LogUnhandledError(ILogger logger, string method, string route, Exception exception);

    [LoggerMessage(EventId = 2, Level = LogLevel.Warning, Message = "Handled error ({StatusCode}) {ExceptionType} on {Method} {Route} for user ID {UserId}.")]
    private static partial void LogBusinessWarning(ILogger logger, int statusCode, string exceptionType, string method, string route, string userId);

    [LoggerMessage(EventId = 3, Level = LogLevel.Information, Message = "Request {Method} {Route} aborted by the client.")]
    private static partial void LogRequestAborted(ILogger logger, string method, string route);
}
