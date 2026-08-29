namespace FateConnect.Api.Modules.Auth.Extensions;

using System.Globalization;
using System.Security.Claims;
using FateConnect.Api.Modules.Auth.Exceptions;

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
}
