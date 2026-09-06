namespace FateConnect.Api.Modules.Users.Exceptions;

public class ContactEmailAlreadyRegisteredException : AlreadyRegisteredException
{
    public ContactEmailAlreadyRegisteredException(string contactEmail)
        : base("contactEmail", $"O e-mail de contato '{contactEmail}' já está em uso no sistema.")
    {
    }
}
