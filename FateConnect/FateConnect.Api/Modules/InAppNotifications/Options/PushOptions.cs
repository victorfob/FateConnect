namespace FateConnect.Api.Modules.InAppNotifications.Options;

public sealed class PushOptions(string subject, string publicKey, string privateKey)
{
    public string Subject { get; } = subject.TrimEnd('/');

    public string PublicKey { get; } = publicKey;

    public string PrivateKey { get; } = privateKey;
}
