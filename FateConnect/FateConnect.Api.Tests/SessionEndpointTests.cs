using System.Net;
using System.Net.Http.Headers;

namespace FateConnect.Api.Tests;

public class SessionEndpointTests(ApiFactory factory) : IClassFixture<ApiFactory>
{
    [Fact]
    public async Task Session_WithAValidToken_AnswersNoContent()
    {
        HttpClient client = factory.CreateClientForNewUser("Bruno Carvalho Souza");

        HttpResponseMessage response = await client.GetAsync("/Auth/session");

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
    }

    [Fact]
    public async Task Session_WithoutAToken_IsRejected()
    {
        HttpResponseMessage response = await factory.CreateClient().GetAsync("/Auth/session");

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task Session_WithATokenItCannotRead_IsRejected()
    {
        HttpClient client = factory.CreateClient();
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", "abc.def.ghi");

        HttpResponseMessage response = await client.GetAsync("/Auth/session");

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }
}
