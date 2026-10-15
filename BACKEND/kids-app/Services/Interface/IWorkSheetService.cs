using kids_app.Dto.CommonApiDto;
using kids_app.Dto.Subject;
using kids_app.Dto.WorksheetTopic;

namespace kids_app.Services.Interface
{
    public interface IWorkSheetService
    {
        public Task<ResponceDto<List<WorksheetTopicDto>>> GetWorkSheetTopic();

        public Task<ResponceDto<WorksheetTopicDto>> AddWorkSheetTopic(WorksheetTopicDto worksheetTopicDto);

        Task<ResponceDto<List<WorksheetTopicDto>>> GetWorkSheetTopicBySubject(string subjectSlug);
        Task<ResponceDto<WorksheetTopicDto>> GetWorkSheetTopicBySlug(string subjectSlug,string slug);
    }

}
