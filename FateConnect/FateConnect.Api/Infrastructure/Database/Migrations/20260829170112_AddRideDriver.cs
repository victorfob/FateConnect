using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FateConnect.Api.Infrastructure.Database.Migrations
{
    /// <inheritdoc />
    public partial class AddRideDriver : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterDatabase()
                .Annotation("Npgsql:PostgresExtension:unaccent", ",,");

            migrationBuilder.Sql("DELETE FROM rides;");

            migrationBuilder.AddColumn<int>(
                name: "DriverId",
                table: "rides",
                type: "integer",
                nullable: false);

            migrationBuilder.CreateIndex(
                name: "IX_rides_DriverId",
                table: "rides",
                column: "DriverId");

            migrationBuilder.AddForeignKey(
                name: "FK_rides_Usuarios_DriverId",
                table: "rides",
                column: "DriverId",
                principalTable: "Usuarios",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_rides_Usuarios_DriverId",
                table: "rides");

            migrationBuilder.DropIndex(
                name: "IX_rides_DriverId",
                table: "rides");

            migrationBuilder.DropColumn(
                name: "DriverId",
                table: "rides");

            migrationBuilder.AlterDatabase()
                .OldAnnotation("Npgsql:PostgresExtension:unaccent", ",,");
        }
    }
}
