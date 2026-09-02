namespace FateConnect.Api.Infrastructure.Database;

using FateConnect.Api.Modules.Rides.Entities;
using FateConnect.Api.Modules.Users.Entities;
using Microsoft.EntityFrameworkCore;

public class FateConnectDbContext(DbContextOptions<FateConnectDbContext> options) : DbContext(options)
{
    public DbSet<User> Users => Set<User>();
    public DbSet<Address> Addresses => Set<Address>();
    public DbSet<Contact> Contacts => Set<Contact>();
    public DbSet<Ride> Rides => Set<Ride>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.HasPostgresExtension("unaccent");

        modelBuilder.ApplyConfigurationsFromAssembly(typeof(FateConnectDbContext).Assembly);

        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.FatecEmail).IsRequired().HasMaxLength(150);
            entity.Property(e => e.FullName).IsRequired().HasMaxLength(200);
            entity.Property(e => e.Password).IsRequired().HasMaxLength(255);
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");
            entity.Property(e => e.UpdatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");
        });

        modelBuilder.Entity<Address>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.ZipCode).IsRequired().HasMaxLength(9);
            entity.Property(e => e.Street).IsRequired().HasMaxLength(200);
            entity.Property(e => e.StreetNumber).IsRequired().HasMaxLength(20);
            entity.Property(e => e.Complement).HasMaxLength(100);
            entity.Property(e => e.City).IsRequired().HasMaxLength(100);
            entity.Property(e => e.State).IsRequired().HasMaxLength(2);

            entity.HasOne(e => e.User)
                  .WithMany(u => u.Addresses)
                  .HasForeignKey(e => e.UserId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<Contact>(entity =>
        {
            entity.HasKey(c => c.Id);
            entity.Property(c => c.Phone).IsRequired().HasMaxLength(11);
            entity.Property(c => c.ContactEmail).IsRequired().HasMaxLength(150);

            entity.HasOne(c => c.User)
                  .WithMany(u => u.Contacts)
                  .HasForeignKey(c => c.UserId)
                  .OnDelete(DeleteBehavior.Cascade);
        });
    }
}
