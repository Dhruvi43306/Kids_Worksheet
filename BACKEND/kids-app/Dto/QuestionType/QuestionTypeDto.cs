namespace kids_app.Dto.QuestionType
{
    public class QuestionTypeDto
    {
        public int QuestionTypeId { get; set; }
        public string TypeName { get; set; } = null!;
        public int? WorksheetCategoryId { get; set; }

        public string Code { get; set; } = null!;

        public string? Description { get; set; }

        public bool IsActive { get; set; } = true;
        public string? RendererKey { get; set; }

    }
}
