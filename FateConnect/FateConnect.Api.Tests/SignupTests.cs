using System.Net;
using System.Net.Http.Json;

namespace FateConnect.Api.Tests;

public class SignupTests : IClassFixture<ApiFactory>
{
    private readonly ApiFactory _factory;

    public SignupTests(ApiFactory factory) => _factory = factory;

    private static object SignupPayload(object contacts) => new
    {
        fatecEmail = $"sonda{Guid.NewGuid():N}@aluno.cps.sp.gov.br",
        password = "SenhaForte123!",
        fullName = "Mariana Alves Rocha",
        birthDate = "2000-01-01T00:00:00Z",
        gender = "Male",
        addresses = new[] { new { zipCode = "18040-430", street = "Rua Cesário Mota", streetNumber = "1", complement = "Casa", city = "Sorocaba", state = "SP" } },
        contacts = contacts,
    };

    [Fact]
    public async Task Signup_WithOneContact_IsAccepted()
    {
        HttpResponseMessage r = await _factory.CreateClient().PostAsJsonAsync(
            "/Users/signup",
            SignupPayload(new[] { new { phone = "15999990000", contactEmail = "mariana.rocha@gmail.com" } }));

        string corpo = await r.Content.ReadAsStringAsync();

        Assert.True(r.StatusCode == HttpStatusCode.Created, $"status={r.StatusCode} corpo={corpo}");
    }

    [Fact]
    public async Task Signup_WithAnEmptyContactList_IsRejected()
    {
        HttpResponseMessage r = await _factory.CreateClient()
            .PostAsJsonAsync("/Users/signup", SignupPayload(Array.Empty<object>()));

        Assert.Equal(HttpStatusCode.BadRequest, r.StatusCode);
    }

    [Fact]
    public async Task Signup_WithoutTheContactField_IsRejected()
    {
        HttpResponseMessage r = await _factory.CreateClient().PostAsJsonAsync("/Users/signup", new
        {
            fatecEmail = $"sonda{Guid.NewGuid():N}@aluno.cps.sp.gov.br",
            password = "SenhaForte123!",
            fullName = "Mariana Alves Rocha",
            birthDate = "2000-01-01T00:00:00Z",
            gender = "Male",
            addresses = new[] { new { zipCode = "18040-430", street = "Rua Cesário Mota", streetNumber = "1", complement = "Casa", city = "Sorocaba", state = "SP" } },
        });

        Assert.Equal(HttpStatusCode.BadRequest, r.StatusCode);
    }
}
