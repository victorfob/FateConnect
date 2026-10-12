using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FateConnect.Api.Infrastructure.Database.Migrations
{
    /// <inheritdoc />
    public partial class RenameOccurredOn : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "OcurredOn",
                table: "LostAndFoundRecords",
                newName: "OccurredOn");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "OccurredOn",
                table: "LostAndFoundRecords",
                newName: "OcurredOn");
        }
    }
}
