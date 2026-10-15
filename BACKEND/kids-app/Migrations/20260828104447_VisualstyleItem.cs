using Microsoft.EntityFrameworkCore.Migrations;
using MySql.EntityFrameworkCore.Metadata;

#nullable disable

namespace kids_app.Migrations
{
    /// <inheritdoc />
    public partial class VisualstyleItem : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<int>(
                name: "WorksheetCategoryId",
                table: "QuestionTypes",
                type: "int",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "int");

            migrationBuilder.CreateTable(
                name: "VisualStyleItems",
                columns: table => new
                {
                    VisualStyleItemId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySQL:ValueGenerationStrategy", MySQLValueGenerationStrategy.IdentityColumn),
                    VisualStyleId = table.Column<int>(type: "int", nullable: false),
                    ItemName = table.Column<string>(type: "varchar(100)", maxLength: 100, nullable: true),
                    Icon = table.Column<string>(type: "varchar(20)", maxLength: 20, nullable: true),
                    DisplayOrder = table.Column<int>(type: "int", nullable: false),
                    IsActive = table.Column<bool>(type: "tinyint(1)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_VisualStyleItems", x => x.VisualStyleItemId);
                    table.ForeignKey(
                        name: "FK_VisualStyleItems_VisualStyles_VisualStyleId",
                        column: x => x.VisualStyleId,
                        principalTable: "VisualStyles",
                        principalColumn: "VisualStyleId",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySQL:Charset", "utf8mb4");

            migrationBuilder.CreateIndex(
                name: "IX_VisualStyleItems_VisualStyleId_ItemName",
                table: "VisualStyleItems",
                columns: new[] { "VisualStyleId", "ItemName" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "VisualStyleItems");

            migrationBuilder.AlterColumn<int>(
                name: "WorksheetCategoryId",
                table: "QuestionTypes",
                type: "int",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "int",
                oldNullable: true);
        }
    }
}
