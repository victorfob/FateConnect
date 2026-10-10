namespace FateConnect.Api.Modules.Auth.Services;

using System;
using System.Globalization;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using FateConnect.Api.Modules.Auth.Constants;
using FateConnect.Api.Modules.Auth.Entities;
using FateConnect.Api.Modules.Auth.Interfaces;
using FateConnect.Api.Modules.Users.Entities;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;

public partial class TokenService(
    IOptions<JwtOptions> jwtOptions,
    ILogger<TokenService> logger
) : ITokenService
{
    private readonly JwtOptions _jwtOptions = jwtOptions.Value;

    public string GenerateJwtToken(User user)
    {
        JwtSecurityTokenHandler tokenHandler = new JwtSecurityTokenHandler();

        byte[] securityKey = Encoding.UTF8.GetBytes(_jwtOptions.Secret);
        ClaimsIdentity userClaims = BuildUserClaims(user);

        DateTime expirationDate = DateTime.UtcNow.AddHours(_jwtOptions.ExpirationHours);

        SecurityTokenDescriptor tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = userClaims,
            Expires = expirationDate,
            Issuer = _jwtOptions.Issuer,
            Audience = _jwtOptions.Audience,
            SigningCredentials = new SigningCredentials(
                new SymmetricSecurityKey(securityKey),
                SecurityAlgorithms.HmacSha256Signature)
        };

        SecurityToken token = tokenHandler.CreateToken(tokenDescriptor);

        LogJwtTokenGenerated(logger, user.Id, expirationDate);

        return tokenHandler.WriteToken(token);
    }

    private static ClaimsIdentity BuildUserClaims(User user)
    {
        Claim[] claims =
        [
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString(CultureInfo.InvariantCulture)),
            new Claim(TokenClaimNames.TokenVersion, user.TokenVersion.ToString(CultureInfo.InvariantCulture)),
            new Claim(ClaimTypes.Name, user.FullName),
            new Claim(ClaimTypes.Email, user.FatecEmail),
            new Claim(ClaimTypes.Role, user.ProfileType.ToString())
        ];

        return new ClaimsIdentity(claims);
    }
}
