using kids_app.Data;
using kids_app.Dto.CommonApiDto;
using kids_app.Dto.TopicLevelConfiguration;
using kids_app.Models;
using kids_app.Services.Interface;
using Microsoft.EntityFrameworkCore;

namespace kids_app.Services.Service
{
    public class TopicLevelConfigService:ITopicLevelConfiguration
    {
        private readonly AppDbContext _context;
        private readonly IConfiguration _configuration;

        public TopicLevelConfigService(AppDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }
        public async Task<ResponceDto<TopicLevelConfigurationDto>> AddTopicLevelConfig(TopicLevelConfigurationDto levelConfigurationDto)
        {
            var topicLevel = new TopicLevelConfiguration
            {
                TopicId = levelConfigurationDto.TopicId,
                LevelId = levelConfigurationDto.LevelId,
                MaxNumber = levelConfigurationDto.MaxNumber,
                MinNumber = levelConfigurationDto.MinNumber
            };
            await _context.TopicLevelConfigurations.AddAsync(topicLevel);
            await _context.SaveChangesAsync();

            return new ResponceDto<TopicLevelConfigurationDto>
            {
                Success = true,
                Message = "TopicLevel Added SucceFully",
                Data = new TopicLevelConfigurationDto
                {
                    TopicId = levelConfigurationDto.TopicId,
                    LevelId = levelConfigurationDto.LevelId,
                    MaxNumber = levelConfigurationDto.MaxNumber,
                    MinNumber = levelConfigurationDto.MinNumber
                },
                Errors = new List<string>()
            };
        }

        public async Task<ResponceDto<List<TopicLevelConfigurationDto>>> GetTopicLevelConfig()
        {
            var subjects = await _context.TopicLevelConfigurations
                           .Select(x => new TopicLevelConfigurationDto
                           {
                               TopicLevelConfigurationId = x.TopicLevelConfigurationId,
                               TopicId = x.TopicId,
                               LevelId = x.LevelId,
                               MaxNumber = x.MaxNumber,
                               MinNumber = x.MinNumber
                           })
                           .ToListAsync();
            return new ResponceDto<List<TopicLevelConfigurationDto>>
            {
                Success = true,
                Message = "topiclevel Get all SucceFully",
                Data = subjects,
                Errors = new List<string>()
            };

        }
    }
}
