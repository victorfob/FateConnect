namespace FateConnect.Api.Modules.Users.Exceptions;

public abstract class AlreadyRegisteredException : InvalidOperationException
{
    protected AlreadyRegisteredException(string field, string message)
        : base(message)
    {
        Field = field;
    }

    public string Field { get; }
}
