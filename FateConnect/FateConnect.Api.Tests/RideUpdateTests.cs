using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using System.Text.Json.Serialization;
using FateConnect.Api.Modules.Rides.Enums;

namespace FateConnect.Api.Tests;

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
        int AvailableSeats,
        string Destination,
        DateOnly DepartureDate,
        string DepartureTime,
        EnumRideType RideType,
        string? Description);

    private static object NewRidePayload() => new
    {
        availableSeats = 3,
        destination = "Sorocaba centro",
        departureDate = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(7)).ToString("yyyy-MM-dd"),
        departureTime = "08:30:00",
        rideType = "Solidarity",
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
            availableSeats = 2,
            destination = "Votorantim",
            departureDate = newDate.ToString("yyyy-MM-dd"),
            departureTime = "19:45:00",
            rideType = "Egalitarian",
            description = "Passa pelo terminal.",
        });

        ReadRide updated = (await response.Content.ReadFromJsonAsync<ReadRide>(JsonOptions))!;
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal(2, updated.AvailableSeats);
        Assert.Equal("Votorantim", updated.Destination);
        Assert.Equal(newDate, updated.DepartureDate);
        Assert.Equal("19:45:00", updated.DepartureTime);
        Assert.Equal(EnumRideType.Egalitarian, updated.RideType);
        Assert.Equal("Passa pelo terminal.", updated.Description);
    }

    [Fact]
    public async Task UpdateRide_WithOnlyTheTime_KeepsTheDateAndTheRest()
    {
        (ReadRide ride, HttpClient driver) = await OfferRideAsync();

        HttpResponseMessage response = await driver
            .PutAsJsonAsync($"/Rides/{ride.Id}", new { departureTime = "21:15:00" });

        ReadRide updated = (await response.Content.ReadFromJsonAsync<ReadRide>(JsonOptions))!;
        Assert.Equal("21:15:00", updated.DepartureTime);
        Assert.Equal(ride.DepartureDate, updated.DepartureDate);
        Assert.Equal(ride.Destination, updated.Destination);
        Assert.Equal(ride.AvailableSeats, updated.AvailableSeats);
    }

    [Fact]
    public async Task UpdateRide_WithASeatCountOutsideTheRange_IsRejectedWithTheDomainMessage()
    {
        (ReadRide ride, HttpClient driver) = await OfferRideAsync();

        HttpResponseMessage response = await driver
            .PutAsJsonAsync($"/Rides/{ride.Id}", new { availableSeats = 9 });

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        Assert.Contains("9", await response.Content.ReadAsStringAsync(), StringComparison.Ordinal);
    }

    [Fact]
    public async Task UpdateRide_WithADepartureInThePast_IsRejected()
    {
        (ReadRide ride, HttpClient driver) = await OfferRideAsync();
        DateOnly lastWeek = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(-7));

        HttpResponseMessage response = await driver.PutAsJsonAsync(
            $"/Rides/{ride.Id}", new { departureDate = lastWeek.ToString("yyyy-MM-dd") });

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
            .PutAsJsonAsync($"/Rides/{AbsentRideId}", new { availableSeats = 2 });

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
