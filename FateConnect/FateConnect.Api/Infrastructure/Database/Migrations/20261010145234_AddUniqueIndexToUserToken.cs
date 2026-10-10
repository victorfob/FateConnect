using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FateConnect.Api.Infrastructure.Database.Migrations
{
    /// <inheritdoc />
    public partial class AddUniqueIndexToUserToken : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateIndex(
                name: "IX_UserTokens_Token",
                table: "UserTokens",
                column: "Token",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_UserTokens_Token",
                table: "UserTokens");
        }
    }
}
