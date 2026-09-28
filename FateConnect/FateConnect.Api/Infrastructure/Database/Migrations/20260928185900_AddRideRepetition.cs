using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FateConnect.Api.Infrastructure.Database.Migrations
{
    public partial class AddRideRepetition : Migration
    {
            protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "Frequency",
                table: "Rides",
                type: "integer",
                nullable: false,
                defaultValue: 1);

            migrationBuilder.AddColumn<DateOnly>(
                name: "RepeatUntil",
                table: "Rides",
                type: "date",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "RideDepartures",
                columns: table => new
                {
                    RideId = table.Column<Guid>(type: "uuid", nullable: false),
                    Date = table.Column<DateOnly>(type: "date", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RideDepartures", x => new { x.RideId, x.Date });
                    table.ForeignKey(
                        name: "FK_RideDepartures_Rides_RideId",
                        column: x => x.RideId,
                        principalTable: "Rides",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.Sql(
                """
                INSERT INTO "RideDepartures" ("RideId", "Date")
                SELECT "Id", "DepartureDate" FROM "Rides";
                """);
        }

            protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "RideDepartures");

            migrationBuilder.DropColumn(
                name: "Frequency",
                table: "Rides");

            migrationBuilder.DropColumn(
                name: "RepeatUntil",
                table: "Rides");
        }
    }
}
