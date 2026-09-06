using System.Net;
using System.Text.Json;
using FateConnect.Api.Infrastructure.Middlewares;
using FateConnect.Api.Modules.Auth.Exceptions;
using FateConnect.Api.Modules.Rides.Exceptions;
using FateConnect.Api.Modules.Users.Exceptions;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging.Abstractions;

namespace FateConnect.Api.Tests;

public class GlobalExceptionMiddlewareTests
{
    private static async Task<(HttpStatusCode StatusCode, string Error, string? Field)> AnswerFor(Exception thrown)
    {
        await using ServiceProvider services = new ServiceCollection().BuildServiceProvider();

        DefaultHttpContext context = new() { RequestServices = services };

        using MemoryStream body = new();
        context.Response.Body = body;

        GlobalExceptionMiddleware middleware = new(
            _ => throw thrown,
            NullLogger<GlobalExceptionMiddleware>.Instance);

        await middleware.InvokeAsync(context);

        body.Position = 0;
        using JsonDocument document = await JsonDocument.ParseAsync(body);

        string? field = document.RootElement.TryGetProperty("field", out JsonElement raw) ? raw.GetString() : null;

        return ((HttpStatusCode)context.Response.StatusCode, document.RootElement.GetProperty("error").GetString()!, field);
    }

    [Fact]
    public async Task AnUnmappedException_AnswersTheFallbackMessageInPortuguese()
    {
        (HttpStatusCode statusCode, string error, _) = await AnswerFor(new TimeoutException("connection dropped"));

        Assert.Equal(HttpStatusCode.InternalServerError, statusCode);
        Assert.Equal("Algo deu errado. Tente novamente.", error);
    }

    [Fact]
    public async Task ARideDomainException_AnswersBadRequestWithItsOwnMessage()
    {
        (HttpStatusCode statusCode, string error, _) = await AnswerFor(new InvalidRideTypeException());

        Assert.Equal(HttpStatusCode.BadRequest, statusCode);
        Assert.Equal("Tipo de carona inválido.", error);
    }

    [Fact]
    public async Task ADuplicateEmail_AnswersConflictWithItsOwnMessage()
    {
        (HttpStatusCode statusCode, string error, string? field) =
            await AnswerFor(new EmailAlreadyRegisteredException("mariana.rocha@aluno.cps.sp.gov.br"));

        Assert.Equal(HttpStatusCode.Conflict, statusCode);
        Assert.Equal("O e-mail 'mariana.rocha@aluno.cps.sp.gov.br' já está em uso no sistema.", error);
        Assert.Equal("fatecEmail", field);
    }

    [Fact]
    public async Task ADuplicatePhone_AnswersConflictNamingThePhoneField()
    {
        (HttpStatusCode statusCode, string error, string? field) =
            await AnswerFor(new ContactPhoneAlreadyRegisteredException("15999990000"));

        Assert.Equal(HttpStatusCode.Conflict, statusCode);
        Assert.Equal("O telefone '15999990000' já está em uso no sistema.", error);
        Assert.Equal("phone", field);
    }

    [Fact]
    public async Task ADuplicateContactEmail_AnswersConflictNamingTheContactEmailField()
    {
        (HttpStatusCode statusCode, string error, string? field) =
            await AnswerFor(new ContactEmailAlreadyRegisteredException("mariana.rocha@gmail.com"));

        Assert.Equal(HttpStatusCode.Conflict, statusCode);
        Assert.Equal("O e-mail de contato 'mariana.rocha@gmail.com' já está em uso no sistema.", error);
        Assert.Equal("contactEmail", field);
    }

    [Fact]
    public async Task AnErrorWithoutAField_OmitsTheFieldFromTheBody()
    {
        (_, _, string? field) = await AnswerFor(new InvalidRideTypeException());

        Assert.Null(field);
    }

    [Fact]
    public async Task InvalidCredentials_AnswerUnauthorizedWithTheirOwnMessage()
    {
        (HttpStatusCode statusCode, string error, _) = await AnswerFor(new InvalidCredentialsException());

        Assert.Equal(HttpStatusCode.Unauthorized, statusCode);
        Assert.Equal("E-mail ou senha inválidos.", error);
    }

    [Fact]
    public async Task AMissingJwtSecret_AnswersInternalServerErrorWithItsOwnMessage()
    {
        (HttpStatusCode statusCode, string error, _) = await AnswerFor(new JwtNotConfiguredException());

        Assert.Equal(HttpStatusCode.InternalServerError, statusCode);
        Assert.Equal("JWT_SECRET não configurado.", error);
    }

    [Fact]
    public async Task AnUnidentifiedUser_AnswersUnauthorizedInPortuguese()
    {
        (HttpStatusCode statusCode, string error, _) = await AnswerFor(new UnidentifiedUserException());

        Assert.Equal(HttpStatusCode.Unauthorized, statusCode);
        Assert.Equal("Sessão expirada. Entre novamente para continuar.", error);
    }
}
