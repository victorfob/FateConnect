namespace FateConnect.Api.Modules.Users.Infrastructure;

using FateConnect.Api.Modules.Users.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

public class ContactConfiguration : IEntityTypeConfiguration<Contact>
{
    public void Configure(EntityTypeBuilder<Contact> builder)
    {
        builder.HasKey(c => c.Id);
        builder.Property(c => c.Phone).IsRequired().HasMaxLength(11);
        builder.Property(c => c.ContactEmail).IsRequired().HasMaxLength(150);

        builder.HasIndex(c => c.Phone).IsUnique();
        builder.HasIndex(c => c.ContactEmail).IsUnique();

        builder.HasOne(c => c.User)
               .WithMany(u => u.Contacts)
               .HasForeignKey(c => c.UserId)
               .OnDelete(DeleteBehavior.Cascade);
    }
}
