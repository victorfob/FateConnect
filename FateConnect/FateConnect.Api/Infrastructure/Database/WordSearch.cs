namespace FateConnect.Api.Infrastructure.Database;

using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using NpgsqlTypes;

public static class WordSearch
{
    public const string Configuration = "fateconnect";
    public const string VectorProperty = "SearchVector";

    public static void HasWordSearch<T>(this EntityTypeBuilder<T> builder, params string[] columns)
        where T : class
    {
        string text = string.Join(" || ' ' || ", columns.Select(column => $"""coalesce("{column}", '')"""));

        builder.Property<NpgsqlTsVector>(VectorProperty)
               .HasComputedColumnSql($"to_tsvector('{Configuration}', {text})", stored: true);

        builder.HasIndex(VectorProperty)
               .HasMethod("GIN");
    }
}
