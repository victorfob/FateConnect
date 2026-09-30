namespace FateConnect.Api.Modules.Users.Infrastructure;

using FateConnect.Api.Modules.Users.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

public class AdministrativeActionConfiguration : IEntityTypeConfiguration<AdministrativeAction>
{
    public void Configure(EntityTypeBuilder<AdministrativeAction> builder)
    {
        builder.HasKey(a => a.Id);
        builder.Property(a => a.ActorId).IsRequired();
        builder.Property(a => a.TargetId).IsRequired();
        builder.Property(a => a.Action).IsRequired();
        builder.Property(a => a.PerformedAt).IsRequired();

        builder.HasIndex(a => a.TargetId);
    }
}
