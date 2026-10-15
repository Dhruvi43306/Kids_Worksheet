namespace kids_app.Dto.GenratedWorkSheet
{
    public class GenerateWorksheetRequestDto
    {
        public int TopicId { get; set; }
        public int LevelId { get; set; }
        public int DifficultyId { get; set; }
        public int WorksheetCategoryId { get; set; }
        public int? VisualStyleId { get; set; }
        public int QuestionCount { get; set; }  
        public List<int> QuestionTypeIds { get; set; } = new();
        public string? SchoolName { get; set; }
        public string? StudentName { get; set; }
        public string? GradeName { get; set; }
        public string? Section { get; set; }
        public string? TeacherName { get; set; }
        //public List<CategoryQuestionTypeDto> CategoryQuestionTypes { get; set; } = new();
    }
}
