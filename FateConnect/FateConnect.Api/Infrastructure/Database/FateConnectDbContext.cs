namespace FateConnect.Api.Infrastructure.Database;

using FateConnect.Api.Infrastructure.Database.Converters;
using FateConnect.Api.Modules.LostAndFound.Entities;
using FateConnect.Api.Modules.Rides.Entities;
using FateConnect.Api.Modules.Users.Entities;
using Microsoft.EntityFrameworkCore;

public class FateConnectDbContext(DbContextOptions<FateConnectDbContext> options) : DbContext(options)
{
    public DbSet<User> Users => Set<User>();
    public DbSet<Contact> Contacts => Set<Contact>();
    public DbSet<Ride> Rides => Set<Ride>();
    public DbSet<LostAndFoundRecord> LostAndFoundRecords => Set<LostAndFoundRecord>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.HasPostgresExtension("unaccent");

        modelBuilder.ApplyConfigurationsFromAssembly(typeof(FateConnectDbContext).Assembly);
    }

    protected override void ConfigureConventions(ModelConfigurationBuilder configurationBuilder)
    {
        configurationBuilder.Properties<DateTime>().HaveConversion<UtcDateTimeConverter>();
        configurationBuilder.Properties<DateTime?>().HaveConversion<NullableUtcDateTimeConverter>();
    }
}
