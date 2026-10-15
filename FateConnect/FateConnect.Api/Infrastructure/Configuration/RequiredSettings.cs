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
    public required VapidKeys Vapid { get; init; }

    public static RequiredSettings Read(Func<string, string?> lookup) => new(
        DbConnection: EnvironmentUtils.Required("DB_CONNECTION", "to connect to the database", lookup),
        JwtSecret: EnvironmentUtils.Required("JWT_SECRET", "to sign the access tokens", lookup),
        JwtIssuer: EnvironmentUtils.Required("JWT_ISSUER", "to issue the access tokens", lookup),
        JwtAudience: EnvironmentUtils.Required("JWT_AUDIENCE", "to issue the access tokens", lookup),
        PublicUrl: EnvironmentUtils.Required("PUBLIC_URL", "to build the links in the e-mails", lookup),
        EmailSender: EnvironmentUtils.Required("EMAIL_SENDER", "to send e-mails", lookup),
        ResendApiKey: EnvironmentUtils.Required("RESEND_API_KEY", "to send e-mails", lookup))
    {
        Vapid = new VapidKeys(
            PublicKey: EnvironmentUtils.Required("VAPID_PUBLIC_KEY", "to send push notifications", lookup),
            PrivateKey: EnvironmentUtils.Required("VAPID_PRIVATE_KEY", "to send push notifications", lookup)),
    };
}

public sealed record VapidKeys(string PublicKey, string PrivateKey);
