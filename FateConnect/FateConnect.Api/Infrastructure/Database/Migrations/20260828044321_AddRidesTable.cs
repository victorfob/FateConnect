using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FateConnect.Api.Infrastructure.Database.Migrations;

/// <inheritdoc />
public partial class AddRidesTable : Migration
{
    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropTable(
            name: "caronas"
        );

        migrationBuilder.CreateTable(
            name: "rides",
            columns: table => new
            {
                Id = table.Column<Guid>(type: "uuid", nullable: false),
                AvailableSeats = table.Column<int>(type: "integer", nullable: false),
                Destination = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                DepartureDate = table.Column<DateOnly>(type: "date", nullable: false),
                DepartureTime = table.Column<TimeOnly>(type: "time without time zone", nullable: false),
                CreatedAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                RideType = table.Column<int>(type: "integer", nullable: false),
                Description = table.Column<string>(type: "character varying(300)", maxLength: 300, nullable: true),
                IsActive = table.Column<bool>(type: "boolean", nullable: false)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_rides", x => x.Id);
            }
        );
    }

    /// <inheritdoc />
    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropTable(
            name: "rides");
    }
}

