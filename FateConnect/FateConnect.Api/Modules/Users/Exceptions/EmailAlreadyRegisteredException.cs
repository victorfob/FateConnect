namespace FateConnect.Api.Modules.Users.Exceptions;

public class EmailAlreadyRegisteredException : AlreadyRegisteredException
{
    public EmailAlreadyRegisteredException(string email)
        : base("fatecEmail", $"O e-mail '{email}' já está em uso no sistema.")
    {
    }
}
