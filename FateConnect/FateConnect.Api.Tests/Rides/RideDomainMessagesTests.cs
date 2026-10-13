using FateConnect.Api.Modules.Common.Exceptions;
using FateConnect.Api.Modules.Rides.Entities;
using FateConnect.Api.Modules.Rides.Enums;
using FateConnect.Api.Modules.Rides.Exceptions;

namespace FateConnect.Api.Tests.Rides;

public class RideDomainMessagesTests
{
    private static readonly DateOnly FutureDate = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(7));
    private static readonly TimeOnly DepartureTime = new(8, 30);

    private static Ride CreateRide(
        string destination = "Fatec Sorocaba",
        DateOnly? departureDate = null,
        EnumRideType rideType = EnumRideType.Solidarity,
        EnumVehicleType vehicleType = EnumVehicleType.Car,
        int driverId = 1) =>
        new(
            destination,
            new RideFirstDeparture(departureDate ?? FutureDate, DepartureTime),
            rideType,
            vehicleType,
            driverId,
            DateTime.UtcNow);

    [Fact]
    public void ARideInThePast_AnswersTheScheduleMessage()
    {
        DateOnly pastDate = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(-1));

        InvalidDepartureScheduleException exception = Assert.Throws<InvalidDepartureScheduleException>(
            () => CreateRide(departureDate: pastDate));

        Assert.Equal("The ride must depart at a future date and time.", exception.Message);
    }

    [Fact]
    public void ARideWithAShortDestination_AnswersTheDestinationMessage()
    {
        InvalidDestinationException exception = Assert.Throws<InvalidDestinationException>(
            () => CreateRide(destination: "AB"));

        Assert.Equal("The destination must have between 3 and 100 characters.", exception.Message);
    }

    [Fact]
    public void ARideWithAnUndefinedType_AnswersTheTypeMessage()
    {
        InvalidRideTypeException exception = Assert.Throws<InvalidRideTypeException>(
            () => CreateRide(rideType: (EnumRideType)99));

        Assert.Equal("Invalid ride type.", exception.Message);
    }

    [Fact]
    public void ARideWithAnUndefinedVehicle_AnswersTheVehicleMessage()
    {
        InvalidVehicleTypeException exception = Assert.Throws<InvalidVehicleTypeException>(
            () => CreateRide(vehicleType: (EnumVehicleType)99));

        Assert.Equal("Invalid vehicle.", exception.Message);
    }

    [Fact]
    public void ARideEditedToAnUndefinedVehicle_IsRefusedAndKeepsItsVehicle()
    {
        Ride ride = CreateRide(vehicleType: EnumVehicleType.Motorcycle);

        Assert.Throws<InvalidVehicleTypeException>(
            () => ride.UpdateBasicAttributes(null, null, (EnumVehicleType)99, null, DateTime.UtcNow));

        Assert.Equal(EnumVehicleType.Motorcycle, ride.VehicleType);
    }

    [Fact]
    public void ARideWithoutADriver_AnswersTheUserIdentifierMessage()
    {
        InvalidUserIdentifierException exception = Assert.Throws<InvalidUserIdentifierException>(
            () => CreateRide(driverId: 0));

        Assert.Equal(
            "The request could not be processed. The user identifier is invalid or does not exist.",
            exception.Message);
    }

    [Fact]
    public void ARideOfferedByAnotherPerson_AnswersTheOwnershipMessage()
    {
        RideNotDrivenByUserException exception = new();

        Assert.Equal(
            "This ride was offered by someone else. Only who offered it can change it.",
            exception.Message);
    }
}
