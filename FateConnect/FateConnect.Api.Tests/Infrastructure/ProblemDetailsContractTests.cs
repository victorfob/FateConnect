using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using FateConnect.Api.Tests.Fixtures;

namespace FateConnect.Api.Tests.Infrastructure;

public class ProblemDetailsContractTests(ApiFactory factory) : IClassFixture<ApiFactory>
{
    private const string ProblemMediaType = "application/problem+json";

    private static async Task<JsonElement> ProblemOf(HttpResponseMessage response, HttpStatusCode expected)
    {
        Assert.Equal(expected, response.StatusCode);
        Assert.Equal(ProblemMediaType, response.Content.Headers.ContentType?.MediaType);

        JsonElement body = JsonDocument.Parse(await response.Content.ReadAsStringAsync()).RootElement;
        Assert.Equal((int)expected, body.GetProperty("status").GetInt32());
        Assert.False(string.IsNullOrWhiteSpace(body.GetProperty("title").GetString()));
        Assert.False(string.IsNullOrWhiteSpace(body.GetProperty("type").GetString()));

        return body;
    }

    [Fact]
    public async Task AnApplicationError_AnswersAProblemWithTheMessageInDetail()
    {
        HttpClient client = factory.CreateClientForNewUser("Renata Moura Prado");

        HttpResponseMessage response = await client.PatchAsync("/InAppNotifications/999999/read", null);

        JsonElement body = await ProblemOf(response, HttpStatusCode.NotFound);
        Assert.Equal(
            "The notification was not found or does not belong to you.",
            body.GetProperty("detail").GetString());
    }

    [Fact]
    public async Task AValidationRefusal_AnswersAProblemWithTheFieldsInErrors()
    {
        HttpResponseMessage response = await factory.CreateClient().PostAsJsonAsync("/Auth/login", new { });

        JsonElement body = await ProblemOf(response, HttpStatusCode.BadRequest);
        Assert.True(body.GetProperty("errors").TryGetProperty("FatecEmail", out _));
        Assert.False(body.TryGetProperty("field", out _));
    }

    [Fact]
    public async Task ARequestWithoutAToken_AnswersAProblem()
    {
        HttpResponseMessage response = await factory.CreateClient().GetAsync("/Rides");

        await ProblemOf(response, HttpStatusCode.Unauthorized);
    }

    [Fact]
    public async Task AProfileWithoutPermission_AnswersAProblem()
    {
        HttpClient client = factory.CreateClientForNewUser("Diego Ramos Teixeira");

        HttpResponseMessage response = await client.GetAsync("/Users");

        await ProblemOf(response, HttpStatusCode.Forbidden);
    }

    [Fact]
    public async Task ARouteThatDoesNotExist_AnswersAProblem()
    {
        HttpClient client = factory.CreateClientForNewUser("Luana Freitas Campos");

        HttpResponseMessage response = await client.GetAsync("/NoSuchRoute");

        await ProblemOf(response, HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task ARefusalToAClientThatDoesNotAskForJson_StillAnswersAProblem()
    {
        HttpClient client = factory.CreateClientForNewUser("Sofia Nunes Tavares");
        client.DefaultRequestHeaders.Accept.ParseAdd("text/html");

        HttpResponseMessage response = await client.GetAsync("/NoSuchRoute");

        await ProblemOf(response, HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task ASuccessfulResponse_IsNotAProblem()
    {
        HttpClient client = factory.CreateClientForNewUser("Paulo Henrique Basso");

        HttpResponseMessage response = await client.GetAsync("/Rides");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal("application/json", response.Content.Headers.ContentType?.MediaType);
    }
}
