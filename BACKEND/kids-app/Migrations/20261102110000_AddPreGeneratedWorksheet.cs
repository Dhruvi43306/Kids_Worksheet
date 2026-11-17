using System;
using Microsoft.EntityFrameworkCore.Migrations;
using MySql.EntityFrameworkCore.Metadata;

#nullable disable

namespace kids_app.Migrations
{
    /// <inheritdoc />
    public partial class AddPreGeneratedWorksheet : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "PreGeneratedWorksheets",
                columns: table => new
                {
                    PreGeneratedWorksheetId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySQL:ValueGenerationStrategy", MySQLValueGenerationStrategy.IdentityColumn),
                    QuestionTypeId = table.Column<int>(type: "int", nullable: false),
                    LevelId = table.Column<int>(type: "int", nullable: false),
                    DifficultyId = table.Column<int>(type: "int", nullable: false),
                    WorksheetTitle = table.Column<string>(type: "varchar(200)", maxLength: 200, nullable: false),
                    WorksheetUrl = table.Column<string>(type: "varchar(2000)", maxLength: 2000, nullable: false),
                    ThumbnailUrl = table.Column<string>(type: "varchar(2000)", maxLength: 2000, nullable: true),
                    FileType = table.Column<string>(type: "varchar(10)", maxLength: 10, nullable: false),
                    DisplayOrder = table.Column<int>(type: "int", nullable: false, defaultValue: 0),
                    IsActive = table.Column<bool>(type: "tinyint(1)", nullable: false, defaultValue: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PreGeneratedWorksheets", x => x.PreGeneratedWorksheetId);

                    table.ForeignKey(
                        name: "FK_PreGeneratedWorksheets_QuestionTypes_QuestionTypeId",
                        column: x => x.QuestionTypeId,
                        principalTable: "QuestionTypes",
                        principalColumn: "QuestionTypeId",
                        onDelete: ReferentialAction.Restrict);

                    table.ForeignKey(
                        name: "FK_PreGeneratedWorksheets_LearningLevels_LevelId",
                        column: x => x.LevelId,
                        principalTable: "LearningLevels",
                        principalColumn: "LevelId",
                        onDelete: ReferentialAction.Restrict);

                    table.ForeignKey(
                        name: "FK_PreGeneratedWorksheets_Difficulties_DifficultyId",
                        column: x => x.DifficultyId,
                        principalTable: "Difficulties",
                        principalColumn: "DifficultyId",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_PreGeneratedWorksheets_QuestionTypeId_LevelId_DifficultyId",
                table: "PreGeneratedWorksheets",
                columns: new[] { "QuestionTypeId", "LevelId", "DifficultyId" });

            migrationBuilder.CreateIndex(
                name: "IX_PreGeneratedWorksheets_IsActive",
                table: "PreGeneratedWorksheets",
                column: "IsActive");

            migrationBuilder.CreateIndex(
                name: "IX_PreGeneratedWorksheets_DisplayOrder",
                table: "PreGeneratedWorksheets",
                column: "DisplayOrder");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "PreGeneratedWorksheets");
        }
    }
}
