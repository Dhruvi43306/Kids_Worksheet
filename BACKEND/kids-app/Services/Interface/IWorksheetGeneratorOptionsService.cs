using kids_app.Dto.CommonApiDto;
using kids_app.Dto.WorksheetGenerator;

namespace kids_app.Services.Interface
{
    public interface IWorksheetGeneratorOptionsService
    {
        Task<ResponceDto<WorksheetGeneratorOptionsDto?>> GetOptionsAsync(int topicId, int levelId);
    }
}
