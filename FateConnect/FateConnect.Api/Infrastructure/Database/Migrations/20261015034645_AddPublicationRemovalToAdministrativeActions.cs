using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FateConnect.Api.Infrastructure.Database.Migrations
{
    /// <inheritdoc />
    public partial class AddPublicationRemovalToAdministrativeActions : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "PublicationId",
                table: "AdministrativeActions",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "RemovalReason",
                table: "AdministrativeActions",
                type: "integer",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "PublicationId",
                table: "AdministrativeActions");

            migrationBuilder.DropColumn(
                name: "RemovalReason",
                table: "AdministrativeActions");
        }
    }
}
