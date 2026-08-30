namespace FateConnect.Api.Modules.Auth.Exceptions;

public class InvalidCredentialsException : UnauthorizedAccessException
{
    public InvalidCredentialsException()
        : base("E-mail ou senha inválido.")
    {
    }
}
