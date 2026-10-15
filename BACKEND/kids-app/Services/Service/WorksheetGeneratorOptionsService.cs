using kids_app.Data;
using kids_app.Dto.CommonApiDto;
using kids_app.Dto.Difficulty;
using kids_app.Dto.IVisuleStyle;
using kids_app.Dto.QuestionCountOption;
using kids_app.Dto.QuestionType;
using kids_app.Dto.WorksheetGenerator;
using kids_app.Services.Interface;
using Microsoft.EntityFrameworkCore;

namespace kids_app.Services.Service
{
    public class WorksheetGeneratorOptionsService: IWorksheetGeneratorOptionsService
    {
        private readonly AppDbContext _context;

        public WorksheetGeneratorOptionsService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<ResponceDto<WorksheetGeneratorOptionsDto?>> GetOptionsAsync(int topicId,int levelId)
        {
            try
            {

                var configuration =
                    await _context.TopicLevelConfigurations
                        .AsNoTracking()
                        .FirstOrDefaultAsync(x =>
                            x.TopicId == topicId &&
                            x.LevelId == levelId &&
                            x.IsActive);

                if (configuration == null)
                {
                    return new ResponceDto<
                        WorksheetGeneratorOptionsDto?>
                    {
                        Success = false,

                        Message =
                            "No worksheet configuration found for this topic and level.",

                        Data = null,

                        Errors = new List<string>
                        {
                            $"No active configuration found for TopicId={topicId}, LevelId={levelId}."
                        }
                    };
                }

                int configurationId = configuration.TopicLevelConfigurationId;


                var difficulties =
                    await _context.TopicLevelDifficulties
                        .AsNoTracking()
                        .Where(x =>
                            x.TopicLevelConfigurationId ==
                                configurationId &&
                            x.Difficulty != null &&
                            x.Difficulty.IsActive)
                        .OrderBy(x =>
                            x.Difficulty.DisplayOrder)
                        .Select(x => new DifficultyDto
                        {
                            DifficultyId =
                                x.DifficultyId,

                            Name =
                                x.Difficulty.Name,

                            DisplayOrder =
                                x.Difficulty.DisplayOrder,

                            IsActive =
                                x.Difficulty.IsActive
                        })
                        .ToListAsync();


                var visualStyles =
                    await _context.TopicLevelVisualStyles
                        .AsNoTracking()
                        .Where(x =>
                            x.TopicLevelConfigurationId ==
                                configurationId &&
                            x.VisualStyle != null &&
                            x.VisualStyle.IsActive)
                        .OrderBy(x =>
                            x.VisualStyle.Name)
                        .Select(x => new IVisualStyleDto
                        {
                            VisualStyleId =
                                x.VisualStyleId,

                            Name =
                                x.VisualStyle.Name,

                            Icon =
                                x.VisualStyle.Icon,

                            Description =
                                x.VisualStyle.Description
                        })
                        .ToListAsync();


                var questionTypes =
                    await _context.TopicLevelQuestionTypes
                        .AsNoTracking()
                        .Where(x =>
                            x.TopicLevelConfigurationId ==
                                configurationId &&
                            x.QuestionType != null &&
                            x.QuestionType.IsActive)
                        .OrderBy(x =>
                            x.QuestionType.TypeName)
                        .Select(x => new QuestionTypeDto
                        {
                            QuestionTypeId =
                                x.QuestionTypeId,

                            TypeName =
                                x.QuestionType.TypeName,

                            Code =
                                x.QuestionType.Code,

                            Description =
                                x.QuestionType.Description,

                            WorksheetCategoryId =
                                x.QuestionType.WorksheetCategoryId
                        })
                        .ToListAsync();

                var questionCounts =
                    await _context.QuestionCountOptions
                        .AsNoTracking()
                        .Where(x =>
                            x.TopicLevelConfigurationId ==
                                configurationId &&
                            x.IsActive)
                        .OrderBy(x =>
                            x.QuestionCount)
                        .Select(x => new QuestionCountOptionDto
                        {
                            QuestionCountOptionId =
                                x.QuestionCountOptionId,

                            QuestionCount =
                                x.QuestionCount
                        })
                        .ToListAsync();
                var data =
                    new WorksheetGeneratorOptionsDto
                    {
                       TopicLevelConfigurationId = configurationId,
                       TopicId = configuration.TopicId,
                       LevelId = configuration.LevelId,
                       MinNumber = configuration.MinNumber,
                       MaxNumber = configuration.MaxNumber,
                       Difficulties =  difficulties,
                       VisualStyles =visualStyles,
                       QuestionTypes =questionTypes,
                       QuestionCounts =questionCounts
                    };

                return new ResponceDto<
                    WorksheetGeneratorOptionsDto?>
                {
                    Success = true,

                    Message ="Worksheet generator options retrieved successfully.",

                    Data =data,

                    Errors = new List<string>()
                };
            }
            catch (Exception ex)
            {

                return new ResponceDto<WorksheetGeneratorOptionsDto?>
                {
                    Success = false,

                    Message ="Error while loading worksheet generator options.",

                    Data = null,

                    Errors = new List<string>
                    {
                        ex.Message
                    }
                };
            }
        }
    }
}