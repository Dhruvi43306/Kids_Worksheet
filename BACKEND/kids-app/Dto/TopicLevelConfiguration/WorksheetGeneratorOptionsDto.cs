using kids_app.Dto.Difficulty;
using kids_app.Dto.IVisuleStyle;
using kids_app.Dto.QuestionCountOption;
using kids_app.Dto.QuestionType;

namespace kids_app.Dto.WorksheetGenerator
{
    public class WorksheetGeneratorOptionsDto
    {
        public int TopicLevelConfigurationId { get; set; }

        public int TopicId { get; set; }

        public int LevelId { get; set; }

        public int? MinNumber { get; set; }

        public int? MaxNumber { get; set; }

        public List<DifficultyDto> Difficulties { get; set; } = new();

        public List<IVisualStyleDto> VisualStyles { get; set; } = new();

        public List<QuestionTypeDto> QuestionTypes { get; set; } = new();

        public List<QuestionCountOptionDto> QuestionCounts { get; set; } = new();

     
    }
}