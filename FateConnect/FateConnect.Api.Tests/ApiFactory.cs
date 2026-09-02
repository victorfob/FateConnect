using System.Net.Http.Headers;
using FateConnect.Api.Infrastructure.Database;
using FateConnect.Api.Modules.Auth.Entities;
using FateConnect.Api.Modules.Auth.Services;
using FateConnect.Api.Modules.Rides.Entities;
using FateConnect.Api.Modules.Rides.Enums;
using FateConnect.Api.Modules.Users.Entities;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;
using static BCrypt.Net.BCrypt;

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
            services.AddDbContext<FateConnectDbContext>(
                options => options.UseNpgsql(TestDatabase.ConnectionStringFor(_databaseName)));
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
            .GenerateJwtToken(new User { Id = userId, FatecEmail = "mariana.rocha@aluno.cps.sp.gov.br" });
    }

    public static string UniquePhone() => $"15{Random.Shared.Next(100_000_000, 999_999_999)}";

    public static string UniqueContactEmail() => $"contato{Guid.NewGuid():N}@gmail.com";

    public SeededUser SeedUser(string fullName)
    {
        using IServiceScope scope = Services.CreateScope();
        FateConnectDbContext context = scope.ServiceProvider.GetRequiredService<FateConnectDbContext>();

        string phone = UniquePhone();
        string contactEmail = UniqueContactEmail();

        User user = new()
        {
            FullName = fullName,
            FatecEmail = $"{Guid.NewGuid():N}@aluno.cps.sp.gov.br",
            Password = "hash-sem-valor-fora-desta-suite",
            BirthDate = new DateTime(2000, 1, 1, 0, 0, 0, DateTimeKind.Utc),
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
            Contacts = [new Contact { Phone = phone, ContactEmail = contactEmail }],
        };

        context.Users.Add(user);
        context.SaveChanges();

        return new SeededUser(user.Id, phone, contactEmail);
    }

    public (int Id, string FatecEmail) SeedUserWithPassword(string fullName, string password)
    {
        using IServiceScope scope = Services.CreateScope();
        FateConnectDbContext context = scope.ServiceProvider.GetRequiredService<FateConnectDbContext>();

        User user = new()
        {
            FullName = fullName,
            FatecEmail = $"{Guid.NewGuid():N}@aluno.cps.sp.gov.br",
            Password = HashPassword(password),
            BirthDate = new DateTime(2000, 1, 1, 0, 0, 0, DateTimeKind.Utc),
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
        };

        context.Users.Add(user);
        context.SaveChanges();

        return (user.Id, user.FatecEmail);
    }

    public Guid SeedRide(int driverId, DateOnly departureDate, TimeOnly departureTime, string destination = "Sorocaba centro")
    {
        using IServiceScope scope = Services.CreateScope();
        FateConnectDbContext context = scope.ServiceProvider.GetRequiredService<FateConnectDbContext>();

        DateOnly acceptedDate = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(30));
        Ride ride = new(3, destination, acceptedDate, departureTime, EnumRideType.Solidarity, driverId);

        context.Rides.Add(ride);
        context.Entry(ride).Property(entity => entity.DepartureDate).CurrentValue = departureDate;
        context.Entry(ride).Property(entity => entity.DepartureTime).CurrentValue = departureTime;
        context.SaveChanges();

        return ride.Id;
    }

    public HttpClient CreateClientFor(int userId)
    {
        HttpClient client = CreateClient();
        client.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue("Bearer", IssueToken(userId));

        return client;
    }
}
