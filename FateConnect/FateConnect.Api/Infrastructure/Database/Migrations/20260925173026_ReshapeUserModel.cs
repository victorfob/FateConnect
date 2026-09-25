using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace FateConnect.Api.Infrastructure.Database.Migrations
{
    public partial class ReshapeUserModel : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Phone",
                table: "Users",
                type: "character varying(11)",
                maxLength: 11,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ContactEmail",
                table: "Users",
                type: "character varying(150)",
                maxLength: 150,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Neighborhood",
                table: "Users",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "Status",
                table: "Users",
                type: "integer",
                nullable: false,
                defaultValue: 1);

            migrationBuilder.Sql("""
                UPDATE "Users" AS u
                SET "Phone" = c."Phone", "ContactEmail" = c."ContactEmail"
                FROM (
                    SELECT DISTINCT ON ("UserId") "UserId", "Phone", "ContactEmail"
                    FROM "Contacts"
                    ORDER BY "UserId", "Id"
                ) AS c
                WHERE c."UserId" = u."Id";
                """);

            migrationBuilder.CreateTable(
                name: "UserPreferences",
                columns: table => new
                {
                    UserId = table.Column<int>(type: "integer", nullable: false),
                    ReceiveEmails = table.Column<bool>(type: "boolean", nullable: false),
                    ReceiveNotifications = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserPreferences", x => x.UserId);
                    table.ForeignKey(
                        name: "FK_UserPreferences_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.Sql("""
                INSERT INTO "UserPreferences" ("UserId", "ReceiveEmails", "ReceiveNotifications")
                SELECT "Id", "ReceiveEmails", "ReceiveNotifications" FROM "Users";
                """);

            migrationBuilder.DropColumn(
                name: "ReceiveEmails",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "ReceiveNotifications",
                table: "Users");

            migrationBuilder.DropTable(
                name: "Contacts");

            migrationBuilder.CreateIndex(
                name: "IX_Users_ContactEmail",
                table: "Users",
                column: "ContactEmail",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Users_Phone",
                table: "Users",
                column: "Phone",
                unique: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "ReceiveEmails",
                table: "Users",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "ReceiveNotifications",
                table: "Users",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.Sql("""
                UPDATE "Users" AS u
                SET "ReceiveEmails" = p."ReceiveEmails", "ReceiveNotifications" = p."ReceiveNotifications"
                FROM "UserPreferences" AS p
                WHERE p."UserId" = u."Id";
                """);

            migrationBuilder.DropTable(
                name: "UserPreferences");

            migrationBuilder.CreateTable(
                name: "Contacts",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    UserId = table.Column<int>(type: "integer", nullable: false),
                    ContactEmail = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    Phone = table.Column<string>(type: "character varying(11)", maxLength: 11, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Contacts", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Contacts_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.Sql("""
                INSERT INTO "Contacts" ("UserId", "Phone", "ContactEmail")
                SELECT "Id", "Phone", "ContactEmail" FROM "Users"
                WHERE "Phone" IS NOT NULL AND "ContactEmail" IS NOT NULL
                ORDER BY "Id";
                """);

            migrationBuilder.CreateIndex(
                name: "IX_Contacts_ContactEmail",
                table: "Contacts",
                column: "ContactEmail",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Contacts_Phone",
                table: "Contacts",
                column: "Phone",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Contacts_UserId",
                table: "Contacts",
                column: "UserId");

            migrationBuilder.DropIndex(
                name: "IX_Users_ContactEmail",
                table: "Users");

            migrationBuilder.DropIndex(
                name: "IX_Users_Phone",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "Phone",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "ContactEmail",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "Neighborhood",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "Status",
                table: "Users");
        }
    }
}
