using System.Globalization;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using FateConnect.Api.Modules.Auth.Entities;
using FateConnect.Api.Modules.Auth.Interfaces;
using FateConnect.Api.Modules.Users.Entities;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;

namespace FateConnect.Api.Modules.Auth.Services;

public class TokenService : ITokenService
{
    private readonly JwtOptions _jwtOptions;

    public TokenService(IOptions<JwtOptions> jwtOptions)
    {
        _jwtOptions = jwtOptions.Value;
    }

    public string GerarJwtToken(User usuario)
    {
        JwtSecurityTokenHandler tokenHandler = new JwtSecurityTokenHandler();

        byte[] chaveSeguranca = Encoding.UTF8.GetBytes(_jwtOptions.Secret);
        ClaimsIdentity claimsDoUsuario = CriarClaimsDoUsuario(usuario);

        SecurityTokenDescriptor tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = claimsDoUsuario,
            Expires = DateTime.UtcNow.AddHours(_jwtOptions.ExpirationHours),
            Issuer = _jwtOptions.Issuer,
            Audience = _jwtOptions.Audience,
            SigningCredentials = new SigningCredentials(
                new SymmetricSecurityKey(chaveSeguranca),
                SecurityAlgorithms.HmacSha256Signature)
        };

        SecurityToken token = tokenHandler.CreateToken(tokenDescriptor);

        return tokenHandler.WriteToken(token);
    }

    private static ClaimsIdentity CriarClaimsDoUsuario(User usuario)
    {
        Claim[] claims =
        [
            new Claim(ClaimTypes.NameIdentifier, usuario.Id.ToString(CultureInfo.InvariantCulture)),
            new Claim(ClaimTypes.Name, usuario.FullName),
            new Claim(ClaimTypes.Email, usuario.FatecEmail),
            new Claim(ClaimTypes.Role, usuario.ProfileType.ToString())
        ];

        return new ClaimsIdentity(claims);
    }
}
