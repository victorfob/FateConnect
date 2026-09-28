namespace FateConnect.Api.Modules.Rides.Entities;

public class RideDeparture
{
    public Guid RideId { get; private set; }
    public DateOnly Date { get; private set; }

    private RideDeparture() { }

    public RideDeparture(Guid rideId, DateOnly date)
    {
        RideId = rideId;
        Date = date;
    }
}
