using System.Net;
using FateConnect.Api.Tests.Fixtures;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.AspNetCore.TestHost;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Diagnostics.HealthChecks;
using Microsoft.Extensions.Options;

namespace FateConnect.Api.Tests.Infrastructure;

public class HealthCheckTests
{
    [Fact]
    public async Task Health_WithTheDatabaseUp_AnswersHealthyWithoutAToken()
    {
        using ApiFactory factory = new();

        HttpResponseMessage response = await factory.CreateClient().GetAsync("/health");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal("Healthy", await response.Content.ReadAsStringAsync());
    }

    [Fact]
    public async Task Health_WithTheDatabaseGone_AnswersUnhealthyWithNothingElse()
    {
        using ApiFactory factory = new();
        HttpClient client = factory.CreateClient();
        Assert.Equal(HttpStatusCode.OK, (await client.GetAsync("/health")).StatusCode);

        factory.DropDatabase();
        HttpResponseMessage response = await client.GetAsync("/health");

        Assert.Equal(HttpStatusCode.ServiceUnavailable, response.StatusCode);
        Assert.Equal("Unhealthy", await response.Content.ReadAsStringAsync());
    }

    [Fact]
    public async Task Health_WithACheckDegraded_AnswersServiceUnavailable()
    {
        using ApiFactory factory = new();
        using WebApplicationFactory<Program> degraded = factory.WithWebHostBuilder(builder =>
            builder.ConfigureServices(services =>
                services.AddHealthChecks().AddCheck("fila-reconectando", () => HealthCheckResult.Degraded())));

        HttpResponseMessage response = await degraded.CreateClient().GetAsync("/health");

        Assert.Equal(HttpStatusCode.ServiceUnavailable, response.StatusCode);
        Assert.Equal("Degraded", await response.Content.ReadAsStringAsync());
    }

    [Fact]
    public void Health_ChecksTheDatabaseAndTheMessageBus()
    {
        using ApiFactory factory = new();

        IEnumerable<string> checks = factory.Services
            .GetRequiredService<IOptions<HealthCheckServiceOptions>>().Value.Registrations
            .Select(registration => registration.Name);

        Assert.Equal(["FateConnectDbContext", "masstransit-bus"], checks.Order());
    }
}
