namespace FateConnect.Api.Infrastructure.Middlewares;

using System.Net;
using FateConnect.Api.Modules.Auth.Exceptions;
using FateConnect.Api.Modules.Common.DTOs;
using FateConnect.Api.Modules.Rides.Exceptions;
using FateConnect.Api.Modules.Users.Exceptions;
using Microsoft.Extensions.Logging;

public partial class GlobalExceptionMiddleware(
    RequestDelegate next,
    ILogger<GlobalExceptionMiddleware> logger)
{
    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await next(context);
        }
        catch (Exception ex)
        {
            await HandleExceptionAsync(context, ex);
        }
    }

    private async Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        var statusCode = HttpStatusCode.InternalServerError;
        var errorMessage = "Algo deu errado. Tente novamente.";
        string? conflictingField = null;

        switch (exception)
        {
            case RideDomainException ex:
                statusCode = HttpStatusCode.BadRequest;
                errorMessage = ex.Message;
                break;

            case RideNotDrivenByUserException ex:
                statusCode = HttpStatusCode.Forbidden;
                errorMessage = ex.Message;
                break;

            case AlreadyRegisteredException ex:
                statusCode = HttpStatusCode.Conflict;
                errorMessage = ex.Message;
                conflictingField = ex.Field;
                break;

            case UnidentifiedUserException or UnidentifiedTokenException or InvalidCredentialsException:
                statusCode = HttpStatusCode.Unauthorized;
                errorMessage = exception.Message;
                break;

            case JwtNotConfiguredException ex:
                statusCode = HttpStatusCode.InternalServerError;
                errorMessage = ex.Message;
                break;
        }

        if (statusCode is HttpStatusCode.InternalServerError)
            LogUnhandledError(logger, exception);
        else
            LogBusinessWarning(logger, (int)statusCode, exception.GetType().Name);

        context.Response.ContentType = "application/json";
        context.Response.StatusCode = (int)statusCode;

        await context.Response.WriteAsJsonAsync(
            new ErrorResponseDto { Error = errorMessage, Field = conflictingField },
            context.RequestAborted);
    }

    [LoggerMessage(EventId = 1, Level = LogLevel.Error, Message = "Unhandled internal server error occurred.")]
    private static partial void LogUnhandledError(ILogger logger, Exception exception);

    [LoggerMessage(EventId = 2, Level = LogLevel.Warning, Message = "Handled error ({StatusCode}): {ExceptionType}")]
    private static partial void LogBusinessWarning(ILogger logger, int statusCode, string exceptionType);
}
