using kids_app.Data;
using kids_app.Dto.QuestionCountOption;
using kids_app.Models;
using kids_app.Services.Interface;
using Microsoft.EntityFrameworkCore;

namespace kids_app.Services.Service
{
    public class QuestionCountOptionService: IQuestionCountOptionService
    {
        private readonly AppDbContext _context;

        public QuestionCountOptionService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<QuestionCountOptionResponseDto>>GetAllAsync()
        {
            return await _context.QuestionCountOptions
                .Select(x => new QuestionCountOptionResponseDto
                {
                    QuestionCountOptionId =
                        x.QuestionCountOptionId,

                    TopicLevelConfigurationId =
                        x.TopicLevelConfigurationId,

                    QuestionCount =
                        x.QuestionCount,

                    IsActive =
                        x.IsActive
                })
                .ToListAsync();
        }

        public async Task<IEnumerable<QuestionCountOptionResponseDto>>GetByConfigurationIdAsync(int topicLevelConfigurationId)
        {
            return await _context.QuestionCountOptions
                .Where(x =>
                    x.TopicLevelConfigurationId ==
                    topicLevelConfigurationId)
                .Select(x => new QuestionCountOptionResponseDto
                {
                    QuestionCountOptionId =
                        x.QuestionCountOptionId,

                    TopicLevelConfigurationId =
                        x.TopicLevelConfigurationId,

                    QuestionCount =
                        x.QuestionCount,

                    IsActive =
                        x.IsActive
                })
                .ToListAsync();
        }

        public async Task<QuestionCountOptionResponseDto?>GetByIdAsync(int questionCountOptionId)
        {
            return await _context.QuestionCountOptions
                .Where(x =>
                    x.QuestionCountOptionId ==
                    questionCountOptionId)
                .Select(x => new QuestionCountOptionResponseDto
                {
                    QuestionCountOptionId =
                        x.QuestionCountOptionId,

                    TopicLevelConfigurationId =
                        x.TopicLevelConfigurationId,

                    QuestionCount =
                        x.QuestionCount,

                    IsActive =
                        x.IsActive
                })
                .FirstOrDefaultAsync();
        }

        public async Task<QuestionCountOptionResponseDto>CreateAsync(QuestionCountOptionDto dto)
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

            var alreadyExists =
                await _context.QuestionCountOptions
                    .AnyAsync(x =>
                        x.TopicLevelConfigurationId ==
                            dto.TopicLevelConfigurationId &&
                        x.QuestionCount ==
                            dto.QuestionCount);

            if (alreadyExists)
            {
                throw new InvalidOperationException(
                    "This question count is already assigned to this configuration.");
            }

            var entity = new QuestionCountOption
            {
                TopicLevelConfigurationId =
                    dto.TopicLevelConfigurationId,

                QuestionCount =
                    dto.QuestionCount,

                IsActive =
                    dto.IsActive
            };

            _context.QuestionCountOptions.Add(entity);

            await _context.SaveChangesAsync();

            return await GetByIdAsync(
                entity.QuestionCountOptionId
            ) ?? throw new Exception(
                "Unable to retrieve created record.");
        }

        public async Task<QuestionCountOptionResponseDto?>
            UpdateAsync(
                int questionCountOptionId,
                QuestionCountOptionDto dto)
        {
            var entity =
                await _context.QuestionCountOptions
                    .FirstOrDefaultAsync(x =>
                        x.QuestionCountOptionId ==
                        questionCountOptionId);

            if (entity == null)
            {
                return null;
            }

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

            var duplicateExists =
                await _context.QuestionCountOptions
                    .AnyAsync(x =>
                        x.QuestionCountOptionId !=
                            questionCountOptionId &&
                        x.TopicLevelConfigurationId ==
                            dto.TopicLevelConfigurationId &&
                        x.QuestionCount ==
                            dto.QuestionCount);

            if (duplicateExists)
            {
                throw new InvalidOperationException(
                    "This question count is already assigned to this configuration.");
            }

            entity.TopicLevelConfigurationId =
                dto.TopicLevelConfigurationId;

            entity.QuestionCount =
                dto.QuestionCount;

            entity.IsActive =
                dto.IsActive;

            await _context.SaveChangesAsync();

            return await GetByIdAsync(
                questionCountOptionId);
        }

        public async Task<bool> DeleteAsync(int questionCountOptionId)
        {
            var entity =
                await _context.QuestionCountOptions
                    .FirstOrDefaultAsync(x =>
                        x.QuestionCountOptionId ==
                        questionCountOptionId);

            if (entity == null)
            {
                return false;
            }

            _context.QuestionCountOptions.Remove(entity);

            await _context.SaveChangesAsync();

            return true;
        }
    }
}