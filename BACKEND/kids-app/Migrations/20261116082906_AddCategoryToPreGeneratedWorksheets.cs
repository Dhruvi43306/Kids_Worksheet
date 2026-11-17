
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace kids_app.Migrations
{
    public partial class AddCategoryToPreGeneratedWorksheets : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // IMPORTANT:
            // WorksheetCategoryId already exists in MySQL.
            // Both indexes were also successfully created.
            // Therefore, do not add the column or indexes again.

            // Make the existing column nullable and remove
            // the default value of 0.

            migrationBuilder.AlterColumn<int>(
                name: "WorksheetCategoryId",
                table: "PreGeneratedWorksheets",
                type: "int",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "int",
                oldDefaultValue: 0);

            // Existing worksheets received category ID 0
            // when the column was initially created.
            // Zero is not a valid category, so preserve
            // those worksheets as unassigned (NULL).

            migrationBuilder.Sql(
                "UPDATE `PreGeneratedWorksheets` " +
                "SET `WorksheetCategoryId` = NULL " +
                "WHERE `WorksheetCategoryId` = 0;");

            // Add the category foreign key.
            // The category index already exists.

            migrationBuilder.AddForeignKey(
                name: "FK_PreGeneratedWorksheets_worksheetCategories_WorksheetCategory~",
                table: "PreGeneratedWorksheets",
                column: "WorksheetCategoryId",
                principalTable: "worksheetCategories",
                principalColumn: "WorksheetCategoryId",
                onDelete: ReferentialAction.Restrict);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_PreGeneratedWorksheets_worksheetCategories_WorksheetCategory~",
                table: "PreGeneratedWorksheets");

            // These indexes were created by this migration's
            // original partial execution.

            migrationBuilder.DropIndex(
                name: "IX_PreGeneratedWorksheets_TopicLevelConfigurationId_DifficultyI~",
                table: "PreGeneratedWorksheets");

            migrationBuilder.DropIndex(
                name: "IX_PreGeneratedWorksheets_WorksheetCategoryId",
                table: "PreGeneratedWorksheets");

            migrationBuilder.DropColumn(
                name: "WorksheetCategoryId",
                table: "PreGeneratedWorksheets");

            // Do not recreate the original two-column index.
            // It was never dropped.
        }
    }
}
