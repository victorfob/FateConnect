namespace FateConnect.Api.Modules.Auth.Extensions;

using System.Globalization;
using System.Security.Claims;
using FateConnect.Api.Modules.Auth.Constants;
using FateConnect.Api.Modules.Auth.Exceptions;
using FateConnect.Api.Modules.Users.Enums;

public static class ClaimsPrincipalExtensions
{
    public static int GetUserId(this ClaimsPrincipal user)
    {
        string? identifier = user.FindFirstValue(ClaimTypes.NameIdentifier);

        bool isValidUserId = int.TryParse(identifier, CultureInfo.InvariantCulture, out int userId);

        if (!isValidUserId)
            throw new UnidentifiedUserException();

        return userId;
    }

    public static bool IsAdministrator(this ClaimsPrincipal user) =>
        user.IsInRole(nameof(EnumProfileType.Administrator));

    public static int GetTokenVersion(this ClaimsPrincipal user)
    {
        string? version = user.FindFirstValue(TokenClaimNames.TokenVersion);

        bool isValidVersion = int.TryParse(version, CultureInfo.InvariantCulture, out int tokenVersion);

        if (!isValidVersion)
            throw new UnidentifiedTokenException();

        return tokenVersion;
    }
}
