using kids_app.Data;
using kids_app.Dto.CommonApiDto;
using kids_app.Dto.QuestionType;
using kids_app.Dto.WorksheetCategory;
using kids_app.Models;
using kids_app.Services.Interface;
using Microsoft.EntityFrameworkCore;

namespace kids_app.Services
{
    public class WorksheetCategoryService : IWorksheetCategory
    {
        private readonly AppDbContext _context;

        public WorksheetCategoryService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<List<WorksheetCategoryDto>>GetCategoriesByTopicAndLevelAsync(int topicId,int levelId)
        {

            var configuration = await _context.TopicLevelConfigurations
                    .AsNoTracking()
                    .FirstOrDefaultAsync(x =>
                        x.TopicId == topicId &&
                        x.LevelId == levelId &&
                        x.IsActive);

            if (configuration == null)
            {
                return new List<WorksheetCategoryDto>();
            }

            int configurationId = configuration.TopicLevelConfigurationId;



            var allowedQuestionTypeIds = await _context.TopicLevelQuestionTypes
                    .AsNoTracking()
                    .Where(x =>
                        x.TopicLevelConfigurationId == configurationId)
                    .Select(x => x.QuestionTypeId)
                    .Distinct()
                    .ToListAsync();

            if (allowedQuestionTypeIds.Count == 0)
            {
                return new List<WorksheetCategoryDto>();
            }


            var questionTypesFromDb = await _context.QuestionTypes
                    .AsNoTracking()
                    .Where(q =>allowedQuestionTypeIds.Contains(q.QuestionTypeId) && q.IsActive)
                    .Select(q => new QuestionTypeDto
                    {
                        QuestionTypeId = q.QuestionTypeId,
                        TypeName = q.TypeName,
                        Description = q.Description,
                        WorksheetCategoryId =
                            q.WorksheetCategoryId
                    })
                    .ToListAsync();


            var categories =
                await _context.worksheetCategories
                    .AsNoTracking()
                    .Where(c =>
                        c.TopicId == topicId &&
                        c.isActive)
                    .OrderBy(c => c.displayorder)
                    .Select(c => new WorksheetCategoryDto
                    {
                        WorksheetCategoryId =
                            c.WorksheetCategoryId,

                        categoryName =
                            c.categoryName,

                        code =
                            c.code,

                        description =
                            c.description,

                        displayorder =
                            c.displayorder,

                        questionTypes =
                            new List<QuestionTypeDto>()
                    })
                    .ToListAsync();



            foreach (var category in categories)
            {
                category.questionTypes =
                    questionTypesFromDb
                        .Where(q =>
                            q.WorksheetCategoryId ==
                            category.WorksheetCategoryId)
                        .ToList();
            }



            categories =
                categories
                    .Where(c =>
                        c.questionTypes != null &&
                        c.questionTypes.Count > 0)
                    .OrderBy(c => c.displayorder)
                    .ToList();



            return categories;
        }

        public async Task<ResponceDto<WorksheetCategoryDto>> AddWorkSheetTopicCategory(WorksheetCategoryDto worksheetCategoryDto)
        {
            var worksheet = new WorksheetCategory
            {

                categoryName = worksheetCategoryDto.categoryName,
                code = worksheetCategoryDto.code,
                description = worksheetCategoryDto.description,
                displayorder = worksheetCategoryDto.displayorder,
                isActive = worksheetCategoryDto.isActive
            };

            await _context.worksheetCategories.AddAsync(worksheet);
            await _context.SaveChangesAsync();

            return new ResponceDto<WorksheetCategoryDto>
            {
                Success = true,
                Message = "WorkSheetTopic Added SucceFully",
                Data = new WorksheetCategoryDto
                {
                    WorksheetCategoryId = worksheetCategoryDto.WorksheetCategoryId,
                    categoryName = worksheetCategoryDto.categoryName,
                    code = worksheetCategoryDto.code,
                    description = worksheetCategoryDto.description,
                    displayorder = worksheetCategoryDto.displayorder,
                    isActive = worksheetCategoryDto.isActive
                },
                Errors = new List<string>()
            };
        }
    }
}