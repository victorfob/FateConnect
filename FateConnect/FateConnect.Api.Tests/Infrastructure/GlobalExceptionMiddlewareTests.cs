using System.Net;
using System.Security.Claims;
using System.Text.Json;
using FateConnect.Api.Infrastructure.Middlewares;
using FateConnect.Api.Infrastructure.Observability;
using FateConnect.Api.Modules.Auth.Exceptions;
using FateConnect.Api.Modules.Rides.Exceptions;
using FateConnect.Api.Modules.Users.Exceptions;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Logging.Testing;

namespace FateConnect.Api.Tests.Infrastructure;

public class GlobalExceptionMiddlewareTests
{
    private sealed class RecordingErrorReporter : IErrorReporter
    {
        public List<Exception> Reported { get; } = [];

        public void Report(Exception exception, HttpContext context) => Reported.Add(exception);
    }

    private sealed record Outcome(HttpContext Context, FakeLogger<GlobalExceptionMiddleware> Logger, RecordingErrorReporter Reporter);

    private static async Task<Outcome> Run(Exception thrown, Action<DefaultHttpContext>? prepare = null)
    {
        DefaultHttpContext context = new()
        {
            RequestServices = new ServiceCollection().AddLogging().AddProblemDetails().BuildServiceProvider()
        };
        context.Request.Method = HttpMethods.Post;
        context.Request.Path = "/Rides";
        context.Response.Body = new MemoryStream();
        prepare?.Invoke(context);

        FakeLogger<GlobalExceptionMiddleware> logger = new();
        RecordingErrorReporter reporter = new();
        GlobalExceptionMiddleware middleware = new(_ => throw thrown, reporter, logger);

        await middleware.InvokeAsync(context);

        return new Outcome(context, logger, reporter);
    }

    private static async Task<JsonDocument> ParseBodyAsync(Outcome outcome)
    {
        Stream body = outcome.Context.Response.Body;

        body.Position = 0;
        return await JsonDocument.ParseAsync(body);
    }

    private static async Task<JsonDocument> BodyFor(Exception thrown) => await ParseBodyAsync(await Run(thrown));

    private static async Task<(HttpStatusCode StatusCode, string Detail, string? Field)> AnswerFor(Exception thrown)
    {
        Outcome outcome = await Run(thrown);
        using JsonDocument document = await ParseBodyAsync(outcome);

        string? field = document.RootElement.TryGetProperty("field", out JsonElement raw) ? raw.GetString() : null;

        return ((HttpStatusCode)outcome.Context.Response.StatusCode, document.RootElement.GetProperty("detail").GetString()!, field);
    }

    [Fact]
    public async Task AHandledError_LogsTheStatusTheRouteAndWhoAsked()
    {
        Outcome outcome = await Run(new InvalidRideTypeException(), context =>
            context.User = new ClaimsPrincipal(new ClaimsIdentity([new Claim(ClaimTypes.NameIdentifier, "42")], "Bearer")));

        FakeLogRecord record = Assert.Single(outcome.Logger.Collector.GetSnapshot());
        Assert.Equal(LogLevel.Warning, record.Level);
        Assert.Equal("Handled error (400) InvalidRideTypeException on POST /Rides for user ID 42.", record.Message);
        Assert.Empty(outcome.Reporter.Reported);
    }

    [Fact]
    public async Task AHandledErrorWithoutASession_LogsTheUserAsAnonymous()
    {
        Outcome outcome = await Run(new InvalidCredentialsException());

        Assert.EndsWith("for user ID anonymous.", Assert.Single(outcome.Logger.Collector.GetSnapshot()).Message);
    }

    [Fact]
    public async Task AnUnmappedException_LogsAnErrorAndReportsIt()
    {
        TimeoutException thrown = new("connection dropped");

        Outcome outcome = await Run(thrown);

        FakeLogRecord record = Assert.Single(outcome.Logger.Collector.GetSnapshot());
        Assert.Equal(LogLevel.Error, record.Level);
        Assert.Equal("Unhandled error on POST /Rides.", record.Message);
        Assert.Same(thrown, record.Exception);
        Assert.Same(thrown, Assert.Single(outcome.Reporter.Reported));
    }

    [Fact]
    public async Task ARequestTheClientAborted_IsNeitherAnErrorNorReported()
    {
        Outcome outcome = await Run(new OperationCanceledException(), context =>
            context.RequestAborted = new CancellationToken(canceled: true));

        FakeLogRecord record = Assert.Single(outcome.Logger.Collector.GetSnapshot());
        Assert.Equal(LogLevel.Information, record.Level);
        Assert.Equal("Request POST /Rides aborted by the client.", record.Message);
        Assert.Empty(outcome.Reporter.Reported);
        Assert.Equal(StatusCodes.Status200OK, outcome.Context.Response.StatusCode);
    }

