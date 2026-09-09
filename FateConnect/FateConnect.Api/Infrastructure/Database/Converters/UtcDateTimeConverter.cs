namespace FateConnect.Api.Infrastructure.Database.Converters;

using Microsoft.EntityFrameworkCore.Storage.ValueConversion;

public class UtcDateTimeConverter() : ValueConverter<DateTime, DateTime>(
    stored => stored,
    read => DateTime.SpecifyKind(read, DateTimeKind.Utc));

public class NullableUtcDateTimeConverter() : ValueConverter<DateTime?, DateTime?>(
    stored => stored,
    read => read.HasValue ? DateTime.SpecifyKind(read.Value, DateTimeKind.Utc) : null);
