using kids_app.Dto.CommonApiDto;
using kids_app.Dto.WorksheetCategory;

namespace kids_app.Services.Interface
{
    public interface IWorksheetCategory
    {
        Task<List<WorksheetCategoryDto>> GetCategoriesByTopicAndLevelAsync(
            int topicId,
            int levelId
        );

        Task<ResponceDto<WorksheetCategoryDto>> AddWorkSheetTopicCategory(WorksheetCategoryDto worksheetCategoryDto);
    }
}
