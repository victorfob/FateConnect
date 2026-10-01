using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using System.Text.Json.Serialization;
using FateConnect.Api.Modules.Rides.Enums;
using FateConnect.Api.Tests.Fixtures;

namespace FateConnect.Api.Tests.Rides;

public class RideUpdateTests : IClassFixture<ApiFactory>
{
    private static readonly JsonSerializerOptions JsonOptions =
        new(JsonSerializerDefaults.Web) { Converters = { new JsonStringEnumConverter() } };

    private static readonly Guid AbsentRideId = new("8a1b0f2e-0000-4000-8000-000000000000");

    private readonly ApiFactory _factory;

    public RideUpdateTests(ApiFactory factory)
    {
        _factory = factory;
    }

    private sealed record ReadRide(
        Guid Id,
        string Destination,
        DateOnly DepartureDate,
        string DepartureTime,
        EnumRideType RideType,
        EnumVehicleType VehicleType,
        string? Description);

    private static object NewRidePayload() => new
    {
        destination = "Sorocaba centro",
        departureDate = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(7)).ToString("yyyy-MM-dd"),
        departureTime = "08:30:00",
        rideType = "Solidarity",
        vehicleType = "Car",
        description = "Vaga para quem sai do campus.",
    };

    private async Task<(ReadRide Ride, HttpClient Driver)> OfferRideAsync()
    {
        HttpClient driver = _factory.CreateClientForNewUser("Ana Beatriz Nogueira");

        HttpResponseMessage response = await driver.PostAsJsonAsync("/Rides", NewRidePayload());

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);

        return ((await response.Content.ReadFromJsonAsync<ReadRide>(JsonOptions))!, driver);
    }

    [Fact]
    public async Task UpdateRide_WithEveryField_ReplacesThem()
    {
        (ReadRide ride, HttpClient driver) = await OfferRideAsync();
        DateOnly newDate = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(14));

        HttpResponseMessage response = await driver.PutAsJsonAsync($"/Rides/{ride.Id}", new
        {
            destination = "Votorantim",
            departureDate = newDate.ToString("yyyy-MM-dd"),
            departureTime = "19:45:00",
            rideType = "Egalitarian",
            vehicleType = "Motorcycle",
            description = "Passa pelo terminal.",
        });

        ReadRide updated = (await response.Content.ReadFromJsonAsync<ReadRide>(JsonOptions))!;
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal("Votorantim", updated.Destination);
        Assert.Equal(newDate, updated.DepartureDate);
        Assert.Equal("19:45:00", updated.DepartureTime);
        Assert.Equal(EnumRideType.Egalitarian, updated.RideType);
        Assert.Equal(EnumVehicleType.Motorcycle, updated.VehicleType);
        Assert.Equal("Passa pelo terminal.", updated.Description);
    }

    [Fact]
    public async Task UpdateRide_WithOnlyTheTimeAndTheVehicle_KeepsTheDateAndTheRest()
    {
        (ReadRide ride, HttpClient driver) = await OfferRideAsync();

        HttpResponseMessage response = await driver
            .PutAsJsonAsync($"/Rides/{ride.Id}", new { departureTime = "21:15:00", vehicleType = "Car" });

        ReadRide updated = (await response.Content.ReadFromJsonAsync<ReadRide>(JsonOptions))!;
        Assert.Equal("21:15:00", updated.DepartureTime);
        Assert.Equal(ride.DepartureDate, updated.DepartureDate);
        Assert.Equal(ride.Destination, updated.Destination);
        Assert.Equal(ride.Description, updated.Description);
    }

    [Fact]
    public async Task CreateRide_WithAMotorcycle_AnswersTheVehicleWhenRead()
    {
        HttpClient driver = _factory.CreateClientForNewUser("Ana Beatriz Nogueira");

        HttpResponseMessage response = await driver.PostAsJsonAsync("/Rides", new
        {
            destination = "Sorocaba centro",
            departureDate = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(7)).ToString("yyyy-MM-dd"),
            departureTime = "08:30:00",
            rideType = "Solidarity",
            vehicleType = "Motorcycle",
        });
        ReadRide created = (await response.Content.ReadFromJsonAsync<ReadRide>(JsonOptions))!;

        ReadRide read = (await driver.GetFromJsonAsync<ReadRide>($"/Rides/{created.Id}", JsonOptions))!;
        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        Assert.Equal(EnumVehicleType.Motorcycle, read.VehicleType);
    }

    [Theory]
    [InlineData(null)]
    [InlineData("Bicycle")]
    public async Task CreateRide_WithoutAKnownVehicle_IsRejected(string? vehicleType)
    {
        HttpClient driver = _factory.CreateClientForNewUser("Ana Beatriz Nogueira");

        HttpResponseMessage response = await driver.PostAsJsonAsync("/Rides", new
        {
            destination = "Sorocaba centro",
            departureDate = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(7)).ToString("yyyy-MM-dd"),
            departureTime = "08:30:00",
            rideType = "Solidarity",
            vehicleType,
        });

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task UpdateRide_WithoutTheVehicle_IsRejectedAndKeepsTheRide()
    {
        (ReadRide ride, HttpClient driver) = await OfferRideAsync();

        HttpResponseMessage response = await driver
            .PutAsJsonAsync($"/Rides/{ride.Id}", new { description = "Passa pelo terminal." });

        ReadRide read = (await driver.GetFromJsonAsync<ReadRide>($"/Rides/{ride.Id}", JsonOptions))!;
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        Assert.Equal(ride.Description, read.Description);
        Assert.Equal(EnumVehicleType.Car, read.VehicleType);
    }

    [Fact]
    public async Task CreateRide_WithTheRemovedSeatCount_IsAcceptedAndDoesNotAnswerIt()
    {
        HttpClient driver = _factory.CreateClientForNewUser("Ana Beatriz Nogueira");

        HttpResponseMessage response = await driver.PostAsJsonAsync("/Rides", new
        {
            availableSeats = 3,
            destination = "Sorocaba centro",
            departureDate = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(7)).ToString("yyyy-MM-dd"),
            departureTime = "08:30:00",
            rideType = "Solidarity",
            vehicleType = "Car",
        });

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        Assert.DoesNotContain("availableSeats", await response.Content.ReadAsStringAsync(), StringComparison.OrdinalIgnoreCase);
    }

    [Fact]
    public async Task UpdateRide_WithADepartureInThePast_IsRejected()
    {
        (ReadRide ride, HttpClient driver) = await OfferRideAsync();
        DateOnly lastWeek = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(-7));

        HttpResponseMessage response = await driver.PutAsJsonAsync(
            $"/Rides/{ride.Id}", new { departureDate = lastWeek.ToString("yyyy-MM-dd"), vehicleType = "Car" });

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task GetRide_ThatDoesNotExist_IsNotFound()
    {
        HttpClient client = _factory.CreateClientForNewUser("Bruno Carvalho Souza");

        HttpResponseMessage response = await client.GetAsync($"/Rides/{AbsentRideId}");

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task UpdateRide_ThatDoesNotExist_IsNotFound()
    {
        HttpClient client = _factory.CreateClientForNewUser("Bruno Carvalho Souza");

        HttpResponseMessage response = await client
            .PutAsJsonAsync($"/Rides/{AbsentRideId}", new { description = "Sai do portão principal.", vehicleType = "Car" });

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task DeleteRide_ThatDoesNotExist_IsNotFound()
    {
        HttpClient client = _factory.CreateClientForNewUser("Bruno Carvalho Souza");

        HttpResponseMessage response = await client.DeleteAsync($"/Rides/{AbsentRideId}");

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }
}
