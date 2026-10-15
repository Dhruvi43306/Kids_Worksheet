namespace kids_app.Models
{
    public class QuestionTemplate
    {
        public long QuestionTemplateId { get; set; }

        public int TopicId { get; set; }

        public int QuestionTypeId { get; set; }

        public string TemplateName { get; set; } = null!;

        public string? TemplateText { get; set; }

        public string? TemplateDataJson { get; set; }

        public bool IsActive { get; set; } = true;
    }
}