    [Fact]
    public async Task ACancellationTheClientDidNotAsk_StaysAnUnhandledError()
    {
        Outcome outcome = await Run(new OperationCanceledException());

        Assert.Equal(StatusCodes.Status500InternalServerError, outcome.Context.Response.StatusCode);
        Assert.Single(outcome.Reporter.Reported);
    }

    [Fact]
    public async Task AnUnmappedException_AnswersTheFallbackMessageInPortuguese()
    {
        (HttpStatusCode statusCode, string detail, _) = await AnswerFor(new TimeoutException("connection dropped"));

        Assert.Equal(HttpStatusCode.InternalServerError, statusCode);
        Assert.Equal("Algo deu errado. Tente novamente.", detail);
    }

    [Fact]
    public async Task ARideDomainException_AnswersBadRequestWithItsOwnMessage()
    {
        (HttpStatusCode statusCode, string detail, _) = await AnswerFor(new InvalidRideTypeException());

        Assert.Equal(HttpStatusCode.BadRequest, statusCode);
        Assert.Equal("Tipo de carona inválido.", detail);
    }

    [Fact]
    public async Task ADuplicateEmail_AnswersConflictWithItsOwnMessage()
    {
        (HttpStatusCode statusCode, string detail, string? field) =
            await AnswerFor(new EmailAlreadyRegisteredException("mariana.rocha@aluno.cps.sp.gov.br"));

        Assert.Equal(HttpStatusCode.Conflict, statusCode);
        Assert.Equal("O e-mail 'mariana.rocha@aluno.cps.sp.gov.br' já está em uso no sistema.", detail);
        Assert.Equal("fatecEmail", field);
    }

    [Fact]
    public async Task ADuplicatePhone_AnswersConflictNamingThePhoneField()
    {
        (HttpStatusCode statusCode, string detail, string? field) =
            await AnswerFor(new ContactPhoneAlreadyRegisteredException("15999990000"));

        Assert.Equal(HttpStatusCode.Conflict, statusCode);
        Assert.Equal("O telefone '15999990000' já está em uso no sistema.", detail);
        Assert.Equal("phone", field);
    }

    [Fact]
    public async Task ADuplicateContactEmail_AnswersConflictNamingTheContactEmailField()
    {
        (HttpStatusCode statusCode, string detail, string? field) =
            await AnswerFor(new ContactEmailAlreadyRegisteredException("mariana.rocha@gmail.com"));

        Assert.Equal(HttpStatusCode.Conflict, statusCode);
        Assert.Equal("O e-mail de contato 'mariana.rocha@gmail.com' já está em uso no sistema.", detail);
        Assert.Equal("contactEmail", field);
    }

    [Fact]
    public async Task AnErrorWithoutAFieldOrCode_OmitsBothFromTheBody()
    {
        using JsonDocument body = await BodyFor(new InvalidRideTypeException());

        Assert.False(body.RootElement.TryGetProperty("field", out _));
        Assert.False(body.RootElement.TryGetProperty("code", out _));
        Assert.False(body.RootElement.TryGetProperty("minutesRemaining", out _));
    }

    [Fact]
    public async Task AHandledError_AnswersProblemDetailsWithTheStatusTitle()
    {
        Outcome outcome = await Run(new InvalidRideTypeException());
        using JsonDocument body = await ParseBodyAsync(outcome);

        Assert.Equal("application/problem+json", outcome.Context.Response.ContentType);
        Assert.Equal(StatusCodes.Status400BadRequest, body.RootElement.GetProperty("status").GetInt32());
        Assert.Equal("Bad Request", body.RootElement.GetProperty("title").GetString());
    }

    [Fact]
    public async Task InvalidCredentials_AnswerUnauthorizedWithTheirOwnMessage()
    {
        (HttpStatusCode statusCode, string detail, _) = await AnswerFor(new InvalidCredentialsException());

        Assert.Equal(HttpStatusCode.Unauthorized, statusCode);
        Assert.Equal("E-mail ou senha inválidos.", detail);
    }

    [Fact]
    public async Task AnUnidentifiedUser_AnswersUnauthorizedInPortuguese()
    {
        (HttpStatusCode statusCode, string detail, _) = await AnswerFor(new UnidentifiedUserException());

        Assert.Equal(HttpStatusCode.Unauthorized, statusCode);
        Assert.Equal("Sessão expirada. Entre novamente para continuar.", detail);
    }
}
