
using kids_app.DTOs.PreGeneratedWorksheet;

namespace kids_app.Interfaces
{
    public interface IPreGeneratedWorksheetService
    {
        // Get all active subjects
        Task<List<PreGeneratedSubjectDto>> GetSubjectsAsync(
            CancellationToken cancellationToken = default);
        Task<List<PreGeneratedWorksheetCategoryDto>>
    GetCategoriesByTopicAsync(
        int topicId,
        CancellationToken cancellationToken = default);
        // Get topics belonging to a subject
        Task<List<PreGeneratedTopicDto>> GetTopicsBySubjectAsync(
            int subjectId,
            CancellationToken cancellationToken = default);

        // Get available levels and difficulties for a topic
        Task<PreGeneratedTopicOptionsDto?> GetTopicOptionsAsync(
            int topicId,
            CancellationToken cancellationToken = default);

        // Get worksheet URLs using topic, level and difficulty
        // Null means the topic or selected combination is invalid.
        // An empty list means the combination is valid but has no uploaded worksheets.
        Task<List<PreGeneratedWorksheetDto>?> GetWorksheetsAsync(
     int topicId,
     int categoryId,
     int levelId,
     int difficultyId,
     CancellationToken cancellationToken = default);
    }
}
