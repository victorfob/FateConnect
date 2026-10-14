namespace FateConnect.Api.Modules.InAppNotifications.Infrastructure;

using FateConnect.Api.Modules.InAppNotifications.Entities;
using FateConnect.Api.Modules.Users.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

public class PushSubscriptionConfiguration : IEntityTypeConfiguration<PushSubscription>
{
    public const int EndpointMaxLength = 2048;
    public const int KeyMaxLength = 256;

    public void Configure(EntityTypeBuilder<PushSubscription> builder)
    {
        builder.HasKey(e => e.Id);

        builder.Property(e => e.Endpoint)
            .HasMaxLength(EndpointMaxLength)
            .IsRequired();

        builder.Property(e => e.P256dh)
            .HasMaxLength(KeyMaxLength)
            .IsRequired();

        builder.Property(e => e.Auth)
            .HasMaxLength(KeyMaxLength)
            .IsRequired();

        builder.Property(e => e.CreatedAt)
            .IsRequired();

        builder.HasIndex(e => e.Endpoint)
            .IsUnique();

        builder.HasIndex(e => e.UserId);

        builder.HasOne<User>()
               .WithMany()
               .HasForeignKey(e => e.UserId)
               .OnDelete(DeleteBehavior.Cascade);
    }
}
