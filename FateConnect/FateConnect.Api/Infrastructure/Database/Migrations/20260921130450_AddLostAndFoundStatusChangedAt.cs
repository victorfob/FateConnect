using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FateConnect.Api.Infrastructure.Database.Migrations
{
    public partial class AddLostAndFoundStatusChangedAt : Migration
    {
        private const string ResolvedAndDeletedStatuses = "(2, 3)";

        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "StatusChangedAt",
                table: "LostAndFoundRecords",
                type: "timestamp without time zone",
                nullable: true);

            migrationBuilder.Sql($"""
                UPDATE "LostAndFoundRecords"
                SET "StatusChangedAt" = COALESCE("UpdatedAt", "CreatedAt")
                WHERE "Status" IN {ResolvedAndDeletedStatuses};
                """);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "StatusChangedAt",
                table: "LostAndFoundRecords");
        }
    }
}
