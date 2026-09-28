namespace FateConnect.Api.Modules.Rides.Infrastructure;

using FateConnect.Api.Modules.Rides.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

public class RideDepartureConfiguration : IEntityTypeConfiguration<RideDeparture>
{
    public void Configure(EntityTypeBuilder<RideDeparture> builder)
    {
        builder.HasKey(departure => new { departure.RideId, departure.Date });
    }
}
