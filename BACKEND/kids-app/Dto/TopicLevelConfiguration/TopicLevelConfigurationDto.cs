
namespace kids_app.Dto.TopicLevelConfiguration
{
    public class TopicLevelConfigurationDto
    {
        public int TopicLevelConfigurationId { get; set; }

        public int TopicId { get; set; }
     
        public int LevelId { get; set; }

        public int? MinNumber { get; set; }

        public int? MaxNumber { get; set; }

        public bool IsActive { get; set; } = true;
    }

}
