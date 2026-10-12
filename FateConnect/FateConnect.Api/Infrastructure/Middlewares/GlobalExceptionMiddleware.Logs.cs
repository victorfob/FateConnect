namespace FateConnect.Api.Infrastructure.Middlewares;

using Microsoft.Extensions.Logging;
using System;

public partial class GlobalExceptionMiddleware
{
    [LoggerMessage(EventId = 1, Level = LogLevel.Error, Message = "Unhandled internal server error occurred.")]
    private static partial void LogUnhandledError(ILogger logger, Exception exception);

    [LoggerMessage(EventId = 2, Level = LogLevel.Warning, Message = "Handled error ({StatusCode}): {ExceptionType}")]
    private static partial void LogBusinessWarning(ILogger logger, int statusCode, string exceptionType);
}
