using System.Net;
using System.Net.Http.Json;
using FateConnect.Api.Tests.Fixtures;

namespace FateConnect.Api.Tests.Rides;

public class HolidayEndpointTests : IClassFixture<ApiFactory>
{
    private readonly ApiFactory _factory;

    public HolidayEndpointTests(ApiFactory factory)
    {
        _factory = factory;
    }

    [Fact]
    public async Task GetHolidays_ForAYear_AnswersTheSortedDates()
    {
        HttpClient client = _factory.CreateClientForNewUser("Mariana Alves Rocha");

        HttpResponseMessage response = await client.GetAsync("/Holidays?year=2026");

        string[]? holidays = await response.Content.ReadFromJsonAsync<string[]>();
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.NotNull(holidays);
        Assert.Equal(15, holidays.Length);
        Assert.Equal("2026-01-01", holidays[0]);
        Assert.Equal("2026-12-25", holidays[^1]);
    }

    [Theory]
    [InlineData("/Holidays")]
    [InlineData("/Holidays?year=1500")]
    [InlineData("/Holidays?year=dois-mil")]
    public async Task GetHolidays_WithoutAValidYear_IsRejected(string route)
    {
        HttpClient client = _factory.CreateClientForNewUser("Mariana Alves Rocha");

        HttpResponseMessage response = await client.GetAsync(route);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }
}
