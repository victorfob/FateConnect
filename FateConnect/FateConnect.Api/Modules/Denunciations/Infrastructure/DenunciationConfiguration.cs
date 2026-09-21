namespace FateConnect.Api.Modules.Denunciations.Infrastructure;

using FateConnect.Api.Modules.Denunciations.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

public class DenunciationConfiguration : IEntityTypeConfiguration<Denunciation>
{
    public void Configure(EntityTypeBuilder<Denunciation> builder)
    {
        builder.HasKey(d => d.Id);

        builder.Property(d => d.Category)
               .IsRequired();

        builder.Property(d => d.Description)
               .HasMaxLength(500)
               .IsRequired();

        builder.Property(d => d.ImageUrl)
               .HasMaxLength(500);

        builder.Property(d => d.IsAnonymous)
               .IsRequired();

        builder.Property(d => d.Status)
               .IsRequired();

        builder.Property(d => d.CreatedAt)
               .IsRequired();

        builder.Property(d => d.UserId)
               .IsRequired();

        builder.HasOne(d => d.User)
               .WithMany()
               .HasForeignKey(d => d.UserId)
               .OnDelete(DeleteBehavior.Restrict);
    }
}
