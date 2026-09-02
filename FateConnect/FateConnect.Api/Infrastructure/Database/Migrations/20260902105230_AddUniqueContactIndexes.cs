using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FateConnect.Api.Infrastructure.Database.Migrations
{
    public partial class AddUniqueContactIndexes : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(DuplicatedContactCleanup.Sql);

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
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Contacts_ContactEmail",
                table: "Contacts");

            migrationBuilder.DropIndex(
                name: "IX_Contacts_Phone",
                table: "Contacts");
        }
    }
}
