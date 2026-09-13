using System.Text.Json;

namespace FateConnect.Api.Tests;

public class FilterContractTests(ApiFactory factory) : IClassFixture<ApiFactory>
{
    private readonly ApiFactory _factory = factory;

    private static readonly string[] BoundParameters = ["DateFrom", "DateTo", "Page", "PageSize"];

    private static readonly string[] DerivedParameters =
    [
        "EffectiveDateFrom",
        "EffectiveDateTo",
        "EffectivePage",
        "EffectivePageSize",
        "ItemsToSkip",
    ];

    private async Task<IReadOnlyList<string>> QueryParameterNamesAsync(string path)
    {
        string json = await _factory.CreateClient().GetStringAsync("/swagger/v1/swagger.json");

        using JsonDocument document = JsonDocument.Parse(json);

        return
        [
            .. document.RootElement
                .GetProperty("paths")
                .GetProperty(path)
                .GetProperty("get")
                .GetProperty("parameters")
                .EnumerateArray()
                .Select(parameter => parameter.GetProperty("name").GetString() ?? string.Empty),
        ];
    }

    [Theory]
    [InlineData("/Rides")]
    [InlineData("/LostAndFound")]
    public async Task ListEndpoints_PublishTheBoundFilterParameters(string path)
    {
        IReadOnlyList<string> names = await QueryParameterNamesAsync(path);

        Assert.All(BoundParameters, parameter => Assert.Contains(parameter, names));
    }

    [Theory]
    [InlineData("/Rides")]
    [InlineData("/LostAndFound")]
    public async Task ListEndpoints_DoNotPublishTheDerivedFilterProperties(string path)
    {
        IReadOnlyList<string> names = await QueryParameterNamesAsync(path);

        Assert.All(DerivedParameters, parameter => Assert.DoesNotContain(parameter, names));
    }
}
