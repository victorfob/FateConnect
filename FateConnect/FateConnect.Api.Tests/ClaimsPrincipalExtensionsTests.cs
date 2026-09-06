using System.Globalization;
using System.Security.Claims;
using FateConnect.Api.Modules.Auth.Constants;
using FateConnect.Api.Modules.Auth.Exceptions;
using FateConnect.Api.Modules.Auth.Extensions;

namespace FateConnect.Api.Tests;

public class ClaimsPrincipalExtensionsTests
{
    private const int UserId = 42;
    private const int TokenVersion = 3;

    [Fact]
    public void GetUserId_WithTheIdentityClaim_ReturnsTheIdentifier()
    {
        ClaimsPrincipal user = PrincipalWith(
            new Claim(ClaimTypes.NameIdentifier, UserId.ToString(CultureInfo.InvariantCulture)));

        int userId = user.GetUserId();

        Assert.Equal(UserId, userId);
    }

    [Fact]
    public void GetUserId_WithoutTheIdentityClaim_Throws()
    {
        ClaimsPrincipal user = PrincipalWith();

        Assert.Throws<UnidentifiedUserException>(() => user.GetUserId());
    }

    [Fact]
    public void GetTokenVersion_WithTheVersionClaim_ReturnsIt()
    {
        ClaimsPrincipal user = PrincipalWith(
            new Claim(TokenClaimNames.TokenVersion, TokenVersion.ToString(CultureInfo.InvariantCulture)));

        int version = user.GetTokenVersion();

        Assert.Equal(TokenVersion, version);
    }

    [Theory]
    [InlineData("")]
    [InlineData("nao-e-numero")]
    public void GetTokenVersion_WithAnUnreadableVersionClaim_Throws(string version)
    {
        ClaimsPrincipal user = PrincipalWith(new Claim(TokenClaimNames.TokenVersion, version));

        Assert.Throws<UnidentifiedTokenException>(() => user.GetTokenVersion());
    }

    [Fact]
    public void GetTokenVersion_WithoutTheVersionClaim_Throws()
    {
        ClaimsPrincipal user = PrincipalWith();

        Assert.Throws<UnidentifiedTokenException>(() => user.GetTokenVersion());
    }

    private static ClaimsPrincipal PrincipalWith(params Claim[] claims) =>
        new(new ClaimsIdentity(claims));
}
