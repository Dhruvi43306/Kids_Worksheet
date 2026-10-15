namespace kids_app.Models
{
    public class LearningLevel
    {
        public int LevelId { get; set; }

        public string LevelName { get; set; } = string.Empty;

        public string? Description { get; set; }

        public int? MinAge { get; set; }

        public int? MaxAge { get; set; }

        public int DisplayOrder { get; set; }

        public bool IsActive { get; set; } = true;

        public ICollection<TopicLevelConfiguration> LevelConfigurations { get; set; }
            = new List<TopicLevelConfiguration>();

    }
}
