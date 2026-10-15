using kids_app.Data;
using kids_app.Dto.QuestionType;
using kids_app.Models;
using kids_app.Services.Interface;
using Microsoft.EntityFrameworkCore;

namespace kids_app.Services.Service
{
    public class TopicLevelQuestionTypeService: ITopicLevelQuestionTypeService
    {
        private readonly AppDbContext _context;

        public TopicLevelQuestionTypeService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<TopicLevelQuestionTypeResponseDto>>
            GetAllAsync()
        {
            return await _context.TopicLevelQuestionTypes
                .Include(x => x.QuestionType)
                .Select(x => new TopicLevelQuestionTypeResponseDto
                {
                    TopicLevelConfigurationId =
                        x.TopicLevelConfigurationId,

                    QuestionTypeId =
                        x.QuestionTypeId,

                    QuestionTypeName =
                        x.QuestionType.TypeName,

                    Description =
                        x.QuestionType.Description
                })
                .ToListAsync();
        }

        public async Task<TopicLevelQuestionTypeResponseDto?>
            GetByIdAsync(
                int topicLevelConfigurationId,
                int questionTypeId)
        {
            return await _context.TopicLevelQuestionTypes
                .Include(x => x.QuestionType)
                .Where(x =>
                    x.TopicLevelConfigurationId ==
                        topicLevelConfigurationId &&
                    x.QuestionTypeId ==
                        questionTypeId)
                .Select(x => new TopicLevelQuestionTypeResponseDto
                {
                    TopicLevelConfigurationId =
                        x.TopicLevelConfigurationId,

                    QuestionTypeId =
                        x.QuestionTypeId,

                    QuestionTypeName =
                        x.QuestionType.TypeName,

                    Description =
                        x.QuestionType.Description
                })
                .FirstOrDefaultAsync();
        }

        public async Task<TopicLevelQuestionTypeResponseDto>
            CreateAsync(TopicLevelQuestionTypeDto dto)
        {
            var configurationExists =
                await _context.TopicLevelConfigurations
                    .AnyAsync(x =>
                        x.TopicLevelConfigurationId ==
                        dto.TopicLevelConfigurationId);

            if (!configurationExists)
            {
                throw new KeyNotFoundException(
                    "TopicLevelConfiguration not found.");
            }

            var questionTypeExists =
                await _context.QuestionTypes
                    .AnyAsync(x =>
                        x.QuestionTypeId ==
                        dto.QuestionTypeId);

            if (!questionTypeExists)
            {
                throw new KeyNotFoundException(
                    "QuestionType not found.");
            }

            var alreadyExists =
                await _context.TopicLevelQuestionTypes
                    .AnyAsync(x =>
                        x.TopicLevelConfigurationId ==
                            dto.TopicLevelConfigurationId &&
                        x.QuestionTypeId ==dto.QuestionTypeId);

            if (alreadyExists)
            {
                throw new InvalidOperationException(
                    "This question type is already assigned to this configuration.");
            }

            var entity = new TopicLevelQuestionType
            {
                TopicLevelConfigurationId =
                    dto.TopicLevelConfigurationId,

                QuestionTypeId =
                    dto.QuestionTypeId
            };

            _context.TopicLevelQuestionTypes.Add(entity);

            await _context.SaveChangesAsync();

            return await GetByIdAsync(
                dto.TopicLevelConfigurationId,
                dto.QuestionTypeId
            ) ?? throw new Exception(
                "Unable to retrieve created record.");
        }

        public async Task<bool> DeleteAsync(
            int topicLevelConfigurationId,
            int questionTypeId)
        {
            var entity =
                await _context.TopicLevelQuestionTypes
                    .FirstOrDefaultAsync(x =>
                        x.TopicLevelConfigurationId ==
                            topicLevelConfigurationId &&
                        x.QuestionTypeId ==
                            questionTypeId);

            if (entity == null)
            {
                return false;
            }

            _context.TopicLevelQuestionTypes.Remove(entity);

            await _context.SaveChangesAsync();

            return true;
        }
    }
}