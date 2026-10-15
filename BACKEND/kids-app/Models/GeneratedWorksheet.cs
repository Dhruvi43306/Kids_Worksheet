

using System.ComponentModel.DataAnnotations.Schema;

namespace kids_app.Models
{
    public class GeneratedWorksheet
    {
        public long GeneratedWorksheetId { get; set; }

        [ForeignKey(nameof(TopicId))]
        public int TopicId { get; set; }

        [ForeignKey(nameof(LevelId))]
        public int LevelId { get; set; }

        [ForeignKey(nameof(DifficultyId))]
        public int DifficultyId { get; set; }

        [ForeignKey(nameof(VisualStyleId))]
        public int? VisualStyleId { get; set; }

        public int QuestionCount { get; set; }

        public string WorksheetTitle { get; set; } = null!;

        public string? SchoolName { get; set; }

        public string? StudentName { get; set; }

        public string? GradeName { get; set; }

        public string? Section { get; set; }

        public string? TeacherName { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public WorksheetTopics Topic { get; set; } = null!;

        public LearningLevel Level { get; set; } = null!;

        public Difficulty Difficulty { get; set; } = null!;

        public VisualStyle? VisualStyle { get; set; }

        public ICollection<GeneratedQuestion> Questions { get; set; }
        = new List<GeneratedQuestion>();

    }
}
