using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace kids_app.Migrations
{
    /// <inheritdoc />
    public partial class AddRendererKeyToQuestionType : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "RendererKey",
                table: "QuestionTypes",
                type: "longtext",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "RendererKey",
                table: "QuestionTypes");
        }
    }
}
