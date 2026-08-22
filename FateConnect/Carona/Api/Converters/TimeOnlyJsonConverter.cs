using System.Globalization;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace Api.Converters
{
    /// <summary>
    /// O conversor padrão de <see cref="TimeOnly"/> exige os segundos, e um
    /// campo de hora do navegador entrega <c>HH:mm</c>. Aceitar as duas formas
    /// mantém a limitação dentro da API, em vez de obrigar cada cliente a
    /// completar a hora antes de enviar.
    /// </summary>
    public class TimeOnlyJsonConverter : JsonConverter<TimeOnly>
    {
        private const string FormatoDeEscrita = "HH:mm:ss";

        private static readonly string[] FormatosAceitos =
        [
            "HH:mm:ss.FFFFFFF",
            "HH:mm:ss",
            "HH:mm",
        ];

        public override TimeOnly Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
        {
            string? valor = reader.GetString();

            if (TimeOnly.TryParseExact(valor, FormatosAceitos, CultureInfo.InvariantCulture, DateTimeStyles.None, out TimeOnly hora))
                return hora;

            throw new JsonException($"Hora inválida: '{valor}'. Use HH:mm ou HH:mm:ss.");
        }

        public override void Write(Utf8JsonWriter writer, TimeOnly value, JsonSerializerOptions options)
        {
            writer.WriteStringValue(value.ToString(FormatoDeEscrita, CultureInfo.InvariantCulture));
        }
    }
}
