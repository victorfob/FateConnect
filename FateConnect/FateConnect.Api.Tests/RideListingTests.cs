using System.Net.Http.Json;
using System.Text.Json;

namespace FateConnect.Api.Tests;

public class RideListingTests
{
    private static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web);

    private sealed record ReadRide(Guid Id, string Destination);

    private sealed record PagedRides(
        IReadOnlyList<ReadRide> Items,
        int Page,
        int PageSize,
        int Total,
        int TotalPages);

    private static int SeedRides(ApiFactory factory, int count)
    {
        int driverId = factory.SeedUser("Ana Beatriz Nogueira", "15999990000", "ana.nogueira@gmail.com");
        DateOnly tomorrow = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(1));

        for (int index = 0; index < count; index++)
            factory.SeedRide(driverId, tomorrow.AddDays(index), new TimeOnly(8, 30));

        return driverId;
    }

    private static async Task<PagedRides> GetPageAsync(ApiFactory factory, int userId, string query = "")
    {
        PagedRides? page = await factory
            .CreateClientFor(userId)
            .GetFromJsonAsync<PagedRides>($"/Rides{query}", JsonOptions);

        return page!;
    }

    [Fact]
    public async Task GetRides_WithoutPagingParameters_ReturnsTheFirstTenRides()
    {
        using ApiFactory factory = new();
        int driverId = SeedRides(factory, 23);

        PagedRides page = await GetPageAsync(factory, driverId);

        Assert.Equal(10, page.Items.Count);
        Assert.Equal(1, page.Page);
        Assert.Equal(10, page.PageSize);
        Assert.Equal(23, page.Total);
        Assert.Equal(3, page.TotalPages);
    }

    [Fact]
    public async Task GetRides_WithASecondPage_ReturnsTheRidesThatFollowTheFirst()
    {
        using ApiFactory factory = new();
        int driverId = SeedRides(factory, 23);

        PagedRides first = await GetPageAsync(factory, driverId, "?Page=1");
        PagedRides second = await GetPageAsync(factory, driverId, "?Page=2");

        Assert.Equal(10, second.Items.Count);
        Assert.Equal(2, second.Page);
        Assert.Empty(first.Items.Select(ride => ride.Id).Intersect(second.Items.Select(ride => ride.Id)));
    }

    [Fact]
    public async Task GetRides_WithAPageBeyondTheLast_ReturnsNoItemsAndKeepsTheTotal()
    {
        using ApiFactory factory = new();
        int driverId = SeedRides(factory, 23);

        PagedRides page = await GetPageAsync(factory, driverId, "?Page=99");

        Assert.Empty(page.Items);
        Assert.Equal(23, page.Total);
        Assert.Equal(3, page.TotalPages);
    }

    [Theory]
    [InlineData("?Page=0")]
    [InlineData("?Page=-5")]
    public async Task GetRides_WithAPageBelowTheFirst_FallsBackToTheFirstPage(string query)
    {
        using ApiFactory factory = new();
        int driverId = SeedRides(factory, 12);

        PagedRides page = await GetPageAsync(factory, driverId, query);

        Assert.Equal(1, page.Page);
        Assert.Equal(10, page.Items.Count);
    }

    [Fact]
    public async Task GetRides_WithAPageSizeAboveTheCap_FallsBackToTheCap()
    {
        using ApiFactory factory = new();
        int driverId = SeedRides(factory, 55);

        PagedRides page = await GetPageAsync(factory, driverId, "?PageSize=100000");

        Assert.Equal(50, page.PageSize);
        Assert.Equal(50, page.Items.Count);
        Assert.Equal(55, page.Total);
        Assert.Equal(2, page.TotalPages);
    }

    [Theory]
    [InlineData("?PageSize=0")]
    [InlineData("?PageSize=-3")]
    public async Task GetRides_WithAPageSizeBelowOne_FallsBackToTheDefault(string query)
    {
        using ApiFactory factory = new();
        int driverId = SeedRides(factory, 12);

        PagedRides page = await GetPageAsync(factory, driverId, query);

        Assert.Equal(10, page.PageSize);
        Assert.Equal(10, page.Items.Count);
    }

    [Fact]
    public async Task GetRides_WithoutAnyResult_ReportsZeroTotalPages()
    {
        using ApiFactory factory = new();
        int driverId = factory.SeedUser("Ana Beatriz Nogueira", "15999990000", "ana.nogueira@gmail.com");

        PagedRides page = await GetPageAsync(factory, driverId);

        Assert.Empty(page.Items);
        Assert.Equal(0, page.Total);
        Assert.Equal(0, page.TotalPages);
    }

    [Fact]
    public async Task GetRides_WithARideAlreadyDeparted_LeavesItOutAndOutOfTheTotal()
    {
        using ApiFactory factory = new();
        int driverId = factory.SeedUser("Ana Beatriz Nogueira", "15999990000", "ana.nogueira@gmail.com");

        DateOnly yesterday = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(-1));
        DateOnly tomorrow = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(1));
        factory.SeedRide(driverId, yesterday, new TimeOnly(8, 30), "Carona vencida");
        Guid upcoming = factory.SeedRide(driverId, tomorrow, new TimeOnly(8, 30), "Carona futura");

        PagedRides page = await GetPageAsync(factory, driverId);

        Assert.Equal(1, page.Total);
        Assert.Equal(upcoming, Assert.Single(page.Items).Id);
    }

    [Fact]
    public async Task GetRides_FilteredByDepartureTime_KeepsOnlyTheRidesThatLeaveAtThatHour()
    {
        using ApiFactory factory = new();
        int driverId = factory.SeedUser("Ana Beatriz Nogueira", "15999990000", "ana.nogueira@gmail.com");
        DateOnly tomorrow = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(1));
        factory.SeedRide(driverId, tomorrow, new TimeOnly(7, 0));
        factory.SeedRide(driverId, tomorrow, new TimeOnly(22, 0));

        PagedRides page = await GetPageAsync(factory, driverId, "?DepartureTime=07:00:00");

        Assert.Equal(1, page.Total);
    }

    [Fact]
    public async Task GetRides_FilteredByRideType_KeepsOnlyTheRidesOfThatType()
    {
        using ApiFactory factory = new();
        int driverId = SeedRides(factory, 3);

        PagedRides solidarity = await GetPageAsync(factory, driverId, "?RideType=Solidarity");
        PagedRides egalitarian = await GetPageAsync(factory, driverId, "?RideType=Egalitarian");

        Assert.Equal(3, solidarity.Total);
        Assert.Equal(0, egalitarian.Total);
    }

    [Fact]
    public async Task GetRides_WithAFilter_CountsTheTotalAfterFilteringAndBeforePaging()
    {
        using ApiFactory factory = new();
        int driverId = SeedRides(factory, 23);
        DateOnly tomorrow = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(1));

        PagedRides page = await GetPageAsync(factory, driverId, $"?DepartureDate={tomorrow:yyyy-MM-dd}");

        Assert.Equal(1, page.Total);
        Assert.Equal(1, page.TotalPages);
        Assert.Single(page.Items);
    }

    [Fact]
    public async Task GetRides_FilteredByDestination_KeepsOnlyTheRidesThatMatch()
    {
        using ApiFactory factory = new();
        int driverId = factory.SeedUser("Ana Beatriz Nogueira", "15999990000", "ana.nogueira@gmail.com");
        DateOnly tomorrow = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(1));
        Guid matching = factory.SeedRide(driverId, tomorrow, new TimeOnly(8, 30), "São Paulo centro");
        factory.SeedRide(driverId, tomorrow, new TimeOnly(9, 0), "Campinas");

        PagedRides page = await GetPageAsync(factory, driverId, "?Destination=paulo");

        Assert.Equal(1, page.Total);
        Assert.Equal(matching, Assert.Single(page.Items).Id);
    }

    [Theory]
    [InlineData("São Paulo centro", "sao paulo")]
    [InlineData("Sao Paulo centro", "são paulo")]
    [InlineData("São Paulo centro", "SÃO PAULO")]
    public async Task GetRides_FilteredByDestination_IgnoresAccentsAndCase(string destination, string search)
    {
        using ApiFactory factory = new();
        int driverId = factory.SeedUser("Ana Beatriz Nogueira", "15999990000", "ana.nogueira@gmail.com");
        DateOnly tomorrow = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(1));
        Guid expected = factory.SeedRide(driverId, tomorrow, new TimeOnly(8, 30), destination);

        PagedRides page = await GetPageAsync(factory, driverId, $"?Destination={Uri.EscapeDataString(search)}");

        Assert.Equal(expected, Assert.Single(page.Items).Id);
    }

    [Fact]
    public async Task GetRides_WithEveryFilterAtOnce_IsTranslatedToSql()
    {
        using ApiFactory factory = new();
        int driverId = factory.SeedUser("Ana Beatriz Nogueira", "15999990000", "ana.nogueira@gmail.com");
        DateOnly tomorrow = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(1));
        Guid expected = factory.SeedRide(driverId, tomorrow, new TimeOnly(8, 30), "Sorocaba centro");

        PagedRides page = await GetPageAsync(
            factory,
            driverId,
            $"?Destination=sorocaba&DepartureDate={tomorrow:yyyy-MM-dd}&DepartureTime=08:30:00&RideType=Solidarity");

        Assert.Equal(expected, Assert.Single(page.Items).Id);
    }
}
