namespace FateConnect.Api.Modules.Rides.Infrastructure;

using FateConnect.Api.Modules.Rides.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

public class RideConfiguration : IEntityTypeConfiguration<Ride>
{
    public void Configure(EntityTypeBuilder<Ride> builder)
    {
        builder.ToTable("rides");

        builder.HasKey(r => r.Id);

        builder.Property(r => r.AvailableSeats)
              .IsRequired();

        builder.Property(r => r.Destination)
              .HasMaxLength(100)
              .IsRequired();

        builder.Property(r => r.DepartureDate)
              .IsRequired();

        builder.Property(r => r.DepartureTime)
              .IsRequired();

        builder.Property(r => r.CreatedAt)
              .IsRequired();

        builder.Property(r => r.RideType)
              .IsRequired();

        builder.Property(r => r.Description)
              .HasMaxLength(300);

        builder.Property(r => r.IsActive)
              .IsRequired();

        builder.Property(r => r.DriverId)
              .IsRequired();

        builder.HasOne(r => r.Driver)
              .WithMany()
              .HasForeignKey(r => r.DriverId)
              .OnDelete(DeleteBehavior.Restrict);
    }
}
