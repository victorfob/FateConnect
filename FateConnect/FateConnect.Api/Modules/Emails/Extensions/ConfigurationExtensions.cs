namespace FateConnect.Api.Modules.Emails.Extensions;

using FateConnect.Api.Modules.Emails.Exceptions;
using Microsoft.Extensions.Configuration;

public static class ConfigurationExtensions
{
    public static string RequiredPublicUrl(this IConfiguration configuration)
    {
        string publicUrl = configuration["PUBLIC_URL"]
            ?? throw new MissingEmailConfigurationException("PUBLIC_URL");

        return publicUrl.TrimEnd('/');
    }
}
