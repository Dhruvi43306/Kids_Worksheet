namespace kids_app.Models
{
    public class QuestionType
    {
        public int QuestionTypeId { get; set; }

        public int? WorksheetCategoryId { get; set; }
        public WorksheetCategory WorksheetCategory { get; set; } = null!;
        public string TypeName { get; set; } = null!;

        public string Code { get; set; } = null!;

        public string? Description { get; set; }

        public bool IsActive { get; set; } = true;
        public string? RendererKey { get; set; }


        public ICollection<TopicLevelQuestionType> TopicLevelQuestionTypes { get; set; } = new List<TopicLevelQuestionType>();
    }
}
