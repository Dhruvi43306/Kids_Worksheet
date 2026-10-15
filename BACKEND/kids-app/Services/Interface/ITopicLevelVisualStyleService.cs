using kids_app.Dto.VisuleStyle;

namespace kids_app.Services.Interface
{
    public interface ITopicLevelVisualStyleService
    {
        Task<IEnumerable<TopicLevelVisualStyleResponseDto>> GetAllAsync();

        Task<TopicLevelVisualStyleResponseDto?> GetByIdAsync(
            int topicLevelConfigurationId,
            int visualStyleId);

        Task<TopicLevelVisualStyleResponseDto> CreateAsync(
            TopicLevelVisualStyleDto dto);

        Task<bool> DeleteAsync(
            int topicLevelConfigurationId,
            int visualStyleId);
    }
}
