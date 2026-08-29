namespace FateConnect.Api.Infrastructure.Converters;

using System.Globalization;
using System.Text.Json;
using System.Text.Json.Serialization;

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
        bool isInvalidTokenType = reader.TokenType != JsonTokenType.String;

        if (isInvalidTokenType)
        {
            throw new JsonException("Formato de hora inválido. Informe a hora como texto, no formato HH:mm ou HH:mm:ss.");
        }

        string? stringValue = reader.GetString();

        bool isValidTimeFormat = TimeOnly.TryParseExact(
            stringValue,
            AcceptedFormats,
            CultureInfo.InvariantCulture,
            DateTimeStyles.None,
            out TimeOnly time
        );

        if (isValidTimeFormat)
            return time;


        throw new JsonException($"Formato de hora inválido: '{stringValue}'. Informe a hora no formato HH:mm ou HH:mm:ss.");
    }

    public override void Write(Utf8JsonWriter writer, TimeOnly value, JsonSerializerOptions options)
    {
        writer.WriteStringValue(value.ToString(WriteFormat, CultureInfo.InvariantCulture));
    }
}
