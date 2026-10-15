namespace FateConnect.Api.Modules.Reports.Infrastructure;

using FateConnect.Api.Infrastructure.Database;
using FateConnect.Api.Modules.Reports.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

public class ReportConfiguration : IEntityTypeConfiguration<Report>
{
    public void Configure(EntityTypeBuilder<Report> builder)
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

        builder.HasWordSearch(nameof(Report.Description));
    }
}
