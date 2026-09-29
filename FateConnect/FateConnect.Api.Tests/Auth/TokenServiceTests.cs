using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using FateConnect.Api.Modules.Auth.Entities;
using FateConnect.Api.Modules.Auth.Services;
using FateConnect.Api.Modules.Users.Entities;
using FateConnect.Api.Modules.Users.Enums;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;

namespace FateConnect.Api.Tests.Auth;

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

        User testUser = new User(
            fatecEmail: "mariana.rocha@aluno.cps.sp.gov.br",
            passwordHash: "HashFalso123",
            fullName: "Mariana Alves Rocha",
            birthDate: new DateTime(2000, 1, 1, 0, 0, 0, DateTimeKind.Utc),
            gender: EnumGender.Female,
            contact: new UserContact("11999999999", "mariana.contato@gmail.com"),
            createdAt: DateTime.UtcNow
        )
        {
            Id = 7
        };

        string token = new TokenService(Options.Create(options)).GenerateJwtToken(testUser);

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
        Assert.Equal("Mariana Alves Rocha", principal.FindFirstValue(ClaimTypes.Name));
    }

    [Fact]
    public void GenerateJwtToken_ForAUserWhoseProfileWasNeverSet_CarriesADefinedRole()
    {
        JwtOptions options = new()
        {
            Secret = SecretWithAccent,
            Issuer = Issuer,
            Audience = Audience,
        };

        User testUser = new User(
            fatecEmail: "mariana.rocha@aluno.cps.sp.gov.br",
            passwordHash: "HashFalso123",
            fullName: "Mariana Alves Rocha",
            birthDate: new DateTime(2000, 1, 1, 0, 0, 0, DateTimeKind.Utc),
            gender: EnumGender.Female,
            contact: new UserContact("11999999999", "mariana.contato@gmail.com"),
            createdAt: DateTime.UtcNow
        )
        {
            Id = 7
        };

        string token = new TokenService(Options.Create(options)).GenerateJwtToken(testUser);

        Claim role = Assert.Single(
            new JwtSecurityTokenHandler().ReadJwtToken(token).Claims,
            claim => claim.Type is ClaimTypes.Role or "role");

        Assert.Equal(nameof(EnumProfileType.Operator), role.Value);
    }
}
