using Microsoft.EntityFrameworkCore.Migrations;
using MySql.EntityFrameworkCore.Metadata;

#nullable disable

namespace kids_app.Migrations
{
    /// <inheritdoc />
    public partial class WorksheetTopicCategory : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int?>(
                name: "WorksheetCategoryId",
                table: "QuestionTypes",
                type: "int",
                nullable: true);
          
            migrationBuilder.CreateTable(
                name: "worksheetCategories",
                columns: table => new
                {
                    WorksheetCategoryId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySQL:ValueGenerationStrategy", MySQLValueGenerationStrategy.IdentityColumn),
                    TopicId = table.Column<int>(type: "int", nullable: false),
                    categoryName = table.Column<string>(type: "longtext", nullable: false),
                    code = table.Column<string>(type: "varchar(255)", nullable: false),
                    description = table.Column<string>(type: "longtext", nullable: false),
                    displayorder = table.Column<int>(type: "int", nullable: false),
                    isActive = table.Column<bool>(type: "tinyint(1)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_worksheetCategories", x => x.WorksheetCategoryId);
                    table.ForeignKey(
                        name: "FK_worksheetCategories_WorksheetTopics_TopicId",
                        column: x => x.TopicId,
                        principalTable: "WorksheetTopics",
                        principalColumn: "TopicId",
                        onDelete: ReferentialAction.Restrict);
                })
                .Annotation("MySQL:Charset", "utf8mb4");
            migrationBuilder.InsertData(
  table: "worksheetCategories",
  columns: new[]
  {
        "WorksheetCategoryId",
        "TopicId",
        "categoryName",
        "code",
        "description",
        "displayorder",
        "isActive"
  },
  values: new object[,]
  {
        { 1, 2, "Adding with Objects/Pictures", "ADDING_OBJECTS_PICTURES", "Addition using objects and pictures", 1, true },
        { 2, 2, "Number Lines", "NUMBER_LINES", "Addition using number lines", 2, true },
        { 3, 2, "Mental Addition", "MENTAL_ADDITION", "Mental addition practice", 3, true },
        { 4, 2, "Number Bonds", "NUMBER_BONDS", "Addition using number bonds", 4, true },
        { 5, 2, "Doubles", "DOUBLES", "Doubles and near doubles", 5, true }
  });

            migrationBuilder.Sql("""
    UPDATE QuestionTypes
    SET WorksheetCategoryId = 1
    WHERE Code IN (
        'ADDING_PICTURES',
        'VERTICAL_OBJECTS',
        'PICTURE_ADDITION'
    );
""");

            migrationBuilder.Sql("""
    UPDATE QuestionTypes
    SET WorksheetCategoryId = 5
    WHERE Code IN (
        'DOUBLES',
        'DOUBLES_PLUS_1',
        'DOUBLES_PLUS_2',
        'DOUBLES_MINUS_1',
        'NEAR_DOUBLES'
    );
""");

            migrationBuilder.CreateIndex(
                name: "IX_QuestionTypes_WorksheetCategoryId",
                table: "QuestionTypes",
                column: "WorksheetCategoryId");

            migrationBuilder.CreateIndex(
                name: "IX_worksheetCategories_TopicId_code",
                table: "worksheetCategories",
                columns: new[] { "TopicId", "code" },
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_QuestionTypes_worksheetCategories_WorksheetCategoryId",
                table: "QuestionTypes",
                column: "WorksheetCategoryId",
                principalTable: "worksheetCategories",
                principalColumn: "WorksheetCategoryId",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_QuestionTypes_worksheetCategories_WorksheetCategoryId",
                table: "QuestionTypes");

            migrationBuilder.DropTable(
                name: "worksheetCategories");

            migrationBuilder.DropIndex(
                name: "IX_QuestionTypes_WorksheetCategoryId",
                table: "QuestionTypes");

            migrationBuilder.DropColumn(
                name: "WorksheetCategoryId",
                table: "QuestionTypes");
        }
    }
}
