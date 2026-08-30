namespace FateConnect.Api.Modules.Auth.Exceptions;

public class JwtNotConfiguredException : InvalidOperationException
{
    public JwtNotConfiguredException() : base("JWT_SECRET não configurado.")
    {
    }
}
