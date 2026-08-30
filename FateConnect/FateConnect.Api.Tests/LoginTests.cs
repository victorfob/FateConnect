using System.Net;
using System.Net.Http.Json;
using FateConnect.Api.Modules.Auth.DTOs;

namespace FateConnect.Api.Tests;

public class LoginTests(ApiFactory factory) : IClassFixture<ApiFactory>
{
    private const string KnownPassword = "SenhaForte123!";

    [Fact]
    public async Task Login_WithTheRightPassword_AnswersTheTokenAndTheName()
    {
        (_, string fatecEmail) = factory.SeedUserWithPassword("Mariana Alves Rocha", KnownPassword);

        HttpResponseMessage response = await factory.CreateClient()
            .PostAsJsonAsync("/Auth/login", new { fatecEmail, password = KnownPassword });

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        TokenResponseDto body = (await response.Content.ReadFromJsonAsync<TokenResponseDto>())!;

        Assert.Equal("Mariana Alves Rocha", body.FullName);
        Assert.False(string.IsNullOrWhiteSpace(body.Token));
    }

    [Fact]
    public async Task Login_WithTheWrongPassword_IsRejected()
    {
        (_, string fatecEmail) = factory.SeedUserWithPassword("Mariana Alves Rocha", KnownPassword);

        HttpResponseMessage response = await factory.CreateClient()
            .PostAsJsonAsync("/Auth/login", new { fatecEmail, password = "OutraSenha456!" });

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
        Assert.Contains("E-mail ou senha inválidos.", await response.Content.ReadAsStringAsync());
    }

    [Fact]
    public async Task Login_WithAnUnknownEmail_IsRejected()
    {
        HttpResponseMessage response = await factory.CreateClient()
            .PostAsJsonAsync("/Auth/login", new
            {
                fatecEmail = $"{Guid.NewGuid():N}@aluno.cps.sp.gov.br",
                password = KnownPassword,
            });

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }
}
