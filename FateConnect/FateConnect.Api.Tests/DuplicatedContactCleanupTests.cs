using FateConnect.Api.Infrastructure.Database;
using FateConnect.Api.Infrastructure.Database.Migrations;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

namespace FateConnect.Api.Tests;

public class DuplicatedContactCleanupTests : IClassFixture<ApiFactory>
{
    private readonly ApiFactory _factory;

    public DuplicatedContactCleanupTests(ApiFactory factory) => _factory = factory;

    [Fact]
    public void TheCleanup_RemovesTheNewerUserWhoRepeatsAPhone_WithTheirRides()
    {
        SeededUser older = _factory.SeedUser("Ana Beatriz Nogueira");
        SeededUser newer = _factory.SeedUser("Bruno Carvalho Souza");

        Guid rideOfNewer = _factory.SeedRide(
            newer.Id,
            DateOnly.FromDateTime(DateTime.UtcNow.AddDays(7)),
            new TimeOnly(8, 30));

        Execute("DROP INDEX \"IX_Contacts_Phone\"");
        ExecuteWithPhone("UPDATE \"Contacts\" SET \"Phone\" = {0} WHERE \"UserId\" = {1}", older.Phone, newer.Id);

        Execute(DuplicatedContactCleanup.Sql);

        Execute("CREATE UNIQUE INDEX \"IX_Contacts_Phone\" ON \"Contacts\" (\"Phone\")");

        Assert.True(UserExists(older.Id));
        Assert.False(UserExists(newer.Id));
        Assert.False(RideExists(rideOfNewer));
    }

    private void Execute(string sql)
    {
        using IServiceScope scope = _factory.Services.CreateScope();
        scope.ServiceProvider.GetRequiredService<FateConnectDbContext>().Database.ExecuteSqlRaw(sql);
    }

    private void ExecuteWithPhone(string sql, string phone, int userId)
    {
        using IServiceScope scope = _factory.Services.CreateScope();
        scope.ServiceProvider.GetRequiredService<FateConnectDbContext>()
            .Database.ExecuteSqlRaw(sql, phone, userId);
    }

    private bool UserExists(int userId)
    {
        using IServiceScope scope = _factory.Services.CreateScope();

        return scope.ServiceProvider.GetRequiredService<FateConnectDbContext>()
            .Users.AsNoTracking().Any(user => user.Id == userId);
    }

    private bool RideExists(Guid rideId)
    {
        using IServiceScope scope = _factory.Services.CreateScope();

        return scope.ServiceProvider.GetRequiredService<FateConnectDbContext>()
            .Rides.AsNoTracking().Any(ride => ride.Id == rideId);
    }
}
