namespace FateConnect.Api.Modules.Users.Exceptions;

public class EmailAlreadyRegisteredException : InvalidOperationException
{
    public EmailAlreadyRegisteredException(string email)
        : base($"O e-mail '{email}' já está em uso no sistema.")
    {
    }
}
