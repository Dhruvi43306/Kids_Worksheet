using kids_app.Dto.QuestionType;

namespace kids_app.Services.Interface
{
    public interface ITopicLevelQuestionTypeService
    {
        Task<IEnumerable<TopicLevelQuestionTypeResponseDto>>
           GetAllAsync();

        Task<TopicLevelQuestionTypeResponseDto?>
            GetByIdAsync(
                int topicLevelConfigurationId,
                int questionTypeId);

        Task<TopicLevelQuestionTypeResponseDto>
            CreateAsync(
                TopicLevelQuestionTypeDto dto);

        Task<bool> DeleteAsync(
            int topicLevelConfigurationId,
            int questionTypeId);
    }
}
