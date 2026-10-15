using kids_app.Dto.CommonApiDto;
using kids_app.Dto.Difficulty;

namespace kids_app.Services.Interface
{
    public interface ITopicLevelDifficultyService
    {
        Task<ResponceDto<TopicLevelDifficultyDto>> AddAsync(
            TopicLevelDifficultyDto dto);

        Task<ResponceDto<List<TopicLevelDifficultyDto>>> GetAllAsync();

        Task<ResponceDto<TopicLevelDifficultyDto>> GetByIdAsync(
            int topicLevelConfigurationId,
            int difficultyId);

        Task<ResponceDto<bool>> DeleteAsync(
            int topicLevelConfigurationId,
            int difficultyId);
    }
}
