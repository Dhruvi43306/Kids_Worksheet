using kids_app.Data;
using kids_app.Dto.CommonApiDto;
using kids_app.Dto.LearningLevel;
using kids_app.Dto.Subject;
using kids_app.Models;
using kids_app.Services.Interface;
using Microsoft.EntityFrameworkCore;

namespace kids_app.Services.Service
{
    public class LearningLevelService:ILearningLevel
    {
        private readonly AppDbContext _context;
        private readonly IConfiguration _configuration;

        public LearningLevelService(AppDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        public async Task<ResponceDto<LearningLevelDto>> AddLearningLevel(LearningLevelDto learningLevelDto)
        {
            var level = new LearningLevel
            {
               LevelName = learningLevelDto.LevelName,
               MaxAge = learningLevelDto.MaxAge,
               MinAge = learningLevelDto.MinAge,
               Description = learningLevelDto.Description,
               DisplayOrder = learningLevelDto.DisplayOrder
            };
            await _context.LearningLevels.AddAsync(level);
            await _context.SaveChangesAsync();

            return new ResponceDto<LearningLevelDto>
            {
                Success = true,
                Message = "Level Added SucceFully",
                Data = new LearningLevelDto
                {
                    
                    LevelName = learningLevelDto.LevelName,
                    MaxAge = learningLevelDto.MaxAge,
                    MinAge = learningLevelDto.MinAge,
                    Description = learningLevelDto.Description,
                    DisplayOrder = learningLevelDto.DisplayOrder
                },
                Errors = new List<string>()
            };
        }

        public async Task<ResponceDto<List<LearningLevelDto>>> GetLearningLevel()
        {
            var level = await _context.LearningLevels
                           .Select(x => new LearningLevelDto
                           { 
                               LevelId = x.LevelId,
                               LevelName = x.LevelName,
                               MaxAge = x.MaxAge,
                               MinAge = x.MinAge,
                               Description = x.Description,
                               DisplayOrder = x.DisplayOrder
                           })
                           .ToListAsync();
            return new ResponceDto<List<LearningLevelDto>>
            {
                Success = true,
                Message = "Level Get all SucceFully",
                Data = level,
                Errors = new List<string>()
            };

        }

    }
}
