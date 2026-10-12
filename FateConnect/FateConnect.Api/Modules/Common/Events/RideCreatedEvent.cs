namespace FateConnect.Api.Modules.Common.Events;

public record RideCreatedEvent(
    Guid RideId,
    int DriverId,
    string DestinationNeighborhood);
