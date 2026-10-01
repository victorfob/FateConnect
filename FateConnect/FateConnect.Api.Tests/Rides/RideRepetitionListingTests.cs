using System.Net;
using System.Net.Http.Json;
using FateConnect.Api.Tests.Fixtures;
using static FateConnect.Api.Tests.Rides.RideRepetitionDates;

namespace FateConnect.Api.Tests.Rides;

public class RideRepetitionListingTests
{
    private const int DepartureHour = 14;

    private sealed record ReadRide(Guid Id, DateOnly DepartureDate, string Frequency);

    private sealed record PagedRides(IReadOnlyList<ReadRide> Items, int Total);

    private static async Task<ReadRide> OfferAsync(
        HttpClient client,
        string frequency,
        DateOnly start,
        DateOnly? repeatUntil)
    {
        HttpResponseMessage response = await client.PostAsJsonAsync("/Rides", new Dictionary<string, object?>
        {
            ["destination"] = "Fatec Sorocaba",
            ["departureDate"] = Iso(start),
            ["departureTime"] = $"{DepartureHour}:00:00",
            ["rideType"] = "Solidarity",
            ["vehicleType"] = "Car",
            ["frequency"] = frequency,
            ["repeatUntil"] = repeatUntil is null ? null : Iso(repeatUntil.Value),
        });

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);

        return (await response.Content.ReadFromJsonAsync<ReadRide>())!;
    }

    private static async Task<(ReadRide Weekly, ReadRide Once, HttpClient Client)> OfferWeeklyAndOnceOnTheSameDayAsync(
        ApiFactory factory,
        DateOnly day)
    {
        HttpClient client = factory.CreateClientForNewUser("Ana Beatriz Nogueira");

        ReadRide weekly = await OfferAsync(client, "Weekly", day, day.AddDays(14));
        ReadRide once = await OfferAsync(client, "Once", day, null);

        return (weekly, once, client);
    }

    [Fact]
    public async Task GetRides_BeforeTheDepartureTimeOfToday_ShowsTodayForBothRides()
    {
        DateOnly day = WeeklyStartWithoutHolidays(3);
        MovableTimeProvider clock = new(DateTimeOffset.UtcNow);
        using ApiFactory factory = new() { Clock = clock };
        (ReadRide weekly, ReadRide once, HttpClient client) = await OfferWeeklyAndOnceOnTheSameDayAsync(factory, day);
        clock.Now = InProductTimeZone(day, DepartureHour - 2);

        PagedRides page = (await client.GetFromJsonAsync<PagedRides>("/Rides"))!;

        Assert.Equal(day, page.Items.Single(ride => ride.Id == weekly.Id).DepartureDate);
        Assert.Equal(day, page.Items.Single(ride => ride.Id == once.Id).DepartureDate);
    }

    [Fact]
    public async Task GetRides_AfterTheDepartureTimeOfToday_ShowsNextWeekAndDropsTheSingleRide()
    {
        DateOnly day = WeeklyStartWithoutHolidays(3);
        MovableTimeProvider clock = new(DateTimeOffset.UtcNow);
        using ApiFactory factory = new() { Clock = clock };
        (ReadRide weekly, ReadRide once, HttpClient client) = await OfferWeeklyAndOnceOnTheSameDayAsync(factory, day);
        clock.Now = InProductTimeZone(day, DepartureHour + 1);

        PagedRides page = (await client.GetFromJsonAsync<PagedRides>("/Rides"))!;

        Assert.Equal(day.AddDays(7), page.Items.Single(ride => ride.Id == weekly.Id).DepartureDate);
        Assert.DoesNotContain(page.Items, ride => ride.Id == once.Id);
    }

    [Fact]
    public async Task GetRides_WithARepeatingRideThatAlreadyStarted_OrdersByTheNextDeparture()
    {
        DateOnly day = WeeklyStartWithoutHolidays(3);
        MovableTimeProvider clock = new(DateTimeOffset.UtcNow);
        using ApiFactory factory = new() { Clock = clock };
        HttpClient client = factory.CreateClientForNewUser("Ana Beatriz Nogueira");
        ReadRide weekly = await OfferAsync(client, "Weekly", day, day.AddDays(14));
        ReadRide later = await OfferAsync(client, "Once", day.AddDays(3), null);
        clock.Now = InProductTimeZone(day.AddDays(1), DepartureHour);

        PagedRides page = (await client.GetFromJsonAsync<PagedRides>("/Rides"))!;

        Assert.Equal([later.Id, weekly.Id], page.Items.Select(ride => ride.Id));
    }

    [Fact]
    public async Task GetRides_FilteredByTheDayOfTheThirdDeparture_FindsTheWeeklyRide()
    {
        DateOnly day = WeeklyStartWithoutHolidays(4);
        using ApiFactory factory = new();
        HttpClient client = factory.CreateClientForNewUser("Ana Beatriz Nogueira");
        ReadRide weekly = await OfferAsync(client, "Weekly", day, day.AddDays(21));
        string thirdDeparture = Iso(day.AddDays(14));

        PagedRides page = (await client.GetFromJsonAsync<PagedRides>(
            $"/Rides?DateFrom={thirdDeparture}&DateTo={thirdDeparture}"))!;

        Assert.Equal([weekly.Id], page.Items.Select(ride => ride.Id));
    }

    [Fact]
    public async Task UpdateRide_MonthlyFromThe31stWithoutChangingTheDate_KeepsThe31stAsTheReference()
    {
        DateOnly reference = MonthlyStartOnThe31stBeforeAShorterMonth();
        MovableTimeProvider clock = new(DateTimeOffset.UtcNow);
        using ApiFactory factory = new() { Clock = clock };
        HttpClient client = factory.CreateClientForNewUser("Ana Beatriz Nogueira");
        ReadRide monthly = await OfferAsync(client, "Monthly", reference, reference.AddMonths(2));
        DateOnly shorterMonthDeparture = reference.AddMonths(1);
        clock.Now = InProductTimeZone(reference.AddDays(1), DepartureHour);
        HttpResponseMessage update = await client.PutAsJsonAsync($"/Rides/{monthly.Id}", new
        {
            departureDate = Iso(shorterMonthDeparture),
            description = "Sai do portão principal.",
            vehicleType = "Car",
        });
        Assert.Equal(HttpStatusCode.OK, update.StatusCode);
        clock.Now = InProductTimeZone(shorterMonthDeparture.AddDays(1), DepartureHour);

        ReadRide ride = (await client.GetFromJsonAsync<ReadRide>($"/Rides/{monthly.Id}"))!;

        Assert.Equal(reference.AddMonths(2), ride.DepartureDate);
        Assert.Equal(31, ride.DepartureDate.Day);
    }
}
