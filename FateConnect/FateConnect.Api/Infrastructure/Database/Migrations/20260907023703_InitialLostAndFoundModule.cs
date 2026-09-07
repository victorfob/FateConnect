using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FateConnect.Api.Infrastructure.Database.Migrations
{
    /// <inheritdoc />
    public partial class InitialLostAndFoundModule : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "LostAndFoundRecords",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    LostAndFoundType = table.Column<int>(type: "integer", nullable: false),
                    Place = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    OcurredOn = table.Column<DateOnly>(type: "date", nullable: false),
                    Description = table.Column<string>(type: "character varying(300)", maxLength: 300, nullable: false),
                    ImageUrl = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    Status = table.Column<int>(type: "integer", nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    UserId = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LostAndFoundRecords", x => x.Id);
                    table.ForeignKey(
                        name: "FK_LostAndFoundRecords_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_LostAndFoundRecords_UserId",
                table: "LostAndFoundRecords",
                column: "UserId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "LostAndFoundRecords");
        }
    }
}
