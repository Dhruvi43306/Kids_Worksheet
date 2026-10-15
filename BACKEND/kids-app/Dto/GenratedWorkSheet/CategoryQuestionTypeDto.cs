public class CategoryQuestionTypeDto
{
    public int WorksheetCategoryId { get; set; }

    public List<int> QuestionTypeIds { get; set; } = new();
}