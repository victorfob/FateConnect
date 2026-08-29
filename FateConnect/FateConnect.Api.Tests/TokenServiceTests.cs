using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using FateConnect.Api.Modules.Auth.Entities;
using FateConnect.Api.Modules.Auth.Services;
using FateConnect.Api.Modules.Usuarios;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;

namespace FateConnect.Api.Tests;

public class TokenServiceTests
{
    private const string SecretWithAccent = "segredo-de-teste-com-acentuação-e-tamanho-suficiente";

    private const string Issuer = "FateConnectTest";
    private const string Audience = "FateConnectTestWeb";

    [Fact]
    public void GerarJwtToken_IsAcceptedByAKeyBuiltInUtf8()
    {
        JwtOptions options = new()
        {
            Secret = SecretWithAccent,
            Issuer = Issuer,
            Audience = Audience,
        };

        string token = new TokenService(Options.Create(options))
            .GerarJwtToken(new Usuario
            {
                Id = 7,
                NomeCompleto = "Pessoa de Teste",
                EmailFatec = "pessoa@fatec.sp.gov.br",
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
