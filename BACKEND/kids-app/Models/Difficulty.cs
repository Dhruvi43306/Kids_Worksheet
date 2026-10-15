namespace kids_app.Models
{
    public class Difficulty
    {
        public int DifficultyId { get; set; }

        public string Name { get; set; } = string.Empty;

        public int DisplayOrder { get; set; }

        public bool IsActive { get; set; } = true;

        public ICollection<TopicLevelDifficulty> TopicLevelDifficulties { get; set; }
        = new List<TopicLevelDifficulty>();
    }

}
