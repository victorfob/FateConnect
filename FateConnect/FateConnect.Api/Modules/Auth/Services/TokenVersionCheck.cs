namespace FateConnect.Api.Modules.Auth.Services;

using System.Globalization;
using System.Security.Claims;
using System.Threading.Tasks;
using FateConnect.Api.Modules.Auth.Constants;
using FateConnect.Api.Modules.Users.Interfaces;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;

public static partial class TokenVersionCheck
{
    public static async Task RejectRevokedTokenAsync(TokenValidatedContext context)
    {
        ILogger logger = context.HttpContext.RequestServices
            .GetRequiredService<ILoggerFactory>()
            .CreateLogger(typeof(TokenVersionCheck));

        string? carriedVersion = context.Principal?.FindFirstValue(TokenClaimNames.TokenVersion);
        string? identifier = context.Principal?.FindFirstValue(ClaimTypes.NameIdentifier);

        bool isVersionReadable = int.TryParse(carriedVersion, CultureInfo.InvariantCulture, out int tokenVersion);
        bool isIdentifierReadable = int.TryParse(identifier, CultureInfo.InvariantCulture, out int userId);
        bool canCompareVersions = isVersionReadable && isIdentifierReadable;

        if (!canCompareVersions)
        {
            LogUnreadableTokenRefused(logger);
            context.Fail("The token carries no readable version and cannot be checked against the current one.");

            return;
        }

        IUserRepository users = context.HttpContext.RequestServices.GetRequiredService<IUserRepository>();

        int? currentVersion = await users.GetTokenVersionAsync(userId);

        if (currentVersion == tokenVersion)
            return;

        LogRevokedTokenRefused(logger, userId);
        context.Fail("The token version no longer matches the one the session carries.");
    }
}
