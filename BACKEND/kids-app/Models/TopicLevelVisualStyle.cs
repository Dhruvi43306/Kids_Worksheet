using System.ComponentModel.DataAnnotations.Schema;

namespace kids_app.Models
{
    public class TopicLevelVisualStyle
    {
        [ForeignKey(nameof(TopicLevelConfigurationId))]
        public int TopicLevelConfigurationId { get; set; }

        [ForeignKey(nameof(VisualStyleId))]
        public int VisualStyleId { get; set; }

        public TopicLevelConfiguration Configuration { get; set; } = null!;

        public VisualStyle VisualStyle { get; set; } = null!;
    }
}
