
using kids_app.Data;
using kids_app.DTOs.PreGeneratedWorksheet;
using kids_app.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace kids_app.Services
{
    public class PreGeneratedWorksheetService : IPreGeneratedWorksheetService
    {
        private readonly AppDbContext _context;

        public PreGeneratedWorksheetService(AppDbContext context)
        {
            _context = context;
        }

        // ==========================================
        // 1. GET ALL ACTIVE SUBJECTS
        // ==========================================

        public async Task<List<PreGeneratedSubjectDto>> GetSubjectsAsync(
            CancellationToken cancellationToken = default)
        {
            return await _context.Subjects
                .AsNoTracking()
                .Where(x => x.IsActive)
                .OrderBy(x => x.SubjectName)
                .Select(x => new PreGeneratedSubjectDto
                {
                    SubjectId = x.SubjectId,
                    SubjectName = x.SubjectName,
                    Slug = x.slug
                })
                .ToListAsync(cancellationToken);
        }


        // ==========================================
        // 2. GET TOPICS BY SUBJECT ID
        // ==========================================

        public async Task<List<PreGeneratedTopicDto>> GetTopicsBySubjectAsync(
            int subjectId,
            CancellationToken cancellationToken = default)
        {
            return await _context.WorksheetTopics
                .AsNoTracking()
                .Where(x =>
                    x.SubjectId == subjectId &&
                    x.IsActive &&
                    x.Subject.IsActive)
                .OrderBy(x => x.TopicName)
                .Select(x => new PreGeneratedTopicDto
                {
                    TopicId = x.TopicId,
                    TopicName = x.TopicName,
                    Slug = x.Slug,
                    Description = x.Description
                })
                .ToListAsync(cancellationToken);
        }


        // ==========================================
        // 3. GET AVAILABLE LEVELS AND DIFFICULTIES
        //    FOR SELECTED TOPIC
        // ==========================================

        public async Task<PreGeneratedTopicOptionsDto?> GetTopicOptionsAsync(
            int topicId,
            CancellationToken cancellationToken = default)
        {
            // Check whether topic exists and is active.

            var topic = await _context.WorksheetTopics
                .AsNoTracking()
                .Where(x =>
                    x.TopicId == topicId &&
                    x.IsActive &&
                    x.Subject.IsActive)
                .Select(x => new PreGeneratedTopicOptionsDto
                {
                    TopicId = x.TopicId,
                    TopicName = x.TopicName
                })
                .FirstOrDefaultAsync(cancellationToken);

            if (topic == null)
            {
                return null;
            }


            // Get active configurations and their levels.

            var configurations = await _context.TopicLevelConfigurations
                .AsNoTracking()
                .Where(x =>
                    x.TopicId == topicId &&
                    x.IsActive &&
                    x.Level.IsActive)
                .OrderBy(x => x.Level.DisplayOrder)
                .Select(x => new
                {
                    x.TopicLevelConfigurationId,
                    LevelId = x.Level.LevelId,
                    LevelName = x.Level.LevelName,
                    LevelDisplayOrder = x.Level.DisplayOrder
                })
                .ToListAsync(cancellationToken);


            if (!configurations.Any())
            {
                return topic;
            }


            // Get configuration IDs.

            var configurationIds = configurations
                .Select(x => x.TopicLevelConfigurationId)
                .ToList();


            // Get only difficulties linked to these configurations.
            // Inactive difficulties are excluded.

            var difficultyRows = await _context.TopicLevelDifficulties
                .AsNoTracking()
                .Where(x =>
                    configurationIds.Contains(x.TopicLevelConfigurationId) &&
                    x.Difficulty.IsActive)
                .OrderBy(x => x.Difficulty.DisplayOrder)
                .Select(x => new
                {
                    x.TopicLevelConfigurationId,
                    x.Difficulty.DifficultyId,
                    DifficultyName = x.Difficulty.Name,
                    DifficultyDisplayOrder = x.Difficulty.DisplayOrder
                })
                .ToListAsync(cancellationToken);


            // Group difficulties by their configuration.

            var difficultyLookup = difficultyRows
                .GroupBy(x => x.TopicLevelConfigurationId)
                .ToDictionary(
                    group => group.Key,
                    group => group
                        .Select(x => new PreGeneratedDifficultyDto
                        {
                            DifficultyId = x.DifficultyId,
                            DifficultyName = x.DifficultyName,
                            DisplayOrder = x.DifficultyDisplayOrder
                        })
                        .OrderBy(x => x.DisplayOrder)
                        .ToList()
                );


            // Build the final level and difficulty response.

            topic.Levels = configurations
                .Select(x =>
                {
                    difficultyLookup.TryGetValue(
                        x.TopicLevelConfigurationId,
                        out var difficulties);

                    return new PreGeneratedLevelDto
                    {
                        TopicLevelConfigurationId =
                            x.TopicLevelConfigurationId,

                        LevelId = x.LevelId,

                        LevelName = x.LevelName,

                        DisplayOrder = x.LevelDisplayOrder,

                        Difficulties = difficulties ?? new()
                    };
                })
                // Do not display levels without an active difficulty.
                .Where(x => x.Difficulties.Any())
                .OrderBy(x => x.DisplayOrder)
                .ToList();

            return topic;
        }


        // ==========================================
        // 4. GET WORKSHEETS BY TOPIC, LEVEL
        //    AND DIFFICULTY
        // ==========================================


        public async Task<List<PreGeneratedWorksheetDto>?> GetWorksheetsAsync(
            int topicId,
            int categoryId,
            int levelId,
            int difficultyId,
            CancellationToken cancellationToken = default)
        {
            // Verify active topic and category belong to that topic.

            var validCategory = await _context.worksheetCategories
                .AsNoTracking()
                .AnyAsync(x =>
                    x.WorksheetCategoryId == categoryId &&
                    x.TopicId == topicId &&
                    x.isActive &&
                    x.WorksheetTopics.IsActive &&
                    x.WorksheetTopics.Subject.IsActive,
                    cancellationToken);

            if (!validCategory)
                return null;

            // Find active topic-level configuration.

            var configurationId =
                await _context.TopicLevelConfigurations
                    .AsNoTracking()
                    .Where(x =>
                        x.TopicId == topicId &&
                        x.LevelId == levelId &&
                        x.IsActive &&
                        x.Level.IsActive)
                    .Select(x => (int?)x.TopicLevelConfigurationId)
                    .FirstOrDefaultAsync(cancellationToken);

            if (!configurationId.HasValue)
                return null;

            // Verify the difficulty is configured for this level.

            var validDifficulty =
                await _context.TopicLevelDifficulties
                    .AsNoTracking()
                    .AnyAsync(x =>
                        x.TopicLevelConfigurationId == configurationId.Value &&
                        x.DifficultyId == difficultyId &&
                        x.Difficulty.IsActive,
                        cancellationToken);

            if (!validDifficulty)
                return null;

            // Get files matching ALL FOUR filters.

            return await _context.PreGeneratedWorksheets
                .AsNoTracking()
                .Where(x =>
                    x.TopicLevelConfigurationId == configurationId.Value &&
                    x.DifficultyId == difficultyId &&
                    x.WorksheetCategoryId == categoryId &&
                    x.IsActive)
                .OrderBy(x => x.DisplayOrder)
                .ThenBy(x => x.PreGeneratedWorksheetId)
                .Select(x => new PreGeneratedWorksheetDto
                {
                    PreGeneratedWorksheetId =
                        x.PreGeneratedWorksheetId,

                    WorksheetTitle = x.WorksheetTitle,
                    WorksheetUrl = x.WorksheetUrl,
                    ThumbnailUrl = x.ThumbnailUrl,
                    FileType = x.FileType,
                    DisplayOrder = x.DisplayOrder
                })
                .ToListAsync(cancellationToken);
        }

        public async Task<List<PreGeneratedWorksheetCategoryDto>>
            GetCategoriesByTopicAsync(
                int topicId,
                CancellationToken cancellationToken = default)
        {
            return await _context.worksheetCategories
                .AsNoTracking()
                .Where(x =>
                    x.TopicId == topicId &&
                    x.isActive &&
                    x.WorksheetTopics.IsActive &&
                    x.WorksheetTopics.Subject.IsActive)
                .OrderBy(x => x.displayorder)
                .Select(x => new PreGeneratedWorksheetCategoryDto
                {
                    WorksheetCategoryId = x.WorksheetCategoryId,
                    TopicId = x.TopicId,
                    CategoryName = x.categoryName,
                    Code = x.code,
                    Description = x.description,
                    DisplayOrder = x.displayorder
                })
                .ToListAsync(cancellationToken);
        }

    }
}
