namespace FateConnect.Api.Modules.Users.Infrastructure;

using FateConnect.Api.Modules.Users.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

public class UserTokenConfiguration : IEntityTypeConfiguration<UserToken>
{
    public void Configure(EntityTypeBuilder<UserToken> builder)
    {
        builder.HasKey(e => e.Id);
        builder.Property(e => e.Token).IsRequired().HasMaxLength(100);
        builder.Property(e => e.Type).IsRequired();
        builder.Property(e => e.CreatedAt).IsRequired();
        builder.Property(e => e.ExpiresAt).IsRequired();
        builder.Property(e => e.ConsumedAt);

        builder.HasOne(e => e.User)
            .WithMany(u => u.Tokens)
            .HasForeignKey(e => e.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(t => t.Token)
            .IsUnique();
    }
}
