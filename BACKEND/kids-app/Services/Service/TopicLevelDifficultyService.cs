using kids_app.Data;
using kids_app.Dto.CommonApiDto;
using kids_app.Dto.Difficulty;
using kids_app.Models;
using kids_app.Services.Interface;
using Microsoft.EntityFrameworkCore;

namespace kids_app.Services
{
    public class TopicLevelDifficultyService : ITopicLevelDifficultyService
    {
        private readonly AppDbContext _context;

        public TopicLevelDifficultyService(AppDbContext context)
        {
            _context = context;
        }

  

        public async Task<ResponceDto<TopicLevelDifficultyDto>> AddAsync(TopicLevelDifficultyDto dto)
        {
            var response = new ResponceDto<TopicLevelDifficultyDto>();
            var configurationExists =
                await _context.TopicLevelConfigurations
                    .AnyAsync(x =>
                        x.TopicLevelConfigurationId ==
                        dto.TopicLevelConfigurationId &&
                        x.IsActive);

            if (!configurationExists)
            {
                response.Success = false;
                response.Message ="Topic level configuration not found.";

                return response;
            }
            var difficultyExists =
                await _context.Difficulties.AnyAsync(x =>
                        x.DifficultyId == dto.DifficultyId &&
                        x.IsActive);

            if (!difficultyExists)
            {
                response.Success = false;
                response.Message ="Difficulty not found.";

                return response;
            }

            var alreadyExists =
                await _context.TopicLevelDifficulties
                    .AnyAsync(x =>
                        x.TopicLevelConfigurationId ==
                        dto.TopicLevelConfigurationId &&
                        x.DifficultyId ==
                        dto.DifficultyId);

            if (alreadyExists)
            {
                response.Success = false;
                response.Message =
                    "This difficulty is already assigned to this configuration.";

                return response;
            }

            var entity = new TopicLevelDifficulty
            {
                TopicLevelConfigurationId = dto.TopicLevelConfigurationId,

                DifficultyId = dto.DifficultyId
            };

            await _context.TopicLevelDifficulties.AddAsync(entity);

            await _context.SaveChangesAsync();

            response.Success = true;
            response.Message ="Difficulty assigned successfully.";
            response.Data = new TopicLevelDifficultyDto
            {
                TopicLevelConfigurationId =entity.TopicLevelConfigurationId,
                DifficultyId =entity.DifficultyId
            };

            return response;
        }

        public async Task<ResponceDto<List<TopicLevelDifficultyDto>>> GetAllAsync()
        {
            var response = new ResponceDto<List<TopicLevelDifficultyDto>>();

            var data = await _context.TopicLevelDifficulties
                .AsNoTracking()
                .Select(x => new TopicLevelDifficultyDto
                {
                    TopicLevelConfigurationId = x.TopicLevelConfigurationId,
                    DifficultyId = x.DifficultyId
                })
                .ToListAsync();

            response.Success = true;
            response.Message ="Topic level difficulties retrieved successfully.";
            response.Data = data;

            return response;
        }


        public async Task<ResponceDto<TopicLevelDifficultyDto>> GetByIdAsync(int topicLevelConfigurationId,int difficultyId)
        {
            var response = new ResponceDto<TopicLevelDifficultyDto>();

            var data =
                await _context.TopicLevelDifficulties
                    .AsNoTracking()
                    .Where(x =>
                        x.TopicLevelConfigurationId ==
                        topicLevelConfigurationId &&
                        x.DifficultyId ==
                        difficultyId)
                    .Select(x => new TopicLevelDifficultyDto
                    {
                        TopicLevelConfigurationId =
                            x.TopicLevelConfigurationId,

                        DifficultyId =
                            x.DifficultyId
                    })
                    .FirstOrDefaultAsync();

            if (data == null)
            {
                response.Success = false;
                response.Message =
                    "Topic level difficulty relationship not found.";

                return response;
            }

            response.Success = true;
            response.Message =
                "Topic level difficulty retrieved successfully.";

            response.Data = data;

            return response;
        }

        public async Task<ResponceDto<bool>> DeleteAsync(
            int topicLevelConfigurationId,
            int difficultyId)
        {
            var response = new ResponceDto<bool>();

            var entity =
                await _context.TopicLevelDifficulties
                    .FirstOrDefaultAsync(x =>
                        x.TopicLevelConfigurationId ==
                        topicLevelConfigurationId &&
                        x.DifficultyId ==
                        difficultyId);

            if (entity == null)
            {
                response.Success = false;
                response.Message =
                    "Topic level difficulty relationship not found.";

                response.Data = false;

                return response;
            }

            _context.TopicLevelDifficulties.Remove(entity);

            await _context.SaveChangesAsync();

            response.Success = true;
            response.Message =
                "Difficulty removed from configuration successfully.";

            response.Data = true;

            return response;
        }
    }
}