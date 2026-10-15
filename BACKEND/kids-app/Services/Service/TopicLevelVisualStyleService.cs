using kids_app.Data;
using kids_app.Dto.VisuleStyle;
using kids_app.Models;
using kids_app.Services.Interface;
using Microsoft.EntityFrameworkCore;

namespace kids_app.Services.Service
{
    public class TopicLevelVisualStyleService : ITopicLevelVisualStyleService
    {
        private readonly AppDbContext _context;

        public TopicLevelVisualStyleService(AppDbContext context)
        {
            _context = context;
        }
        public async Task<IEnumerable<TopicLevelVisualStyleResponseDto>> GetAllAsync()
        {
            return await _context.TopicLevelVisualStyles
                .Include(x => x.VisualStyle)
                .Select(x => new TopicLevelVisualStyleResponseDto
                {
                    TopicLevelConfigurationId =
                        x.TopicLevelConfigurationId,

                    VisualStyleId =
                        x.VisualStyleId,

                    VisualStyleName =
                        x.VisualStyle.Name,

                    Icon =
                        x.VisualStyle.Icon,

                    Description =
                        x.VisualStyle.Description
                })
                .ToListAsync();
        }
        public async Task<TopicLevelVisualStyleResponseDto?> GetByIdAsync(int topicLevelConfigurationId,int visualStyleId)
        {
            return await _context.TopicLevelVisualStyles
                .Include(x => x.VisualStyle)
                .Where(x =>
                    x.TopicLevelConfigurationId ==
                        topicLevelConfigurationId &&
                    x.VisualStyleId ==
                        visualStyleId)
                .Select(x => new TopicLevelVisualStyleResponseDto
                {
                    TopicLevelConfigurationId =
                        x.TopicLevelConfigurationId,

                    VisualStyleId =
                        x.VisualStyleId,

                    VisualStyleName =
                        x.VisualStyle.Name,

                    Icon =
                        x.VisualStyle.Icon,

                    Description =
                        x.VisualStyle.Description
                })
                .FirstOrDefaultAsync();
        }

        public async Task<TopicLevelVisualStyleResponseDto> CreateAsync(TopicLevelVisualStyleDto dto)
        {
            var configurationExists =
                await _context.TopicLevelConfigurations
                    .AnyAsync(x =>
                        x.TopicLevelConfigurationId == dto.TopicLevelConfigurationId);

            if (!configurationExists)
            {
                throw new KeyNotFoundException("TopicLevelConfiguration not found.");
            }

            var visualStyleExists =
                await _context.VisualStyles
                    .AnyAsync(x =>
                        x.VisualStyleId == dto.VisualStyleId);

            if (!visualStyleExists)
            {
                throw new KeyNotFoundException("VisualStyle not found.");
            }

            var alreadyExists =
                await _context.TopicLevelVisualStyles
                    .AnyAsync(x =>
                        x.TopicLevelConfigurationId ==
                        dto.TopicLevelConfigurationId &&
                        x.VisualStyleId ==
                        dto.VisualStyleId);

            if (alreadyExists)
            {
                throw new InvalidOperationException("This visual style is already assigned to this configuration.");
            }

            var entity = new TopicLevelVisualStyle
            {
                TopicLevelConfigurationId =dto.TopicLevelConfigurationId,

                VisualStyleId = dto.VisualStyleId
            };

            _context.TopicLevelVisualStyles.Add(entity);

            await _context.SaveChangesAsync();

            return await GetByIdAsync(dto.TopicLevelConfigurationId,dto.VisualStyleId) ?? throw new Exception("Unable to retrieve created record.");
        }

        public async Task<bool> DeleteAsync(int topicLevelConfigurationId,int visualStyleId)
        {
            var entity =
                await _context.TopicLevelVisualStyles
                    .FirstOrDefaultAsync(x =>
                        x.TopicLevelConfigurationId ==
                        topicLevelConfigurationId &&
                        x.VisualStyleId ==
                        visualStyleId);

            if (entity == null)
            {
                return false;
            }

            _context.TopicLevelVisualStyles.Remove(entity);

            await _context.SaveChangesAsync();

            return true;
        }
    }
}