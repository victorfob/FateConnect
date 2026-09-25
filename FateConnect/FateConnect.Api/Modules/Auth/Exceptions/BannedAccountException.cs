namespace FateConnect.Api.Modules.Auth.Exceptions;

public class BannedAccountException : InvalidOperationException
{
    public BannedAccountException()
        : base("Esta conta foi banida da plataforma.")
    {
    }
}
