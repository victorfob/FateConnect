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
        if (!user.TryGetUserId(out int userId))
            throw new UnidentifiedUserException();

        return userId;
    }

    public static bool TryGetUserId(this ClaimsPrincipal user, out int userId) =>
        int.TryParse(user.FindFirstValue(ClaimTypes.NameIdentifier), CultureInfo.InvariantCulture, out userId);

    public static bool TryGetTokenVersion(this ClaimsPrincipal user, out int tokenVersion) =>
        int.TryParse(user.FindFirstValue(TokenClaimNames.TokenVersion), CultureInfo.InvariantCulture, out tokenVersion);

    public static bool IsAdministrator(this ClaimsPrincipal user) =>
        user.IsInRole(nameof(EnumProfileType.Administrator));
}
