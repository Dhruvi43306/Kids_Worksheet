
//using kids_app.Data;
//using kids_app.Dto.PrintableWorksheet;
//using kids_app.Models;
//using Microsoft.EntityFrameworkCore;

//namespace kids_app.Services.PrintableWorksheet
//{
//    public class PrintableWorksheetService : IPrintableWorksheetService
//    {
//        private readonly AppDbContext _context;
        
//        public PrintableWorksheetService(AppDbContext context)
//        {
//            _context = context
//                ?? throw new ArgumentNullException(nameof(context));
//        }

//        // ==========================================
//        // 1. GET ALL ACTIVE SUBJECTS
//        // ==========================================

//        public async Task<List<PrintableSubjectDto>> GetSubjectsAsync()
//        {
//            return await _context.Set<Subject>()
//                .AsNoTracking()
//                .Where(s => s.IsActive)
//                .OrderBy(s => s.SubjectName)
//                .Select(s => new PrintableSubjectDto
//                {
//                    SubjectId = s.SubjectId,
//                    SubjectName = s.SubjectName,
//                    Slug = s.slug,

//                    WorksheetCount = _context
//                        .Set<PreGeneratedWorksheet>()
//                        .Count(w =>
//                            w.SubjectId == s.SubjectId &&
//                            w.IsActive)
//                })
//                .ToListAsync();
//        }

//        // ==========================================
//        // COMMON QUERY FOR SELECTED SUBJECT
//        // ==========================================

//        private IQueryable<PrintableWorksheetDto> BuildWorksheetQuery(
//            string subjectSlug)
//        {
//            var query =
//                from worksheet in _context
//                    .Set<PreGeneratedWorksheet>()
//                    .AsNoTracking()

//                join subject in _context
//                    .Set<Subject>()
//                    .AsNoTracking()
//                    on worksheet.SubjectId equals subject.SubjectId

//                join questionType in _context
//                    .Set<QuestionType>()
//                    .AsNoTracking()
//                    on worksheet.QuestionTypeId
//                    equals questionType.QuestionTypeId

//                join category in _context
//                    .Set<WorksheetCategory>()
//                    .AsNoTracking()
//                    on questionType.WorksheetCategoryId
//                    equals category.WorksheetCategoryId

//                join level in _context
//                    .Set<LearningLevel>()
//                    .AsNoTracking()
//                    on worksheet.LevelId equals level.LevelId

//                join difficulty in _context
//                    .Set<Difficulty>()
//                    .AsNoTracking()
//                    on worksheet.DifficultyId
//                    equals difficulty.DifficultyId

//                where subject.slug == subjectSlug
//                      && subject.IsActive
//                      && worksheet.IsActive

//                select new PrintableWorksheetDto
//                {
//                    PreGeneratedWorksheetId =
//                        worksheet.PreGeneratedWorksheetId,

//                    QuestionTypeId = worksheet.QuestionTypeId,

//                    WorksheetCategoryId =
//                        category.WorksheetCategoryId,

//                    CategoryName = category.categoryName,

//                    LevelId = worksheet.LevelId,
//                    LevelName = level.LevelName,

//                    DifficultyId = worksheet.DifficultyId,
//                    DifficultyName = difficulty.Name,

//                    WorksheetTitle = worksheet.WorksheetTitle,
//                    WorksheetUrl = worksheet.WorksheetUrl,
//                    ThumbnailUrl = worksheet.ThumbnailUrl,
//                    FileType = worksheet.FileType,
//                    DisplayOrder = worksheet.DisplayOrder
//                };

//            return query;
//        }

//        // ==========================================
//        // 2. GET FILTERS FOR SELECTED SUBJECT
//        // ==========================================

//        public async Task<PrintableWorksheetFiltersDto?> GetFiltersAsync(
//            string subjectSlug)
//        {
//            bool subjectExists = await _context.Set<Subject>()
//                .AnyAsync(s =>
//                    s.slug == subjectSlug &&
//                    s.IsActive);

//            if (!subjectExists)
//            {
//                return null;
//            }

//            var query = BuildWorksheetQuery(subjectSlug);

//            var categories = await query
//                .Select(x => new
//                {
//                    x.WorksheetCategoryId,
//                    x.CategoryName
//                })
//                .Distinct()
//                .OrderBy(x => x.CategoryName)
//                .Select(x => new PrintableFilterOptionDto
//                {
//                    Id = x.WorksheetCategoryId,
//                    Name = x.CategoryName
//                })
//                .ToListAsync();

//            var levels = await query
//                .Select(x => new
//                {
//                    x.LevelId,
//                    x.LevelName
//                })
//                .Distinct()
//                .OrderBy(x => x.LevelId)
//                .Select(x => new PrintableFilterOptionDto
//                {
//                    Id = x.LevelId,
//                    Name = x.LevelName
//                })
//                .ToListAsync();

//            var difficulties = await query
//                .Select(x => new
//                {
//                    x.DifficultyId,
//                    x.DifficultyName
//                })
//                .Distinct()
//                .OrderBy(x => x.DifficultyId)
//                .Select(x => new PrintableFilterOptionDto
//                {
//                    Id = x.DifficultyId,
//                    Name = x.DifficultyName
//                })
//                .ToListAsync();

//            return new PrintableWorksheetFiltersDto
//            {
//                Categories = categories,
//                Levels = levels,
//                Difficulties = difficulties
//            };
//        }

//        // ==========================================
//        // 3. GET WORKSHEETS USING FILTERS
//        // ==========================================

//        public async Task<List<PrintableWorksheetDto>?> GetWorksheetsAsync(
//            string subjectSlug,
//            int? categoryId,
//            int? levelId,
//            int? difficultyId)
//        {
//            bool subjectExists = await _context.Set<Subject>()
//                .AnyAsync(s =>
//                    s.slug == subjectSlug &&
//                    s.IsActive);

//            if (!subjectExists)
//            {
//                return null;
//            }

//            var query = BuildWorksheetQuery(subjectSlug);

//            if (categoryId.HasValue)
//            {
//                query = query.Where(x =>
//                    x.WorksheetCategoryId == categoryId.Value);
//            }

//            if (levelId.HasValue)
//            {
//                query = query.Where(x =>
//                    x.LevelId == levelId.Value);
//            }

//            if (difficultyId.HasValue)
//            {
//                query = query.Where(x =>
//                    x.DifficultyId == difficultyId.Value);
//            }

//            return await query
//                .OrderBy(x => x.DisplayOrder)
//                .ThenBy(x => x.WorksheetTitle)
//                .ToListAsync();
//        }
//    }
//}
