namespace FateConnect.Api.Modules.Users.Infrastructure;

using FateConnect.Api.Modules.Users.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

public class UserPreferencesConfiguration : IEntityTypeConfiguration<UserPreferences>
{
    public void Configure(EntityTypeBuilder<UserPreferences> builder)
    {
        builder.HasKey(p => p.UserId);

        builder.HasOne<User>()
               .WithOne(u => u.Preferences)
               .HasForeignKey<UserPreferences>(p => p.UserId)
               .OnDelete(DeleteBehavior.Cascade);
    }
}
