using System.Net;
using System.Net.Http.Json;
using FateConnect.Api.Tests.Fixtures;
using static FateConnect.Api.Tests.Rides.RideRepetitionDates;

namespace FateConnect.Api.Tests.Rides;

public class RideRepetitionRulesTests : IClassFixture<ApiFactory>
{
    private readonly ApiFactory _factory;

    public RideRepetitionRulesTests(ApiFactory factory)
    {
        _factory = factory;
    }

    private sealed record ReadRide(Guid Id, DateOnly DepartureDate, string Frequency, DateOnly? RepeatUntil);

    private static DateOnly StartFor(string kind) => kind switch
    {
        "saturday" => FirstDayFrom(7, day => day.DayOfWeek == DayOfWeek.Saturday),
        "monday" => FirstDayFrom(7, day => day.DayOfWeek == DayOfWeek.Monday && !IsHoliday(day)),
        "holiday" => FirstDayFrom(7, IsHoliday),
        _ => WeeklyStartWithoutHolidays(2),
    };

    private static DateOnly? RepeatUntilFor(string kind, DateOnly start) => kind switch
    {
        "none" => null,
        "same" => start,
        "before" => start.AddDays(-1),
        "sixMonths" => start.AddMonths(6),
        "beyondSixMonths" => start.AddMonths(6).AddDays(1),
        _ => start.AddDays(7),
    };

    private static Dictionary<string, object?> RidePayload(string frequency, DateOnly start, DateOnly? repeatUntil) => new()
    {
        ["destination"] = "Fatec Sorocaba",
        ["departureDate"] = Iso(start),
        ["departureTime"] = "07:30:00",
        ["rideType"] = "Solidarity",
        ["frequency"] = frequency,
        ["repeatUntil"] = repeatUntil is null ? null : Iso(repeatUntil.Value),
    };

    [Theory]
    [InlineData("Weekdays", "saturday", "oneWeek", HttpStatusCode.BadRequest)]
    [InlineData("Weekdays", "monday", "oneWeek", HttpStatusCode.Created)]
    [InlineData("Weekly", "holiday", "oneWeek", HttpStatusCode.BadRequest)]
    [InlineData("Once", "holiday", "none", HttpStatusCode.BadRequest)]
    [InlineData("Weekly", "ordinary", "none", HttpStatusCode.BadRequest)]
    [InlineData("Weekly", "ordinary", "oneWeek", HttpStatusCode.Created)]
    [InlineData("Weekly", "ordinary", "before", HttpStatusCode.BadRequest)]
    [InlineData("Weekly", "ordinary", "same", HttpStatusCode.Created)]
    [InlineData("Weekly", "ordinary", "beyondSixMonths", HttpStatusCode.BadRequest)]
    [InlineData("Weekly", "ordinary", "sixMonths", HttpStatusCode.Created)]
    [InlineData("Once", "ordinary", "oneWeek", HttpStatusCode.BadRequest)]
    [InlineData("Once", "ordinary", "none", HttpStatusCode.Created)]
    public async Task CreateRide_WithARepetition_FollowsTheRepetitionRules(
        string frequency,
        string startKind,
        string repeatUntilKind,
        HttpStatusCode expected)
    {
        DateOnly start = StartFor(startKind);
        HttpClient client = _factory.CreateClientForNewUser("Ana Beatriz Nogueira");

        HttpResponseMessage response = await client.PostAsJsonAsync(
            "/Rides", RidePayload(frequency, start, RepeatUntilFor(repeatUntilKind, start)));

        Assert.Equal(expected, response.StatusCode);
    }

    [Fact]
    public async Task CreateRide_WithoutTheRepetitionFields_IsASingleRideAsBefore()
    {
        DateOnly start = StartFor("ordinary");
        HttpClient client = _factory.CreateClientForNewUser("Ana Beatriz Nogueira");

        HttpResponseMessage response = await client.PostAsJsonAsync("/Rides", new
        {
            destination = "Fatec Sorocaba",
            departureDate = Iso(start),
            departureTime = "07:30:00",
            rideType = "Solidarity",
        });

        ReadRide? ride = await response.Content.ReadFromJsonAsync<ReadRide>();
        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        Assert.Equal("Once", ride!.Frequency);
        Assert.Null(ride.RepeatUntil);
        Assert.Equal(start, ride.DepartureDate);
    }

    [Fact]
    public async Task UpdateRide_WithOnlyTheDescription_KeepsTheRepetition()
    {
        DateOnly start = StartFor("ordinary");
        HttpClient client = _factory.CreateClientForNewUser("Ana Beatriz Nogueira");
        HttpResponseMessage created = await client.PostAsJsonAsync("/Rides", RidePayload("Weekly", start, start.AddDays(7)));
        ReadRide ride = (await created.Content.ReadFromJsonAsync<ReadRide>())!;

        HttpResponseMessage response = await client.PutAsJsonAsync(
            $"/Rides/{ride.Id}", new { description = "Sai do portão principal." });

        ReadRide updated = (await response.Content.ReadFromJsonAsync<ReadRide>())!;
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal("Weekly", updated.Frequency);
        Assert.Equal(start.AddDays(7), updated.RepeatUntil);
    }

    [Fact]
    public async Task UpdateRide_OfASingleRideToAHoliday_IsRefused()
    {
        HttpClient client = _factory.CreateClientForNewUser("Ana Beatriz Nogueira");
        HttpResponseMessage created = await client.PostAsJsonAsync("/Rides", RidePayload("Once", StartFor("ordinary"), null));
        ReadRide ride = (await created.Content.ReadFromJsonAsync<ReadRide>())!;

        HttpResponseMessage response = await client.PutAsJsonAsync(
            $"/Rides/{ride.Id}", new { departureDate = Iso(StartFor("holiday")) });

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task UpdateRide_ToASingleRide_DropsTheEndDate()
    {
        DateOnly start = StartFor("ordinary");
        HttpClient client = _factory.CreateClientForNewUser("Ana Beatriz Nogueira");
        HttpResponseMessage created = await client.PostAsJsonAsync("/Rides", RidePayload("Weekly", start, start.AddDays(7)));
        ReadRide ride = (await created.Content.ReadFromJsonAsync<ReadRide>())!;

        HttpResponseMessage response = await client.PutAsJsonAsync($"/Rides/{ride.Id}", new { frequency = "Once" });

        ReadRide updated = (await response.Content.ReadFromJsonAsync<ReadRide>())!;
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal("Once", updated.Frequency);
        Assert.Null(updated.RepeatUntil);
    }
}
