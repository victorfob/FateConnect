namespace FateConnect.Api.Modules.Auth.Exceptions;

public class DeactivatedAccountException : InvalidOperationException
{
    public DeactivatedAccountException()
        : base("Esta conta está desativada. Reative-a para entrar.")
    {
    }
}
