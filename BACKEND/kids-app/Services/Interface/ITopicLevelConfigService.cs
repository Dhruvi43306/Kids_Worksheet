using kids_app.Dto.CommonApiDto;
using kids_app.Dto.IVisuleStyle;
using kids_app.Dto.TopicLevelConfiguration;

namespace kids_app.Services.Interface
{
    public interface ITopicLevelConfiguration
    {
        public Task<ResponceDto<List<TopicLevelConfigurationDto>>> GetTopicLevelConfig();

        public Task<ResponceDto<TopicLevelConfigurationDto>> AddTopicLevelConfig(TopicLevelConfigurationDto levelConfigurationDto);
    }
}
