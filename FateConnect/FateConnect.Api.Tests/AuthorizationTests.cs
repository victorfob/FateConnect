using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;

namespace FateConnect.Api.Tests;

public class AuthorizationTests : IClassFixture<ApiFactory>
{
    private readonly ApiFactory _factory;

    public AuthorizationTests(ApiFactory factory)
    {
        _factory = factory;
    }

    public static TheoryData<string, string> RideRoutes() => new()
    {
        { "GET", "/Rides" },
        { "GET", "/Rides/8a1b0f2e-0000-4000-8000-000000000000" },
        { "POST", "/Rides" },
        { "PUT", "/Rides/8a1b0f2e-0000-4000-8000-000000000000" },
        { "DELETE", "/Rides/8a1b0f2e-0000-4000-8000-000000000000" }
    };

    [Theory]
    [MemberData(nameof(RideRoutes))]
    public async Task RideEndpoints_WithoutToken_RespondUnauthorized(string method, string route)
    {
        var request = new HttpRequestMessage(new HttpMethod(method), route);

        HttpResponseMessage response = await _factory.CreateClient().SendAsync(request);

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task RideEndpoints_WithAValidToken_ReachTheController()
    {
        HttpClient client = _factory.CreateClient();
        client.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue("Bearer", ApiFactory.IssueToken());

        HttpResponseMessage response = await client.GetAsync("/Rides");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    [Theory]
    [InlineData("/auth/login")]
    [InlineData("/usuario/cadastro")]
    public async Task AnonymousEndpoints_WithoutToken_ReachTheController(string route)
    {
        HttpResponseMessage response = await _factory.CreateClient().PostAsJsonAsync(route, new { });

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task Swagger_WithoutToken_RespondsOk()
    {
        HttpResponseMessage response = await _factory.CreateClient().GetAsync("/swagger/v1/swagger.json");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }
}
