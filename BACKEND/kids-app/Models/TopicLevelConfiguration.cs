using System.ComponentModel.DataAnnotations.Schema;

namespace kids_app.Models
{
    public class TopicLevelConfiguration
    {
        public int TopicLevelConfigurationId { get; set; }

        [ForeignKey(nameof(TopicId))]
        public int TopicId { get; set; }

        [ForeignKey(nameof(LevelId))]
        public int LevelId { get; set; }

        public int? MinNumber { get; set; }

        public int? MaxNumber { get; set; }

        public bool IsActive { get; set; } = true;

        public WorksheetTopics Topic { get; set; } = null!;

        public LearningLevel Level { get; set; } = null!;

        public ICollection<TopicLevelDifficulty> Difficulties { get; set; }
               = new List<TopicLevelDifficulty>();

        public ICollection<TopicLevelVisualStyle> VisualStyles { get; set; }
            = new List<TopicLevelVisualStyle>();

        public ICollection<TopicLevelQuestionType> QuestionTypes { get; set; }
            = new List<TopicLevelQuestionType>();

        public ICollection<QuestionCountOption> QuestionCounts { get; set; }
            = new List<QuestionCountOption>();
    }
}
