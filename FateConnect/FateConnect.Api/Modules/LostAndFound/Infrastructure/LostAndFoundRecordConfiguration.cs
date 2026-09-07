namespace FateConnect.Api.Modules.LostAndFound.Infrastructure;

using FateConnect.Api.Modules.LostAndFound.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

public class LostAndFoundRecordConfiguration : IEntityTypeConfiguration<LostAndFoundRecord>
{
    public void Configure(EntityTypeBuilder<LostAndFoundRecord> builder)
    {
        builder.HasKey(r => r.Id);

        builder.Property(r => r.Name)
               .HasMaxLength(100)
               .IsRequired();

        builder.Property(r => r.LostAndFoundType)
               .IsRequired();

        builder.Property(r => r.Place)
               .HasMaxLength(100)
               .IsRequired();

        builder.Property(r => r.OcurredOn)
               .IsRequired();

        builder.Property(r => r.Description)
               .HasMaxLength(300)
               .IsRequired();

        builder.Property(r => r.ImageUrl)
               .HasMaxLength(500);

        builder.Property(r => r.Status)
               .IsRequired();

        builder.Property(r => r.IsActive)
               .IsRequired();

        builder.Property(r => r.CreatedAt)
               .IsRequired();

        builder.Property(r => r.UserId)
               .IsRequired();

        builder.HasOne(r => r.User)
               .WithMany()
               .HasForeignKey(r => r.UserId)
               .OnDelete(DeleteBehavior.Restrict);
    }
}
