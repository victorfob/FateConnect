namespace FateConnect.Api.Infrastructure.Configuration;

using FateConnect.Api.Modules.Common.Utils;

public sealed record RequiredSettings(
    string DbConnection,
    string JwtSecret,
    string JwtIssuer,
    string JwtAudience,
    string PublicUrl,
    string EmailSender,
    string ResendApiKey)
{
    public static RequiredSettings Read(Func<string, string?> lookup) => new(
        DbConnection: EnvironmentUtils.Required("DB_CONNECTION", "para conectar ao banco de dados", lookup),
        JwtSecret: EnvironmentUtils.Required("JWT_SECRET", "para assinar os tokens de acesso", lookup),
        JwtIssuer: EnvironmentUtils.Required("JWT_ISSUER", "para emitir os tokens de acesso", lookup),
        JwtAudience: EnvironmentUtils.Required("JWT_AUDIENCE", "para emitir os tokens de acesso", lookup),
        PublicUrl: EnvironmentUtils.Required("PUBLIC_URL", "para gerar os links dos e-mails", lookup),
        EmailSender: EnvironmentUtils.Required("EMAIL_SENDER", "para o envio de e-mails", lookup),
        ResendApiKey: EnvironmentUtils.Required("RESEND_API_KEY", "para o envio de e-mails", lookup));
}
