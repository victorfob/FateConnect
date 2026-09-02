using System.Net;
using System.Net.Http.Json;
using System.Text.Json;

namespace FateConnect.Api.Tests;

public class RideOwnershipTests : IClassFixture<ApiFactory>
{
    private static readonly JsonSerializerOptions JsonOptions =
        new(JsonSerializerDefaults.Web);

    private readonly ApiFactory _factory;

    public RideOwnershipTests(ApiFactory factory)
    {
        _factory = factory;
    }

    private sealed record RideDriver(string Name, string? Email, string? Phone);

    private sealed record ReadRide(Guid Id, string Destination, RideDriver Driver, bool IsOwner);

    private static object NewRidePayload(string destination) => new
    {
        availableSeats = 3,
        destination,
        departureDate = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(7)).ToString("yyyy-MM-dd"),
        departureTime = "08:30:00",
        rideType = "Solidarity",
        description = "Vaga para quem sai do campus.",
    };

    private async Task<(ReadRide Ride, SeededUser Driver, int OtherUserId)> OfferRideAsync(string destination)
    {
        SeededUser driver = _factory.SeedUser("Ana Beatriz Nogueira");
        SeededUser otherUser = _factory.SeedUser("Bruno Carvalho Souza");

        HttpResponseMessage response = await _factory
            .CreateClientFor(driver.Id)
            .PostAsJsonAsync("/Rides", NewRidePayload(destination));

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);

        ReadRide ride = (await response.Content.ReadFromJsonAsync<ReadRide>(JsonOptions))!;

        return (ride, driver, otherUser.Id);
    }

    [Fact]
    public async Task CreateRide_RecordsTheAuthenticatedUserAsTheDriver()
    {
        (ReadRide ride, SeededUser driver, _) = await OfferRideAsync("Sorocaba centro");

        Assert.Equal("Ana Beatriz Nogueira", ride.Driver.Name);
        Assert.Equal(driver.ContactEmail, ride.Driver.Email);
        Assert.Equal(driver.Phone, ride.Driver.Phone);
        Assert.True(ride.IsOwner);
    }

    [Fact]
    public async Task ReadRide_FlagsOwnershipForEachReader()
    {
        (ReadRide ride, SeededUser driver, int otherUserId) = await OfferRideAsync("Votorantim");

        ReadRide asDriver = (await _factory.CreateClientFor(driver.Id)
            .GetFromJsonAsync<ReadRide>($"/Rides/{ride.Id}", JsonOptions))!;

        ReadRide asOther = (await _factory.CreateClientFor(otherUserId)
            .GetFromJsonAsync<ReadRide>($"/Rides/{ride.Id}", JsonOptions))!;

        Assert.True(asDriver.IsOwner);
        Assert.False(asOther.IsOwner);
        Assert.Equal("Ana Beatriz Nogueira", asOther.Driver.Name);
    }

    [Fact]
    public async Task UpdateRide_ByAnotherUser_IsForbidden()
    {
        (ReadRide ride, _, int otherUserId) = await OfferRideAsync("Itu");

        HttpResponseMessage response = await _factory.CreateClientFor(otherUserId)
            .PutAsJsonAsync($"/Rides/{ride.Id}", new { availableSeats = 1 });

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    [Fact]
    public async Task DeleteRide_ByAnotherUser_IsForbidden()
    {
        (ReadRide ride, _, int otherUserId) = await OfferRideAsync("Salto");

        HttpResponseMessage response = await _factory.CreateClientFor(otherUserId)
            .DeleteAsync($"/Rides/{ride.Id}");

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    [Fact]
    public async Task UpdateAndDeleteRide_ByTheDriver_Succeed()
    {
        (ReadRide ride, SeededUser owner, _) = await OfferRideAsync("Piedade");
        HttpClient driver = _factory.CreateClientFor(owner.Id);

        HttpResponseMessage update = await driver
            .PutAsJsonAsync($"/Rides/{ride.Id}", new { availableSeats = 1 });

        HttpResponseMessage delete = await driver.DeleteAsync($"/Rides/{ride.Id}");

        Assert.Equal(HttpStatusCode.OK, update.StatusCode);
        Assert.Equal(HttpStatusCode.NoContent, delete.StatusCode);
    }
}
