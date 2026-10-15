using System.ComponentModel.DataAnnotations.Schema;

namespace kids_app.Models
{
    public class TopicLevelDifficulty
    {
        [ForeignKey(nameof(TopicLevelConfigurationId))]
        public int TopicLevelConfigurationId { get; set; }

        [ForeignKey(nameof(DifficultyId))]
        public int DifficultyId { get; set; }

        public TopicLevelConfiguration Configuration { get; set; } = null!;

        public Difficulty Difficulty { get; set; } = null!;
    }
}
