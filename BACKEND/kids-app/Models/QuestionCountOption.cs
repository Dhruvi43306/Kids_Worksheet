using System.ComponentModel.DataAnnotations.Schema;

namespace kids_app.Models
{
    public class QuestionCountOption
    {
        public int QuestionCountOptionId { get; set; }

        [ForeignKey(nameof(TopicLevelConfigurationId))]
        public int TopicLevelConfigurationId { get; set; }

        public int QuestionCount { get; set; }

        public bool IsActive { get; set; } = true;

        public TopicLevelConfiguration Configuration { get; set; } = null!;
    }
}
