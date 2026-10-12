namespace FateConnect.Api.Infrastructure.Middlewares;

using System;
using System.Net;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using FateConnect.Api.Modules.Auth.Exceptions;
using FateConnect.Api.Modules.Common.DTOs;
using FateConnect.Api.Modules.Common.Exceptions;
using FateConnect.Api.Modules.Denunciations.Exceptions;
using FateConnect.Api.Modules.InAppNotifications.Exceptions;
using FateConnect.Api.Modules.LostAndFound.Exceptions;
using FateConnect.Api.Modules.Rides.Exceptions;
using FateConnect.Api.Modules.Users.Exceptions;

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
        string? errorCode = null;
        int? minutesRemaining = null;

        switch (exception)
        {
            case UnidentifiedTokenException:
            case InvalidCredentialsException:
            case UnidentifiedUserException:
                statusCode = HttpStatusCode.Unauthorized;
                errorMessage = exception.Message;
                break;

            case BannedAccountException:
            case DenunciationNotReportedByUserException:
            case LostAndFoundNotReportedByUserException:
            case RideNotDrivenByUserException:
                statusCode = HttpStatusCode.Forbidden;
                errorMessage = exception.Message;
                break;

            case ContactRequiredException:
                statusCode = HttpStatusCode.Forbidden;
                errorMessage = exception.Message;
                errorCode = ContactRequiredException.ErrorCode;
                break;

            case EmailNotConfirmedException:
                statusCode = HttpStatusCode.Forbidden;
                errorMessage = exception.Message;
                errorCode = EmailNotConfirmedException.ErrorCode;
                break;

            case UserNotFoundException:
            case InAppNotificationNotFoundException:
                statusCode = HttpStatusCode.NotFound;
                errorMessage = exception.Message;
                break;

            case DeactivatedAccountException:
                statusCode = HttpStatusCode.Conflict;
                errorMessage = exception.Message;
                break;

            case AlreadyRegisteredException ex:
                statusCode = HttpStatusCode.Conflict;
                errorMessage = ex.Message;
                conflictingField = ex.Field;
                break;

            case AccountLockedException lockedEx:
                statusCode = HttpStatusCode.TooManyRequests;
                errorMessage = lockedEx.Message;
                errorCode = AccountLockedException.ErrorCode;
                minutesRemaining = lockedEx.MinutesRemaining;
                break;

            case UserDomainException:
            case AuthDomainException:
            case InvalidUserIdentifierException:
            case DenunciationDomainException:
            case InvalidImageException:
            case LostAndFoundDomainException:
            case RideDomainException:
                statusCode = HttpStatusCode.BadRequest;
                errorMessage = exception.Message;
                break;
        }

        if (statusCode is HttpStatusCode.InternalServerError)
            LogUnhandledError(logger, exception);
        else
            LogBusinessWarning(logger, (int)statusCode, exception.GetType().Name);

        context.Response.ContentType = "application/json";
        context.Response.StatusCode = (int)statusCode;

        await context.Response.WriteAsJsonAsync(
            new ErrorResponseDto
            {
                Error = errorMessage,
                Field = conflictingField,
                Code = errorCode,
                MinutesRemaining = minutesRemaining
            },
            context.RequestAborted);
    }
}
