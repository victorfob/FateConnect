namespace FateConnect.Api.Modules.Emails.Options;

public sealed class EmailOptions(string publicUrl, string sender)
{
    public string PublicUrl { get; } = publicUrl.TrimEnd('/');

    public string Sender { get; } = sender;
}
