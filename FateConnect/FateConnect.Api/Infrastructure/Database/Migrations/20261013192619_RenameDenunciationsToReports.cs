using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FateConnect.Api.Infrastructure.Database.Migrations
{
    /// <inheritdoc />
    public partial class RenameDenunciationsToReports : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameTable(
                name: "Denunciations",
                newName: "Reports");

            migrationBuilder.Sql("""ALTER TABLE "Reports" RENAME CONSTRAINT "PK_Denunciations" TO "PK_Reports";""");
            migrationBuilder.Sql(
                """ALTER TABLE "Reports" RENAME CONSTRAINT "FK_Denunciations_Users_UserId" TO "FK_Reports_Users_UserId";""");

            migrationBuilder.RenameIndex(
                name: "IX_Denunciations_UserId",
                table: "Reports",
                newName: "IX_Reports_UserId");

            migrationBuilder.Sql("""
                UPDATE "Reports"
                SET "ImageUrl" = regexp_replace("ImageUrl", '^uploads/denunciation/', 'uploads/report/')
                WHERE "ImageUrl" LIKE 'uploads/denunciation/%';
                """);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("""
                UPDATE "Reports"
                SET "ImageUrl" = regexp_replace("ImageUrl", '^uploads/report/', 'uploads/denunciation/')
                WHERE "ImageUrl" LIKE 'uploads/report/%';
                """);

            migrationBuilder.RenameIndex(
                name: "IX_Reports_UserId",
                table: "Reports",
                newName: "IX_Denunciations_UserId");

            migrationBuilder.Sql(
                """ALTER TABLE "Reports" RENAME CONSTRAINT "FK_Reports_Users_UserId" TO "FK_Denunciations_Users_UserId";""");
            migrationBuilder.Sql("""ALTER TABLE "Reports" RENAME CONSTRAINT "PK_Reports" TO "PK_Denunciations";""");

            migrationBuilder.RenameTable(
                name: "Reports",
                newName: "Denunciations");
        }
    }
}
