using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace kids_app.Migrations
{
    /// <inheritdoc />
    public partial class UpdatePreGeneratedWorksheetStructures : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_PreGeneratedWorksheets_Difficulties_DifficultyId",
                table: "PreGeneratedWorksheets");

            migrationBuilder.DropForeignKey(
                name: "FK_PreGeneratedWorksheets_LearningLevels_LevelId",
                table: "PreGeneratedWorksheets");

            migrationBuilder.DropForeignKey(
                name: "FK_PreGeneratedWorksheets_QuestionTypes_QuestionTypeId",
                table: "PreGeneratedWorksheets");

            migrationBuilder.DropIndex(
                name: "IX_PreGeneratedWorksheets_DifficultyId",
                table: "PreGeneratedWorksheets");

            migrationBuilder.DropIndex(
                name: "IX_PreGeneratedWorksheets_LevelId",
                table: "PreGeneratedWorksheets");

            migrationBuilder.DropIndex(
                name: "IX_PreGeneratedWorksheets_QuestionTypeId_LevelId_DifficultyId",
                table: "PreGeneratedWorksheets");

            migrationBuilder.DropColumn(
                name: "LevelId",
                table: "PreGeneratedWorksheets");

            migrationBuilder.DropColumn(
                name: "QuestionTypeId",
                table: "PreGeneratedWorksheets");

            migrationBuilder.RenameColumn(
                name: "SubjectId",
                table: "PreGeneratedWorksheets",
                newName: "TopicLevelConfigurationId");

            migrationBuilder.CreateIndex(
                name: "IX_PreGeneratedWorksheets_TopicLevelConfigurationId_DifficultyId",
                table: "PreGeneratedWorksheets",
                columns: new[] { "TopicLevelConfigurationId", "DifficultyId" });

            migrationBuilder.AddForeignKey(
                name: "FK_PreGeneratedWorksheets_TopicLevelDifficulties_TopicLevelConf~",
                table: "PreGeneratedWorksheets",
                columns: new[] { "TopicLevelConfigurationId", "DifficultyId" },
                principalTable: "TopicLevelDifficulties",
                principalColumns: new[] { "TopicLevelConfigurationId", "DifficultyId" },
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_PreGeneratedWorksheets_TopicLevelDifficulties_TopicLevelConf~",
                table: "PreGeneratedWorksheets");

            migrationBuilder.DropIndex(
                name: "IX_PreGeneratedWorksheets_TopicLevelConfigurationId_DifficultyId",
                table: "PreGeneratedWorksheets");

            migrationBuilder.RenameColumn(
                name: "TopicLevelConfigurationId",
                table: "PreGeneratedWorksheets",
                newName: "SubjectId");

            migrationBuilder.AddColumn<int>(
                name: "LevelId",
                table: "PreGeneratedWorksheets",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "QuestionTypeId",
                table: "PreGeneratedWorksheets",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateIndex(
                name: "IX_PreGeneratedWorksheets_DifficultyId",
                table: "PreGeneratedWorksheets",
                column: "DifficultyId");

            migrationBuilder.CreateIndex(
                name: "IX_PreGeneratedWorksheets_LevelId",
                table: "PreGeneratedWorksheets",
                column: "LevelId");

            migrationBuilder.CreateIndex(
                name: "IX_PreGeneratedWorksheets_QuestionTypeId_LevelId_DifficultyId",
                table: "PreGeneratedWorksheets",
                columns: new[] { "QuestionTypeId", "LevelId", "DifficultyId" });

            migrationBuilder.AddForeignKey(
                name: "FK_PreGeneratedWorksheets_Difficulties_DifficultyId",
                table: "PreGeneratedWorksheets",
                column: "DifficultyId",
                principalTable: "Difficulties",
                principalColumn: "DifficultyId",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_PreGeneratedWorksheets_LearningLevels_LevelId",
                table: "PreGeneratedWorksheets",
                column: "LevelId",
                principalTable: "LearningLevels",
                principalColumn: "LevelId",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_PreGeneratedWorksheets_QuestionTypes_QuestionTypeId",
                table: "PreGeneratedWorksheets",
                column: "QuestionTypeId",
                principalTable: "QuestionTypes",
                principalColumn: "QuestionTypeId",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
