using System.Text.Json;
using FateConnect.Api.Infrastructure.Converters;

namespace FateConnect.Api.Tests;

public class TimeOnlyJsonConverterTests
{
    private static readonly JsonSerializerOptions Options = BuildOptions();

    private static JsonSerializerOptions BuildOptions()
    {
        JsonSerializerOptions options = new();
        options.Converters.Add(new TimeOnlyJsonConverter());

        return options;
    }

    [Theory]
    [InlineData("\"08:30\"", 8, 30, 0)]
    [InlineData("\"08:30:45\"", 8, 30, 45)]
    [InlineData("\"08:30:45.1234567\"", 8, 30, 45)]
    public void Read_WithAnAcceptedFormat_ReturnsTheTime(string json, int hour, int minute, int second)
    {
        TimeOnly time = JsonSerializer.Deserialize<TimeOnly>(json, Options);

        Assert.Equal(hour, time.Hour);
        Assert.Equal(minute, time.Minute);
        Assert.Equal(second, time.Second);
    }

    [Fact]
    public void Read_WithANonStringToken_AsksForTextInPortuguese()
    {
        JsonException exception = Assert.Throws<JsonException>(
            () => JsonSerializer.Deserialize<TimeOnly>("830", Options));

        Assert.Contains(
            "Formato de hora inválido. Informe a hora como texto, no formato HH:mm ou HH:mm:ss.",
            exception.Message,
            StringComparison.Ordinal);
    }

    [Fact]
    public void Read_WithAnUnparseableString_NamesTheValueInPortuguese()
    {
        JsonException exception = Assert.Throws<JsonException>(
            () => JsonSerializer.Deserialize<TimeOnly>("\"25:99\"", Options));

        Assert.Contains(
            "Formato de hora inválido: '25:99'. Informe a hora no formato HH:mm ou HH:mm:ss.",
            exception.Message,
            StringComparison.Ordinal);
    }

    [Fact]
    public void Write_SerializesTheTimeWithSeconds()
    {
        string json = JsonSerializer.Serialize(new TimeOnly(8, 30), Options);

        Assert.Equal("\"08:30:00\"", json);
    }
}
