namespace FateConnect.Api.Modules.InAppNotifications.Infrastructure;

using FateConnect.Api.Modules.InAppNotifications.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

public class InAppNotificationConfiguration : IEntityTypeConfiguration<InAppNotification>
{
    public void Configure(EntityTypeBuilder<InAppNotification> builder)
    {

        builder.HasKey(e => e.Id);

        builder.Property(e => e.UserId)
            .IsRequired();

        builder.Property(e => e.Type)
            .IsRequired();

        builder.Property(e => e.Content)
            .HasMaxLength(500)
            .IsRequired();

        builder.Property(e => e.ReferenceId);

        builder.Property(e => e.IsRead)
            .IsRequired();

        builder.Property(e => e.CreatedAt)
            .IsRequired();

        builder.Property(e => e.UpdatedAt);

        builder.HasIndex(e => new { e.UserId, e.IsRead });

        builder.HasOne(e => e.User)
               .WithMany()
               .HasForeignKey(e => e.UserId)
               .OnDelete(DeleteBehavior.Cascade);
    }
}
