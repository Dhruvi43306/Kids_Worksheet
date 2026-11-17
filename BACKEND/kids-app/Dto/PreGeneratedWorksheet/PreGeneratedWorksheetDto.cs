
namespace kids_app.DTOs.PreGeneratedWorksheet
{
    // Subject cards
    public class PreGeneratedSubjectDto
    {
        public int SubjectId { get; set; }
        public string SubjectName { get; set; } = string.Empty;
        public string Slug { get; set; } = string.Empty;
    }

    public class PreGeneratedWorksheetCategoryDto
    {
        public int WorksheetCategoryId { get; set; }

        public int TopicId { get; set; }

        public string CategoryName { get; set; } = string.Empty;

        public string Code { get; set; } = string.Empty;

        public string? Description { get; set; }

        public int DisplayOrder { get; set; }
    }


    // Topics displayed after clicking a subject
    public class PreGeneratedTopicDto
    {
        public int TopicId { get; set; }
        public string TopicName { get; set; } = string.Empty;
        public string Slug { get; set; } = string.Empty;
        public string? Description { get; set; }
    }

    // Available options after clicking a topic
    public class PreGeneratedTopicOptionsDto
    {
        public int TopicId { get; set; }
        public string TopicName { get; set; } = string.Empty;

        public List<PreGeneratedLevelDto> Levels { get; set; } = new();
    }

    public class PreGeneratedLevelDto
    {
        public int TopicLevelConfigurationId { get; set; }
        public int LevelId { get; set; }
        public string LevelName { get; set; } = string.Empty;
        public int DisplayOrder { get; set; }

        public List<PreGeneratedDifficultyDto> Difficulties { get; set; } = new();
    }

    public class PreGeneratedDifficultyDto
    {
        public int DifficultyId { get; set; }
        public string DifficultyName { get; set; } = string.Empty;
        public int DisplayOrder { get; set; }
    }

    // Worksheet files displayed after selecting level and difficulty
    public class PreGeneratedWorksheetDto
    {
        public int PreGeneratedWorksheetId { get; set; }
        public string WorksheetTitle { get; set; } = string.Empty;
        public string WorksheetUrl { get; set; } = string.Empty;
        public string? ThumbnailUrl { get; set; }
        public string FileType { get; set; } = string.Empty;
        public int DisplayOrder { get; set; }
    }
}
