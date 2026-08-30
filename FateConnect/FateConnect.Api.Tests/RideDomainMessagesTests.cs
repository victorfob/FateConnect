using FateConnect.Api.Modules.Rides.Entities;
using FateConnect.Api.Modules.Rides.Enums;
using FateConnect.Api.Modules.Rides.Exceptions;

namespace FateConnect.Api.Tests;

public class RideDomainMessagesTests
{
    private static readonly DateOnly FutureDate = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(7));
    private static readonly TimeOnly DepartureTime = new(8, 30);

    private static Ride CreateRide(
        int availableSeats = 3,
        string destination = "Fatec Sorocaba",
        DateOnly? departureDate = null,
        EnumRideType rideType = EnumRideType.Solidarity,
        int driverId = 1) =>
        new(availableSeats, destination, departureDate ?? FutureDate, DepartureTime, rideType, driverId);

    [Fact]
    public void ARideInThePast_AnswersTheScheduleMessageInPortuguese()
    {
        DateOnly pastDate = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(-1));

        InvalidDepartureScheduleException exception = Assert.Throws<InvalidDepartureScheduleException>(
            () => CreateRide(departureDate: pastDate));

        Assert.Equal("A carona deve ser em data e hora futuras.", exception.Message);
    }

    [Theory]
    [InlineData(0)]
    [InlineData(8)]
    public void ARideWithSeatsOutOfRange_NamesTheReceivedAmountInPortuguese(int seats)
    {
        InvalidAvailableSeatsException exception = Assert.Throws<InvalidAvailableSeatsException>(
            () => CreateRide(availableSeats: seats));

        Assert.Equal($"A carona deve ter entre 1 e 7 vagas. Recebido: {seats}.", exception.Message);
    }

    [Fact]
    public void ARideWithAShortDestination_AnswersTheDestinationMessageInPortuguese()
    {
        InvalidDestinationException exception = Assert.Throws<InvalidDestinationException>(
            () => CreateRide(destination: "AB"));

        Assert.Equal("O destino deve ter entre 3 e 100 caracteres.", exception.Message);
    }

    [Fact]
    public void ARideWithAnUndefinedType_AnswersTheTypeMessageInPortuguese()
    {
        InvalidRideTypeException exception = Assert.Throws<InvalidRideTypeException>(
            () => CreateRide(rideType: (EnumRideType)99));

        Assert.Equal("Tipo de carona inválido.", exception.Message);
    }

    [Fact]
    public void ARideWithoutADriver_AnswersTheDriverMessageInPortuguese()
    {
        InvalidRideDriverException exception = Assert.Throws<InvalidRideDriverException>(
            () => CreateRide(driverId: 0));

        Assert.Equal(
            "Não foi possível identificar quem está ofertando a carona. Entre novamente.",
            exception.Message);
    }

    [Fact]
    public void ARideOfferedByAnotherPerson_AnswersTheOwnershipMessageInPortuguese()
    {
        RideNotDrivenByUserException exception = new();

        Assert.Equal(
            "Esta carona foi ofertada por outra pessoa. Só quem ofertou pode alterá-la.",
            exception.Message);
    }
}
