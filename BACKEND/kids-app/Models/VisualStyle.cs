namespace kids_app.Models
{
    public class VisualStyle
    {
        public int VisualStyleId { get; set; }

        public string Name { get; set; } = null!;

        public string? Icon { get; set; }

        public string? Description { get; set; }

        public bool IsActive { get; set; } = true;

        public ICollection<TopicLevelVisualStyle> TopicLevelVisualStyles { get; set; }
       = new List<TopicLevelVisualStyle>();
    }
}
