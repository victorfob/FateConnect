namespace FateConnect.Api.Modules.Users.Infrastructure;

using FateConnect.Api.Modules.Users.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

public class UserConfiguration : IEntityTypeConfiguration<User>
{
    public void Configure(EntityTypeBuilder<User> builder)
    {
        builder.HasKey(e => e.Id);
        builder.Property(e => e.FatecEmail).IsRequired().HasMaxLength(150);
        builder.Property(e => e.FullName).IsRequired().HasMaxLength(200);
        builder.Property(e => e.Password).IsRequired().HasMaxLength(255);
        builder.Property(e => e.CreatedAt).IsRequired();
        builder.Property(e => e.Phone).HasMaxLength(11);
        builder.Property(e => e.ContactEmail).HasMaxLength(150);
        builder.Property(e => e.Neighborhood).HasMaxLength(100);
        builder.Property(e => e.Status).IsRequired();

        builder.HasIndex(e => e.Phone).IsUnique();
        builder.HasIndex(e => e.ContactEmail).IsUnique();
    }
}
