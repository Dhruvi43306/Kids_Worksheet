using System.ComponentModel.DataAnnotations.Schema;

namespace kids_app.Models
{
    public class GeneratedQuestion
    {
        public long GeneratedQuestionId { get; set; }
        [ForeignKey(nameof(GeneratedWorksheetId))]
        public long GeneratedWorksheetId { get; set; }

        public int QuestionNumber { get; set; }

        [ForeignKey(nameof(QuestionTypeId))]
        public int QuestionTypeId { get; set; }

        public string QuestionText { get; set; } = null!;

        public string? QuestionDataJson { get; set; }

        public string CorrectAnswer { get; set; } = null!;

        public int Marks { get; set; }

        public GeneratedWorksheet Worksheet { get; set; } = null!;

        public QuestionType QuestionType { get; set; } = null!;
    }
}
