namespace FateConnect.Api.Modules.Users.Infrastructure;

using FateConnect.Api.Modules.Users.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

public class AddressConfiguration : IEntityTypeConfiguration<Address>
{
    public void Configure(EntityTypeBuilder<Address> builder)
    {
        builder.HasKey(e => e.Id);
        builder.Property(e => e.ZipCode).IsRequired().HasMaxLength(9);
        builder.Property(e => e.Street).IsRequired().HasMaxLength(200);
        builder.Property(e => e.StreetNumber).IsRequired().HasMaxLength(20);
        builder.Property(e => e.Complement).HasMaxLength(100);
        builder.Property(e => e.City).IsRequired().HasMaxLength(100);
        builder.Property(e => e.State).IsRequired().HasMaxLength(2);

        builder.HasOne(e => e.User)
               .WithMany(u => u.Addresses)
               .HasForeignKey(e => e.UserId)
               .OnDelete(DeleteBehavior.Cascade);
    }
}
