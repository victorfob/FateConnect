namespace FateConnect.Api.Infrastructure.Converters;

using System.Globalization;
using System.Text.Json;
using System.Text.Json.Serialization;

/// <summary>
/// The default <see cref="TimeOnly"/> converter requires seconds, whereas browser
/// time inputs send <c>HH:mm</c>. Accepting both formats keeps formatting tolerance
/// inside the API without forcing every client to append seconds before sending.
/// </summary>
public class TimeOnlyJsonConverter : JsonConverter<TimeOnly>
{
    private const string WriteFormat = "HH:mm:ss";

    private static readonly string[] AcceptedFormats =
    [
        "HH:mm:ss.FFFFFFF",
        "HH:mm:ss",
        "HH:mm"
    ];

    public override TimeOnly Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
    {
        string? stringValue = reader.GetString();

        if (TimeOnly.TryParseExact(stringValue, AcceptedFormats, CultureInfo.InvariantCulture, DateTimeStyles.None, out TimeOnly time))
        {
            return time;
        }

        throw new JsonException($"Invalid time format: '{stringValue}'. Expected HH:mm or HH:mm:ss.");
    }

    public override void Write(Utf8JsonWriter writer, TimeOnly value, JsonSerializerOptions options)
    {
        writer.WriteStringValue(value.ToString(WriteFormat, CultureInfo.InvariantCulture));
    }
}
