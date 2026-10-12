namespace FateConnect.Api.Modules.Communications.Extensions;

using FateConnect.Api.Modules.Communications.Exceptions;
using Microsoft.Extensions.Configuration;

public static class ConfigurationExtensions
{
    public static string RequiredPublicUrl(this IConfiguration configuration)
    {
        string publicUrl = configuration["PUBLIC_URL"]
            ?? throw new MissingCommunicationConfigurationException("PUBLIC_URL");

        return publicUrl.TrimEnd('/');
    }
}
