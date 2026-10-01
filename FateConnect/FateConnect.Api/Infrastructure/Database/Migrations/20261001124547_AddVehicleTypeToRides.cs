using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FateConnect.Api.Infrastructure.Database.Migrations
{
    /// <inheritdoc />
    public partial class AddVehicleTypeToRides : Migration
    {
        private const int ExistingRidesVehicleCar = 1;

        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "VehicleType",
                table: "Rides",
                type: "integer",
                nullable: false,
                defaultValue: ExistingRidesVehicleCar);

            migrationBuilder.Sql("ALTER TABLE \"Rides\" ALTER COLUMN \"VehicleType\" DROP DEFAULT;");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "VehicleType",
                table: "Rides");
        }
    }
}
