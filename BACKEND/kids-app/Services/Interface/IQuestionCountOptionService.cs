using kids_app.Dto.QuestionCountOption;

namespace kids_app.Services.Interface
{
    public interface IQuestionCountOptionService
    {
        Task<IEnumerable<QuestionCountOptionResponseDto>>GetAllAsync();

        Task<IEnumerable<QuestionCountOptionResponseDto>>GetByConfigurationIdAsync(int topicLevelConfigurationId);

        Task<QuestionCountOptionResponseDto?> GetByIdAsync(int questionCountOptionId);

        Task<QuestionCountOptionResponseDto> CreateAsync(QuestionCountOptionDto dto);

        Task<QuestionCountOptionResponseDto?> UpdateAsync(int questionCountOptionId,QuestionCountOptionDto dto);

        Task<bool> DeleteAsync(int questionCountOptionId);
    }
}