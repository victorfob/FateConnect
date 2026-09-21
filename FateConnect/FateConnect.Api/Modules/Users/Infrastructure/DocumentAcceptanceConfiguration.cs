namespace FateConnect.Api.Modules.Users.Infrastructure;

using FateConnect.Api.Modules.Users.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

public class DocumentAcceptanceConfiguration : IEntityTypeConfiguration<DocumentAcceptance>
{
    public void Configure(EntityTypeBuilder<DocumentAcceptance> builder)
    {
        builder.HasKey(a => a.Id);
        builder.Property(a => a.DocumentType).IsRequired();
        builder.Property(a => a.Version).IsRequired().HasMaxLength(20);
        builder.Property(a => a.AcceptedAt).IsRequired();
        builder.Property(a => a.IpAddress).IsRequired().HasMaxLength(45);
        builder.Property(a => a.UserAgent).IsRequired().HasMaxLength(512);

        builder.HasIndex(a => a.UserId);

        builder.HasOne(a => a.User)
               .WithMany(u => u.DocumentAcceptances)
               .HasForeignKey(a => a.UserId)
               .OnDelete(DeleteBehavior.Cascade);
    }
}
