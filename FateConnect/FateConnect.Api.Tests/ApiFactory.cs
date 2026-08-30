using System.Net.Http.Headers;
using FateConnect.Api.Infrastructure.Database;
using FateConnect.Api.Modules.Auth.Entities;
using FateConnect.Api.Modules.Auth.Services;
using FateConnect.Api.Modules.Users.Entities;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;

namespace FateConnect.Api.Tests;

public class ApiFactory : WebApplicationFactory<Program>
{
    public const string FakeSecret = "fake-test-secret-with-no-value-outside-this-suite";

    private readonly string _databaseName = $"fateconnect-tests-{Guid.NewGuid()}";

    public ApiFactory()
    {
        Environment.SetEnvironmentVariable("JWT_SECRET", FakeSecret);
        Environment.SetEnvironmentVariable("JWT_ISSUER", "FateConnectTest");
        Environment.SetEnvironmentVariable("JWT_AUDIENCE", "FateConnectTestWeb");
    }

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.ConfigureServices(services =>
        {
            ServiceDescriptor registration = services.Single(
                service => service.ServiceType == typeof(DbContextOptions<FateConnectDbContext>));

            services.Remove(registration);
            services.AddDbContext<FateConnectDbContext>(options => options.UseInMemoryDatabase(_databaseName));
        });
    }

    public static string IssueToken(int userId = 1)
    {
        JwtOptions options = new()
        {
            Secret = FakeSecret,
            Issuer = "FateConnectTest",
            Audience = "FateConnectTestWeb",
        };

        return new TokenService(Options.Create(options))
            .GerarJwtToken(new User { Id = userId, FatecEmail = "pessoa@fatec.sp.gov.br" });
    }

    public int SeedUser(string fullName, string phone, string contactEmail)
    {
        using IServiceScope scope = Services.CreateScope();
        FateConnectDbContext context = scope.ServiceProvider.GetRequiredService<FateConnectDbContext>();

        User user = new()
        {
            FullName = fullName,
            FatecEmail = $"{Guid.NewGuid():N}@fatec.sp.gov.br",
            Password = "hash-sem-valor-fora-desta-suite",
            BirthDate = new DateTime(2000, 1, 1, 0, 0, 0, DateTimeKind.Utc),
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
            Contacts = [new Contact { Phone = phone, ContactEmail = contactEmail }],
        };

        context.Users.Add(user);
        context.SaveChanges();

        return user.Id;
    }

    public HttpClient CreateClientFor(int userId)
    {
        HttpClient client = CreateClient();
        client.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue("Bearer", IssueToken(userId));

        return client;
    }
}
