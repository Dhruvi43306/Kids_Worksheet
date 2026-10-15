using System.ComponentModel.DataAnnotations.Schema;

namespace kids_app.Models
{
    public class TopicLevelQuestionType
    {
        [ForeignKey(nameof(TopicLevelConfigurationId))]
        public int TopicLevelConfigurationId { get; set; }

        [ForeignKey(nameof(QuestionTypeId))]
        public int QuestionTypeId { get; set; }

        public TopicLevelConfiguration Configuration { get; set; } = null!;

        public QuestionType QuestionType { get; set; } = null!;
    }
}
