using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FateConnect.Api.Infrastructure.Database.Migrations
{
    public partial class RenameRidesTableToPascalCase : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_rides_Users_DriverId",
                table: "rides");

            migrationBuilder.DropPrimaryKey(
                name: "PK_rides",
                table: "rides");

            migrationBuilder.RenameTable(
                name: "rides",
                newName: "Rides");

            migrationBuilder.RenameIndex(
                name: "IX_rides_DriverId",
                table: "Rides",
                newName: "IX_Rides_DriverId");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Rides",
                table: "Rides",
                column: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Rides_Users_DriverId",
                table: "Rides",
                column: "DriverId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Rides_Users_DriverId",
                table: "Rides");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Rides",
                table: "Rides");

            migrationBuilder.RenameTable(
                name: "Rides",
                newName: "rides");

            migrationBuilder.RenameIndex(
                name: "IX_Rides_DriverId",
                table: "rides",
                newName: "IX_rides_DriverId");

            migrationBuilder.AddPrimaryKey(
                name: "PK_rides",
                table: "rides",
                column: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_rides_Users_DriverId",
                table: "rides",
                column: "DriverId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
