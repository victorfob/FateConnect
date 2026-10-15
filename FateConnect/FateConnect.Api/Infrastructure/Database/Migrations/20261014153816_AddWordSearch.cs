using Microsoft.EntityFrameworkCore.Migrations;
using NpgsqlTypes;

#nullable disable

namespace FateConnect.Api.Infrastructure.Database.Migrations
{
    /// <inheritdoc />
    public partial class AddWordSearch : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("""
                CREATE TEXT SEARCH CONFIGURATION fateconnect (COPY = portuguese);
                ALTER TEXT SEARCH CONFIGURATION fateconnect
                    ALTER MAPPING FOR hword, hword_part, word WITH unaccent, portuguese_stem;
                """);

            migrationBuilder.AddColumn<NpgsqlTsVector>(
                name: "SearchVector",
                table: "Rides",
                type: "tsvector",
                nullable: true,
                computedColumnSql: "to_tsvector('fateconnect', coalesce(\"Destination\", '') || ' ' || coalesce(\"Description\", ''))",
                stored: true);

            migrationBuilder.AddColumn<NpgsqlTsVector>(
                name: "SearchVector",
                table: "Reports",
                type: "tsvector",
                nullable: true,
                computedColumnSql: "to_tsvector('fateconnect', coalesce(\"Description\", ''))",
                stored: true);

            migrationBuilder.AddColumn<NpgsqlTsVector>(
                name: "SearchVector",
                table: "LostAndFoundRecords",
                type: "tsvector",
                nullable: true,
                computedColumnSql: "to_tsvector('fateconnect', coalesce(\"Name\", '') || ' ' || coalesce(\"Description\", ''))",
                stored: true);

            migrationBuilder.CreateIndex(
                name: "IX_Rides_SearchVector",
                table: "Rides",
                column: "SearchVector")
                .Annotation("Npgsql:IndexMethod", "GIN");

            migrationBuilder.CreateIndex(
                name: "IX_Reports_SearchVector",
                table: "Reports",
                column: "SearchVector")
                .Annotation("Npgsql:IndexMethod", "GIN");

            migrationBuilder.CreateIndex(
                name: "IX_LostAndFoundRecords_SearchVector",
                table: "LostAndFoundRecords",
                column: "SearchVector")
                .Annotation("Npgsql:IndexMethod", "GIN");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Rides_SearchVector",
                table: "Rides");

            migrationBuilder.DropIndex(
                name: "IX_Reports_SearchVector",
                table: "Reports");

            migrationBuilder.DropIndex(
                name: "IX_LostAndFoundRecords_SearchVector",
                table: "LostAndFoundRecords");

            migrationBuilder.DropColumn(
                name: "SearchVector",
                table: "Rides");

            migrationBuilder.DropColumn(
                name: "SearchVector",
                table: "Reports");

            migrationBuilder.DropColumn(
                name: "SearchVector",
                table: "LostAndFoundRecords");

            migrationBuilder.Sql("DROP TEXT SEARCH CONFIGURATION fateconnect;");
        }
    }
}
