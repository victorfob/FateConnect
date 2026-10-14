using System.Globalization;
using System.Security.Claims;
using FateConnect.Api.Modules.Auth.Constants;
using FateConnect.Api.Modules.Auth.Exceptions;
using FateConnect.Api.Modules.Auth.Extensions;
using FateConnect.Api.Modules.Users.Enums;

namespace FateConnect.Api.Tests.Auth;

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

    [Theory]
    [InlineData(nameof(EnumProfileType.Administrator), true)]
    [InlineData(nameof(EnumProfileType.Operator), false)]
    public void IsAdministrator_FollowsTheProfileClaim(string profile, bool expected)
    {
        ClaimsPrincipal user = PrincipalWith(new Claim(ClaimTypes.Role, profile));

        bool isAdministrator = user.IsAdministrator();

        Assert.Equal(expected, isAdministrator);
    }

    [Fact]
    public void TryGetTokenVersion_WithTheVersionClaim_ReturnsIt()
    {
        ClaimsPrincipal user = PrincipalWith(
            new Claim(TokenClaimNames.TokenVersion, TokenVersion.ToString(CultureInfo.InvariantCulture)));

        bool isReadable = user.TryGetTokenVersion(out int version);

        Assert.True(isReadable);
        Assert.Equal(TokenVersion, version);
    }

    [Theory]
    [InlineData("")]
    [InlineData("nao-e-numero")]
    public void TryGetTokenVersion_WithAnUnreadableVersionClaim_AnswersFalse(string version)
    {
        ClaimsPrincipal user = PrincipalWith(new Claim(TokenClaimNames.TokenVersion, version));

        Assert.False(user.TryGetTokenVersion(out _));
    }

    [Fact]
    public void TryGetTokenVersion_WithoutTheVersionClaim_AnswersFalse()
    {
        ClaimsPrincipal user = PrincipalWith();

        Assert.False(user.TryGetTokenVersion(out _));
    }

    private static ClaimsPrincipal PrincipalWith(params Claim[] claims) =>
        new(new ClaimsIdentity(claims));
}
