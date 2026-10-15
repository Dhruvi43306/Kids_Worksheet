using System;
using Microsoft.EntityFrameworkCore.Migrations;
using MySql.EntityFrameworkCore.Metadata;

#nullable disable

namespace kids_app.Migrations
{
    /// <inheritdoc />
    public partial class alltables : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<string>(
                name: "slug",
                table: "Subjects",
                type: "varchar(255)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "longtext");

            migrationBuilder.CreateTable(
                name: "Difficulties",
                columns: table => new
                {
                    DifficultyId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySQL:ValueGenerationStrategy", MySQLValueGenerationStrategy.IdentityColumn),
                    Name = table.Column<string>(type: "varchar(255)", nullable: false),
                    DisplayOrder = table.Column<int>(type: "int", nullable: false),
                    IsActive = table.Column<bool>(type: "tinyint(1)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Difficulties", x => x.DifficultyId);
                })
                .Annotation("MySQL:Charset", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "LearningLevels",
                columns: table => new
                {
                    LevelId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySQL:ValueGenerationStrategy", MySQLValueGenerationStrategy.IdentityColumn),
                    LevelName = table.Column<string>(type: "varchar(255)", nullable: false),
                    Description = table.Column<string>(type: "longtext", nullable: true),
                    MinAge = table.Column<int>(type: "int", nullable: true),
                    MaxAge = table.Column<int>(type: "int", nullable: true),
                    DisplayOrder = table.Column<int>(type: "int", nullable: false),
                    IsActive = table.Column<bool>(type: "tinyint(1)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LearningLevels", x => x.LevelId);
                })
                .Annotation("MySQL:Charset", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "QuestionTemplates",
                columns: table => new
                {
                    QuestionTemplateId = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("MySQL:ValueGenerationStrategy", MySQLValueGenerationStrategy.IdentityColumn),
                    TopicId = table.Column<int>(type: "int", nullable: false),
                    QuestionTypeId = table.Column<int>(type: "int", nullable: false),
                    TemplateName = table.Column<string>(type: "longtext", nullable: false),
                    TemplateText = table.Column<string>(type: "longtext", nullable: true),
                    TemplateDataJson = table.Column<string>(type: "longtext", nullable: true),
                    IsActive = table.Column<bool>(type: "tinyint(1)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_QuestionTemplates", x => x.QuestionTemplateId);
                })
                .Annotation("MySQL:Charset", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "QuestionTypes",
                columns: table => new
                {
                    QuestionTypeId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySQL:ValueGenerationStrategy", MySQLValueGenerationStrategy.IdentityColumn),
                    TypeName = table.Column<string>(type: "longtext", nullable: false),
                    Code = table.Column<string>(type: "varchar(255)", nullable: false),
                    Description = table.Column<string>(type: "longtext", nullable: true),
                    IsActive = table.Column<bool>(type: "tinyint(1)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_QuestionTypes", x => x.QuestionTypeId);
                })
                .Annotation("MySQL:Charset", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "VisualStyles",
                columns: table => new
                {
                    VisualStyleId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySQL:ValueGenerationStrategy", MySQLValueGenerationStrategy.IdentityColumn),
                    Name = table.Column<string>(type: "varchar(255)", nullable: false),
                    Icon = table.Column<string>(type: "longtext", nullable: true),
                    Description = table.Column<string>(type: "longtext", nullable: true),
                    IsActive = table.Column<bool>(type: "tinyint(1)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_VisualStyles", x => x.VisualStyleId);
                })
                .Annotation("MySQL:Charset", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "WorksheetTopics",
                columns: table => new
                {
                    TopicId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySQL:ValueGenerationStrategy", MySQLValueGenerationStrategy.IdentityColumn),
                    SubjectId = table.Column<int>(type: "int", nullable: false),
                    TopicName = table.Column<string>(type: "longtext", nullable: false),
                    Slug = table.Column<string>(type: "varchar(255)", nullable: false),
                    Description = table.Column<string>(type: "longtext", nullable: true),
                    IsActive = table.Column<bool>(type: "tinyint(1)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_WorksheetTopics", x => x.TopicId);
                    table.ForeignKey(
                        name: "FK_WorksheetTopics_Subjects_SubjectId",
                        column: x => x.SubjectId,
                        principalTable: "Subjects",
                        principalColumn: "SubjectId",
                        onDelete: ReferentialAction.Restrict);
                })
                .Annotation("MySQL:Charset", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "GeneratedWorksheets",
                columns: table => new
                {
                    GeneratedWorksheetId = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("MySQL:ValueGenerationStrategy", MySQLValueGenerationStrategy.IdentityColumn),
                    TopicId = table.Column<int>(type: "int", nullable: false),
                    LevelId = table.Column<int>(type: "int", nullable: false),
                    DifficultyId = table.Column<int>(type: "int", nullable: false),
                    VisualStyleId = table.Column<int>(type: "int", nullable: true),
                    QuestionCount = table.Column<int>(type: "int", nullable: false),
                    WorksheetTitle = table.Column<string>(type: "longtext", nullable: false),
                    SchoolName = table.Column<string>(type: "longtext", nullable: true),
                    StudentName = table.Column<string>(type: "longtext", nullable: true),
                    GradeName = table.Column<string>(type: "longtext", nullable: true),
                    Section = table.Column<string>(type: "longtext", nullable: true),
                    TeacherName = table.Column<string>(type: "longtext", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_GeneratedWorksheets", x => x.GeneratedWorksheetId);
                    table.ForeignKey(
                        name: "FK_GeneratedWorksheets_Difficulties_DifficultyId",
                        column: x => x.DifficultyId,
                        principalTable: "Difficulties",
                        principalColumn: "DifficultyId",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_GeneratedWorksheets_LearningLevels_LevelId",
                        column: x => x.LevelId,
                        principalTable: "LearningLevels",
                        principalColumn: "LevelId",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_GeneratedWorksheets_VisualStyles_VisualStyleId",
                        column: x => x.VisualStyleId,
                        principalTable: "VisualStyles",
                        principalColumn: "VisualStyleId");
                    table.ForeignKey(
                        name: "FK_GeneratedWorksheets_WorksheetTopics_TopicId",
                        column: x => x.TopicId,
                        principalTable: "WorksheetTopics",
                        principalColumn: "TopicId",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySQL:Charset", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "TopicLevelConfigurations",
                columns: table => new
                {
                    TopicLevelConfigurationId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySQL:ValueGenerationStrategy", MySQLValueGenerationStrategy.IdentityColumn),
                    TopicId = table.Column<int>(type: "int", nullable: false),
                    LevelId = table.Column<int>(type: "int", nullable: false),
                    MinNumber = table.Column<int>(type: "int", nullable: true),
                    MaxNumber = table.Column<int>(type: "int", nullable: true),
                    IsActive = table.Column<bool>(type: "tinyint(1)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TopicLevelConfigurations", x => x.TopicLevelConfigurationId);
                    table.ForeignKey(
                        name: "FK_TopicLevelConfigurations_LearningLevels_LevelId",
                        column: x => x.LevelId,
                        principalTable: "LearningLevels",
                        principalColumn: "LevelId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_TopicLevelConfigurations_WorksheetTopics_TopicId",
                        column: x => x.TopicId,
                        principalTable: "WorksheetTopics",
                        principalColumn: "TopicId",
                        onDelete: ReferentialAction.Restrict);
                })
                .Annotation("MySQL:Charset", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "GeneratedQuestions",
                columns: table => new
                {
                    GeneratedQuestionId = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("MySQL:ValueGenerationStrategy", MySQLValueGenerationStrategy.IdentityColumn),
                    GeneratedWorksheetId = table.Column<long>(type: "bigint", nullable: false),
                    QuestionNumber = table.Column<int>(type: "int", nullable: false),
                    QuestionTypeId = table.Column<int>(type: "int", nullable: false),
                    QuestionText = table.Column<string>(type: "longtext", nullable: false),
                    QuestionDataJson = table.Column<string>(type: "longtext", nullable: true),
                    CorrectAnswer = table.Column<string>(type: "longtext", nullable: false),
                    Marks = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_GeneratedQuestions", x => x.GeneratedQuestionId);
                    table.ForeignKey(
                        name: "FK_GeneratedQuestions_GeneratedWorksheets_GeneratedWorksheetId",
                        column: x => x.GeneratedWorksheetId,
                        principalTable: "GeneratedWorksheets",
                        principalColumn: "GeneratedWorksheetId",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_GeneratedQuestions_QuestionTypes_QuestionTypeId",
                        column: x => x.QuestionTypeId,
                        principalTable: "QuestionTypes",
                        principalColumn: "QuestionTypeId",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySQL:Charset", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "QuestionCountOptions",
                columns: table => new
                {
                    QuestionCountOptionId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySQL:ValueGenerationStrategy", MySQLValueGenerationStrategy.IdentityColumn),
                    TopicLevelConfigurationId = table.Column<int>(type: "int", nullable: false),
                    QuestionCount = table.Column<int>(type: "int", nullable: false),
                    IsActive = table.Column<bool>(type: "tinyint(1)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_QuestionCountOptions", x => x.QuestionCountOptionId);
                    table.ForeignKey(
                        name: "FK_QuestionCountOptions_TopicLevelConfigurations_TopicLevelConf~",
                        column: x => x.TopicLevelConfigurationId,
                        principalTable: "TopicLevelConfigurations",
                        principalColumn: "TopicLevelConfigurationId",
                        onDelete: ReferentialAction.Restrict);
                })
                .Annotation("MySQL:Charset", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "TopicLevelDifficulties",
                columns: table => new
                {
                    TopicLevelConfigurationId = table.Column<int>(type: "int", nullable: false),
                    DifficultyId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TopicLevelDifficulties", x => new { x.TopicLevelConfigurationId, x.DifficultyId });
                    table.ForeignKey(
                        name: "FK_TopicLevelDifficulties_Difficulties_DifficultyId",
                        column: x => x.DifficultyId,
                        principalTable: "Difficulties",
                        principalColumn: "DifficultyId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_TopicLevelDifficulties_TopicLevelConfigurations_TopicLevelCo~",
                        column: x => x.TopicLevelConfigurationId,
                        principalTable: "TopicLevelConfigurations",
                        principalColumn: "TopicLevelConfigurationId",
                        onDelete: ReferentialAction.Restrict);
                })
                .Annotation("MySQL:Charset", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "TopicLevelQuestionTypes",
                columns: table => new
                {
                    TopicLevelConfigurationId = table.Column<int>(type: "int", nullable: false),
                    QuestionTypeId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TopicLevelQuestionTypes", x => new { x.TopicLevelConfigurationId, x.QuestionTypeId });
                    table.ForeignKey(
                        name: "FK_TopicLevelQuestionTypes_QuestionTypes_QuestionTypeId",
                        column: x => x.QuestionTypeId,
                        principalTable: "QuestionTypes",
                        principalColumn: "QuestionTypeId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_TopicLevelQuestionTypes_TopicLevelConfigurations_TopicLevelC~",
                        column: x => x.TopicLevelConfigurationId,
                        principalTable: "TopicLevelConfigurations",
                        principalColumn: "TopicLevelConfigurationId",
                        onDelete: ReferentialAction.Restrict);
                })
                .Annotation("MySQL:Charset", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "TopicLevelVisualStyles",
                columns: table => new
                {
                    TopicLevelConfigurationId = table.Column<int>(type: "int", nullable: false),
                    VisualStyleId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TopicLevelVisualStyles", x => new { x.TopicLevelConfigurationId, x.VisualStyleId });
                    table.ForeignKey(
                        name: "FK_TopicLevelVisualStyles_TopicLevelConfigurations_TopicLevelCo~",
                        column: x => x.TopicLevelConfigurationId,
                        principalTable: "TopicLevelConfigurations",
                        principalColumn: "TopicLevelConfigurationId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_TopicLevelVisualStyles_VisualStyles_VisualStyleId",
                        column: x => x.VisualStyleId,
                        principalTable: "VisualStyles",
                        principalColumn: "VisualStyleId",
                        onDelete: ReferentialAction.Restrict);
                })
                .Annotation("MySQL:Charset", "utf8mb4");

            migrationBuilder.CreateIndex(
                name: "IX_Subjects_slug",
                table: "Subjects",
                column: "slug",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Difficulties_Name",
                table: "Difficulties",
                column: "Name",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_GeneratedQuestions_GeneratedWorksheetId",
                table: "GeneratedQuestions",
                column: "GeneratedWorksheetId");

            migrationBuilder.CreateIndex(
                name: "IX_GeneratedQuestions_QuestionTypeId",
                table: "GeneratedQuestions",
                column: "QuestionTypeId");

            migrationBuilder.CreateIndex(
                name: "IX_GeneratedWorksheets_DifficultyId",
                table: "GeneratedWorksheets",
                column: "DifficultyId");

            migrationBuilder.CreateIndex(
                name: "IX_GeneratedWorksheets_LevelId",
                table: "GeneratedWorksheets",
                column: "LevelId");

            migrationBuilder.CreateIndex(
                name: "IX_GeneratedWorksheets_TopicId",
                table: "GeneratedWorksheets",
                column: "TopicId");

            migrationBuilder.CreateIndex(
                name: "IX_GeneratedWorksheets_VisualStyleId",
                table: "GeneratedWorksheets",
                column: "VisualStyleId");

            migrationBuilder.CreateIndex(
                name: "IX_LearningLevels_LevelName",
                table: "LearningLevels",
                column: "LevelName",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_QuestionCountOptions_TopicLevelConfigurationId_QuestionCount",
                table: "QuestionCountOptions",
                columns: new[] { "TopicLevelConfigurationId", "QuestionCount" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_QuestionTypes_Code",
                table: "QuestionTypes",
                column: "Code",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_TopicLevelConfigurations_LevelId",
                table: "TopicLevelConfigurations",
                column: "LevelId");

            migrationBuilder.CreateIndex(
                name: "IX_TopicLevelConfigurations_TopicId_LevelId",
                table: "TopicLevelConfigurations",
                columns: new[] { "TopicId", "LevelId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_TopicLevelDifficulties_DifficultyId",
                table: "TopicLevelDifficulties",
                column: "DifficultyId");

            migrationBuilder.CreateIndex(
                name: "IX_TopicLevelQuestionTypes_QuestionTypeId",
                table: "TopicLevelQuestionTypes",
                column: "QuestionTypeId");

            migrationBuilder.CreateIndex(
                name: "IX_TopicLevelVisualStyles_VisualStyleId",
                table: "TopicLevelVisualStyles",
                column: "VisualStyleId");

            migrationBuilder.CreateIndex(
                name: "IX_VisualStyles_Name",
                table: "VisualStyles",
                column: "Name",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_WorksheetTopics_SubjectId_Slug",
                table: "WorksheetTopics",
                columns: new[] { "SubjectId", "Slug" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "GeneratedQuestions");

            migrationBuilder.DropTable(
                name: "QuestionCountOptions");

            migrationBuilder.DropTable(
                name: "QuestionTemplates");

            migrationBuilder.DropTable(
                name: "TopicLevelDifficulties");

            migrationBuilder.DropTable(
                name: "TopicLevelQuestionTypes");

            migrationBuilder.DropTable(
                name: "TopicLevelVisualStyles");

            migrationBuilder.DropTable(
                name: "GeneratedWorksheets");

            migrationBuilder.DropTable(
                name: "QuestionTypes");

            migrationBuilder.DropTable(
                name: "TopicLevelConfigurations");

            migrationBuilder.DropTable(
                name: "Difficulties");

            migrationBuilder.DropTable(
                name: "VisualStyles");

            migrationBuilder.DropTable(
                name: "LearningLevels");

            migrationBuilder.DropTable(
                name: "WorksheetTopics");

            migrationBuilder.DropIndex(
                name: "IX_Subjects_slug",
                table: "Subjects");

            migrationBuilder.AlterColumn<string>(
                name: "slug",
                table: "Subjects",
                type: "longtext",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "varchar(255)");
        }
    }
}
