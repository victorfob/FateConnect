using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using FateConnect.Api.Modules.Auth.Entities;
using FateConnect.Api.Modules.Auth.Services;
using FateConnect.Api.Modules.Users.Entities;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;

namespace FateConnect.Api.Tests;

public class TokenServiceTests
{
    private const string SecretWithAccent = "segredo-de-teste-com-acentuação-e-tamanho-suficiente";

    private const string Issuer = "FateConnectTest";
    private const string Audience = "FateConnectTestWeb";

    [Fact]
    public void GenerateJwtToken_IsAcceptedByAKeyBuiltInUtf8()
    {
        JwtOptions options = new()
        {
            Secret = SecretWithAccent,
            Issuer = Issuer,
            Audience = Audience,
        };

        string token = new TokenService(Options.Create(options))
            .GenerateJwtToken(new User
            {
                Id = 7,
                FullName = "Pessoa de Teste",
                FatecEmail = "pessoa@fatec.sp.gov.br",
            });

        ClaimsPrincipal principal = new JwtSecurityTokenHandler().ValidateToken(
            token,
            new TokenValidationParameters
            {
                ValidateIssuer = true,
                ValidateAudience = true,
                ValidateLifetime = true,
                ValidateIssuerSigningKey = true,
                ValidIssuer = Issuer,
                ValidAudience = Audience,
                IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(SecretWithAccent)),
                ClockSkew = TimeSpan.Zero,
            },
            out SecurityToken _);

        Assert.Equal("7", principal.FindFirstValue(ClaimTypes.NameIdentifier));
        Assert.Equal("Pessoa de Teste", principal.FindFirstValue(ClaimTypes.Name));
    }
}
