namespace FateConnect.Api.Modules.Users.Exceptions;

public class ContactPhoneAlreadyRegisteredException : AlreadyRegisteredException
{
    public ContactPhoneAlreadyRegisteredException(string phone)
        : base("phone", $"O telefone '{phone}' já está em uso no sistema.")
    {
    }
}
