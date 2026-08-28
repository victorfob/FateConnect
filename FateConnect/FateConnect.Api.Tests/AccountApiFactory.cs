using FateConnect.Api.Infrastructure.Database;
using FateConnect.Api.Modules.Auth.Entities;
using FateConnect.Api.Modules.Auth.Services;
using FateConnect.Api.Modules.Usuarios;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;

namespace FateConnect.Api.Tests;

public class AccountApiFactory : WebApplicationFactory<Program>
{
    public const string FakeSecret = "fake-test-secret-with-no-value-outside-this-suite";

    public AccountApiFactory()
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
            services.AddDbContext<FateConnectDbContext>(options => options.UseInMemoryDatabase("accounts"));
        });
    }

    public static string IssueToken()
    {
        JwtOptions options = new()
        {
            Secret = FakeSecret,
            Issuer = "FateConnectTest",
            Audience = "FateConnectTestWeb",
        };

        return new TokenService(Options.Create(options))
            .GerarJwtToken(new Usuario { Id = 1, EmailFatec = "pessoa@fatec.sp.gov.br" });
    }
}
