using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Mojjo.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class Add_StockReservation_Index : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateIndex(
                name: "IX_StockReservations_Status_ExpiresAt",
                table: "StockReservations",
                columns: new[] { "Status", "ExpiresAt" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_StockReservations_Status_ExpiresAt",
                table: "StockReservations");
        }
    }
}
