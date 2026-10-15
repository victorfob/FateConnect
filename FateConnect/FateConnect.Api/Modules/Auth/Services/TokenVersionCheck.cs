namespace FateConnect.Api.Modules.Auth.Services;

using System.Threading.Tasks;
using FateConnect.Api.Modules.Auth.Extensions;
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

        int tokenVersion = 0;
        int userId = 0;
        bool canCompareVersions = context.Principal is not null
            && context.Principal.TryGetTokenVersion(out tokenVersion)
            && context.Principal.TryGetUserId(out userId);

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
