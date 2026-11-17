
namespace kids_app.Dto.PrintableWorksheet
{
    public class PrintableSubjectDto
    {
        public int SubjectId { get; set; }
        public string SubjectName { get; set; } = string.Empty;
        public string Slug { get; set; } = string.Empty;
        public int WorksheetCount { get; set; }
    }

    public class PrintableFilterOptionDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
    }

    public class PrintableWorksheetFiltersDto
    {
        public List<PrintableFilterOptionDto> Categories { get; set; } = new();
        public List<PrintableFilterOptionDto> Levels { get; set; } = new();
        public List<PrintableFilterOptionDto> Difficulties { get; set; } = new();
    }

    public class PrintableWorksheetDto
    {
        public int PreGeneratedWorksheetId { get; set; }
        public int QuestionTypeId { get; set; }

        public int WorksheetCategoryId { get; set; }
        public string CategoryName { get; set; } = string.Empty;

        public int LevelId { get; set; }
        public string LevelName { get; set; } = string.Empty;

        public int DifficultyId { get; set; }
        public string DifficultyName { get; set; } = string.Empty;

        public string WorksheetTitle { get; set; } = string.Empty;
        public string WorksheetUrl { get; set; } = string.Empty;
        public string? ThumbnailUrl { get; set; }
        public string FileType { get; set; } = string.Empty;

        public int DisplayOrder { get; set; }
    }
}
