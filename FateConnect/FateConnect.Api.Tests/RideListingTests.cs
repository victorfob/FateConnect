using System.Net;
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
        int driverId = factory.SeedUser("Ana Beatriz Nogueira").Id;
        DateOnly tomorrow = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(1));

        for (int index = 0; index < count; index++)
            factory.SeedRide(driverId, tomorrow.AddDays(index), new TimeOnly(8, 30));

        return driverId;
    }

    private static int SeedOneRidePerShift(ApiFactory factory)
    {
        int driverId = factory.SeedUser("Ana Beatriz Nogueira").Id;
        DateOnly tomorrow = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(1));

        factory.SeedRide(driverId, tomorrow, new TimeOnly(5, 0), "Praça da Sé");
        factory.SeedRide(driverId, tomorrow, new TimeOnly(13, 0), "Avenida Paulista");
        factory.SeedRide(driverId, tomorrow, new TimeOnly(23, 0), "Terminal Bandeira");

        return driverId;
    }

    private static async Task<PagedRides> GetPageAsync(ApiFactory factory, int userId, string query = "")
    {
        PagedRides? page = await factory
            .CreateClientFor(userId)
            .GetFromJsonAsync<PagedRides>($"/Rides{query}", JsonOptions);

        return page!;
    }

    private static async Task<HttpResponseMessage> RequestPageAsync(ApiFactory factory, int userId, string query)
    {
        return await factory.CreateClientFor(userId).GetAsync($"/Rides{query}");
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
        int driverId = factory.SeedUser("Ana Beatriz Nogueira").Id;

        PagedRides page = await GetPageAsync(factory, driverId);

        Assert.Empty(page.Items);
        Assert.Equal(0, page.Total);
        Assert.Equal(0, page.TotalPages);
    }

    [Fact]
    public async Task GetRides_WithARideAlreadyDeparted_LeavesItOutAndOutOfTheTotal()
    {
        using ApiFactory factory = new();
        int driverId = factory.SeedUser("Ana Beatriz Nogueira").Id;

        DateOnly yesterday = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(-1));
        DateOnly tomorrow = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(1));
        factory.SeedRide(driverId, yesterday, new TimeOnly(8, 30), "Carona vencida");
        Guid upcoming = factory.SeedRide(driverId, tomorrow, new TimeOnly(8, 30), "Carona futura");

        PagedRides page = await GetPageAsync(factory, driverId);

        Assert.Equal(1, page.Total);
        Assert.Equal(upcoming, Assert.Single(page.Items).Id);
    }

    [Theory]
    [InlineData("Morning")]
    [InlineData("Afternoon")]
    [InlineData("Night")]
    public async Task GetRides_FilteredByShift_KeepsOnlyTheRideThatDepartsInIt(string shift)
    {
        using ApiFactory factory = new();
        int driverId = SeedOneRidePerShift(factory);

        PagedRides page = await GetPageAsync(factory, driverId, $"?DepartureShift={shift}");

        Assert.Equal(1, page.Total);
    }

    [Fact]
    public async Task GetRides_WithoutAShift_KeepsTheRidesOfEveryShift()
    {
        using ApiFactory factory = new();
        int driverId = SeedOneRidePerShift(factory);

        PagedRides page = await GetPageAsync(factory, driverId);

        Assert.Equal(3, page.Total);
    }

    [Theory]
    [InlineData(4, 0, "Morning", "Night")]
    [InlineData(11, 59, "Morning", "Afternoon")]
    [InlineData(12, 0, "Afternoon", "Morning")]
    [InlineData(17, 59, "Afternoon", "Night")]
    [InlineData(18, 0, "Night", "Afternoon")]
    [InlineData(3, 59, "Night", "Morning")]
    public async Task GetRides_FilteredByShift_PutsTheEdgeOfTheRangeInOneShiftOnly(
        int hour,
        int minute,
        string ownShift,
        string neighbourShift)
    {
        using ApiFactory factory = new();
        int driverId = factory.SeedUser("Ana Beatriz Nogueira").Id;
        DateOnly tomorrow = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(1));
        factory.SeedRide(driverId, tomorrow, new TimeOnly(hour, minute), "Avenida Paulista");

        PagedRides own = await GetPageAsync(factory, driverId, $"?DepartureShift={ownShift}");
        PagedRides neighbour = await GetPageAsync(factory, driverId, $"?DepartureShift={neighbourShift}");

        Assert.Equal(1, own.Total);
        Assert.Equal(0, neighbour.Total);
    }

    [Fact]
    public async Task GetRides_FilteredByTheNightShift_KeepsBothSidesOfMidnight()
    {
        using ApiFactory factory = new();
        int driverId = factory.SeedUser("Ana Beatriz Nogueira").Id;
        DateOnly tomorrow = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(1));
        factory.SeedRide(driverId, tomorrow, new TimeOnly(23, 30), "Terminal Bandeira");
        factory.SeedRide(driverId, tomorrow, new TimeOnly(1, 0), "Estação da Luz");

        PagedRides page = await GetPageAsync(factory, driverId, "?DepartureShift=Night");

        Assert.Equal(2, page.Total);
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

        PagedRides page = await GetPageAsync(
            factory, driverId, $"?DateFrom={tomorrow:yyyy-MM-dd}&DateTo={tomorrow:yyyy-MM-dd}");

        Assert.Equal(1, page.Total);
        Assert.Equal(1, page.TotalPages);
        Assert.Single(page.Items);
    }

    [Fact]
    public async Task GetRides_FilteredBySearchTerm_KeepsOnlyTheRidesThatMatch()
    {
        using ApiFactory factory = new();
        int driverId = factory.SeedUser("Ana Beatriz Nogueira").Id;
        DateOnly tomorrow = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(1));
        Guid matching = factory.SeedRide(driverId, tomorrow, new TimeOnly(8, 30), "São Paulo centro");
        factory.SeedRide(driverId, tomorrow, new TimeOnly(9, 0), "Campinas");

        PagedRides page = await GetPageAsync(factory, driverId, "?SearchTerm=paulo");

        Assert.Equal(1, page.Total);
        Assert.Equal(matching, Assert.Single(page.Items).Id);
    }

    [Theory]
    [InlineData("São Paulo centro", "sao paulo")]
    [InlineData("Sao Paulo centro", "são paulo")]
    [InlineData("São Paulo centro", "SÃO PAULO")]
    public async Task GetRides_FilteredBySearchTerm_IgnoresAccentsAndCase(string destination, string search)
    {
        using ApiFactory factory = new();
        int driverId = factory.SeedUser("Ana Beatriz Nogueira").Id;
        DateOnly tomorrow = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(1));
        Guid expected = factory.SeedRide(driverId, tomorrow, new TimeOnly(8, 30), destination);

        PagedRides page = await GetPageAsync(factory, driverId, $"?SearchTerm={Uri.EscapeDataString(search)}");

        Assert.Equal(expected, Assert.Single(page.Items).Id);
    }

    [Fact]
    public async Task GetRides_FilteredBySearchTerm_AlsoMatchesTheDescription()
    {
        using ApiFactory factory = new();
        int driverId = factory.SeedUser("Ana Beatriz Nogueira").Id;
        DateOnly tomorrow = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(1));
        Guid matching = factory.SeedRide(
            driverId, tomorrow, new TimeOnly(8, 30), "Campinas", "Passa pelo terminal de Sorocaba.");
        factory.SeedRide(driverId, tomorrow, new TimeOnly(9, 0), "Itu", "Saída pelo portão da frente.");

        PagedRides page = await GetPageAsync(factory, driverId, "?SearchTerm=sorocaba");

        Assert.Equal(1, page.Total);
        Assert.Equal(matching, Assert.Single(page.Items).Id);
    }

    [Fact]
    public async Task GetRides_FilteredBySearchTerm_MatchesEvenWhenTheRideHasNoDescription()
    {
        using ApiFactory factory = new();
        int driverId = factory.SeedUser("Ana Beatriz Nogueira").Id;
        DateOnly tomorrow = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(1));
        Guid matching = factory.SeedRide(driverId, tomorrow, new TimeOnly(8, 30), "Votorantim");

        PagedRides page = await GetPageAsync(factory, driverId, "?SearchTerm=votorantim");

        Assert.Equal(matching, Assert.Single(page.Items).Id);
    }

    [Fact]
    public async Task GetRides_WithEveryFilterAtOnce_IsTranslatedToSql()
    {
        using ApiFactory factory = new();
        int driverId = factory.SeedUser("Ana Beatriz Nogueira").Id;
        DateOnly tomorrow = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(1));
        Guid expected = factory.SeedRide(driverId, tomorrow, new TimeOnly(8, 30), "Sorocaba centro");

        PagedRides page = await GetPageAsync(
            factory,
            driverId,
            $"?SearchTerm=sorocaba&DateFrom={tomorrow:yyyy-MM-dd}&DateTo={tomorrow:yyyy-MM-dd}"
                + "&DepartureTime=08:30:00&RideType=Solidarity");

        Assert.Equal(expected, Assert.Single(page.Items).Id);
    }

    [Fact]
    public async Task GetRides_FilteredByAClosedDateRange_KeepsBothEndsOfTheRange()
    {
        using ApiFactory factory = new();
        int driverId = SeedRides(factory, 3);
        DateOnly firstDay = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(1));
        DateOnly secondDay = firstDay.AddDays(1);

        PagedRides page = await GetPageAsync(
            factory, driverId, $"?DateFrom={firstDay:yyyy-MM-dd}&DateTo={secondDay:yyyy-MM-dd}");

        Assert.Equal(2, page.Total);
    }

    [Fact]
    public async Task GetRides_FilteredByOnlyTheStartDate_KeepsThatDayAlone()
    {
        using ApiFactory factory = new();
        int driverId = SeedRides(factory, 3);
        DateOnly thirdDay = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(3));

        PagedRides page = await GetPageAsync(factory, driverId, $"?DateFrom={thirdDay:yyyy-MM-dd}");

        Assert.Equal(1, page.Total);
    }

    [Fact]
    public async Task GetRides_FilteredByOnlyTheEndDate_KeepsThatDayAlone()
    {
        using ApiFactory factory = new();
        int driverId = SeedRides(factory, 3);
        DateOnly thirdDay = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(3));

        PagedRides page = await GetPageAsync(factory, driverId, $"?DateTo={thirdDay:yyyy-MM-dd}");

        Assert.Equal(1, page.Total);
    }

    [Fact]
    public async Task GetRides_WithoutAnyDate_KeepsEveryRide()
    {
        using ApiFactory factory = new();
        int driverId = SeedRides(factory, 3);

        PagedRides page = await GetPageAsync(factory, driverId);

        Assert.Equal(3, page.Total);
    }

    [Fact]
    public async Task GetRides_WithTheEndDateBeforeTheStartDate_IsRejected()
    {
        using ApiFactory factory = new();
        int driverId = SeedRides(factory, 3);
        DateOnly firstDay = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(1));
        DateOnly secondDay = firstDay.AddDays(1);

        HttpResponseMessage response = await RequestPageAsync(
            factory, driverId, $"?DateFrom={secondDay:yyyy-MM-dd}&DateTo={firstDay:yyyy-MM-dd}");

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        Assert.Contains(
            "anterior à data inicial",
            await response.Content.ReadAsStringAsync(),
            StringComparison.Ordinal);
    }

    [Fact]
    public async Task GetRides_FilteredByARangeStartingInThePast_DoesNotBringDepartedRides()
    {
        using ApiFactory factory = new();
        int driverId = factory.SeedUser("Ana Beatriz Nogueira").Id;
        DateOnly lastWeek = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(-7));
        DateOnly tomorrow = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(1));
        factory.SeedRide(driverId, lastWeek, new TimeOnly(8, 30));
        Guid upcoming = factory.SeedRide(driverId, tomorrow, new TimeOnly(8, 30));

        PagedRides page = await GetPageAsync(
            factory, driverId, $"?DateFrom={lastWeek:yyyy-MM-dd}&DateTo={tomorrow:yyyy-MM-dd}");

        Assert.Equal(upcoming, Assert.Single(page.Items).Id);
    }
}
