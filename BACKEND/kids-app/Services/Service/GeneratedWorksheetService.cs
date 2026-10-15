using kids_app.Data;
using kids_app.Dto.CommonApiDto;
using kids_app.Dto.GenratedWorkSheet;
using kids_app.Models;
using kids_app.Services.Interface;
using Microsoft.EntityFrameworkCore;

namespace kids_app.Services.Service
{
    public class GeneratedWorksheetService
        : IGeneratedWorksheetService
    {
        private readonly AppDbContext _context;

        public GeneratedWorksheetService(AppDbContext context)
        {
            _context = context;
        }

        // GET ALL
        public async Task<ResponceDto<List<GeneratedWorksheetResponseDto>>> GetAllAsync()
        {
            var response = new ResponceDto<List<GeneratedWorksheetResponseDto>>();

            var data = await _context.GeneratedWorksheets
                .AsNoTracking()
                .Select(x => new GeneratedWorksheetResponseDto
                {
                    GeneratedWorksheetId =
                        x.GeneratedWorksheetId,

                    TopicId =
                        x.TopicId,

                    LevelId =
                        x.LevelId,

                    DifficultyId =
                        x.DifficultyId,

                    VisualStyleId =
                        x.VisualStyleId,

                    QuestionCount =
                        x.QuestionCount,

                    WorksheetTitle =
                        x.WorksheetTitle,

                    SchoolName =
                        x.SchoolName,

                    StudentName =
                        x.StudentName,

                    GradeName =
                        x.GradeName,

                    Section =
                        x.Section,

                    TeacherName =
                        x.TeacherName,

                    CreatedAt =
                        x.CreatedAt
                })
                .ToListAsync();

            response.Success = true;

            response.Message ="Generated worksheets retrieved successfully.";

            response.Data = data;
          

            return response;
        }


        public async Task<ResponceDto<GeneratedWorksheetResponseDto?>>GetByIdAsync(long id)
        {
            var response =
                new ResponceDto<GeneratedWorksheetResponseDto?>();

            var data = await _context.GeneratedWorksheets
                .AsNoTracking()
                .Where(x =>
                    x.GeneratedWorksheetId == id)
                .Select(x => new GeneratedWorksheetResponseDto
                {
                    GeneratedWorksheetId =
                        x.GeneratedWorksheetId,

                    TopicId =
                        x.TopicId,

                    LevelId =
                        x.LevelId,

                    DifficultyId =
                        x.DifficultyId,

                    VisualStyleId =
                        x.VisualStyleId,

                    QuestionCount =
                        x.QuestionCount,

                    WorksheetTitle =
                        x.WorksheetTitle,

                    SchoolName =
                        x.SchoolName,

                    StudentName =
                        x.StudentName,

                    GradeName =
                        x.GradeName,

                    Section =
                        x.Section,

                    TeacherName =
                        x.TeacherName,

                    CreatedAt =
                        x.CreatedAt
                })
                .FirstOrDefaultAsync();

            if (data == null)
            {
                response.Success = false;

                response.Message =
                    "Generated worksheet not found.";

                return response;
            }

            response.Success = true;

            response.Message =
                "Generated worksheet retrieved successfully.";

            response.Data = data;

            return response;
        }


        public async Task<ResponceDto<GeneratedWorksheetResponseDto>>AddAsync(GeneratedWorksheetDto dto)
        {
            var response =new ResponceDto<GeneratedWorksheetResponseDto>();

            var topicExists =
                await _context.WorksheetTopics
                    .AnyAsync(x =>x.TopicId == dto.TopicId && x.IsActive);

            if (!topicExists)
            {
                response.Success = false;

                response.Message =
                    "Topic not found.";

                return response;
            }


            var levelExists =
                await _context.LearningLevels.AnyAsync(x =>x.LevelId == dto.LevelId &&x.IsActive);

            if (!levelExists)
            {
                response.Success = false;

                response.Message =
                    "Learning level not found.";

                return response;
            }


            var difficultyExists =
                await _context.Difficulties
                    .AnyAsync(x =>
                        x.DifficultyId == dto.DifficultyId &&
                        x.IsActive);

            if (!difficultyExists)
            {
                response.Success = false;

                response.Message =
                    "Difficulty not found.";

                return response;
            }


            if (dto.VisualStyleId.HasValue)
            {
                var visualStyleExists =
                    await _context.VisualStyles
                        .AnyAsync(x =>
                            x.VisualStyleId ==
                                dto.VisualStyleId.Value &&
                            x.IsActive);

                if (!visualStyleExists)
                {
                    response.Success = false;

                    response.Message =
                        "Visual style not found.";

                    return response;
                }
            }


            var entity = new GeneratedWorksheet
            {
                TopicId =
                    dto.TopicId,

                LevelId =
                    dto.LevelId,

                DifficultyId =
                    dto.DifficultyId,

                VisualStyleId =
                    dto.VisualStyleId,

                QuestionCount =
                    dto.QuestionCount,

                WorksheetTitle =
                    dto.WorksheetTitle,

                SchoolName =
                    dto.SchoolName,

                StudentName =
                    dto.StudentName,

                GradeName =
                    dto.GradeName,

                Section =
                    dto.Section,

                TeacherName =
                    dto.TeacherName,

                CreatedAt =
                    DateTime.UtcNow
            };


            await _context.GeneratedWorksheets
                .AddAsync(entity);

            await _context.SaveChangesAsync();


            response.Success = true;

            response.Message =
                "Generated worksheet created successfully.";

            response.Data =
                new GeneratedWorksheetResponseDto
                {
                    GeneratedWorksheetId =
                        entity.GeneratedWorksheetId,

                    TopicId =
                        entity.TopicId,

                    LevelId =
                        entity.LevelId,

                    DifficultyId =
                        entity.DifficultyId,

                    VisualStyleId =
                        entity.VisualStyleId,

                    QuestionCount =
                        entity.QuestionCount,

                    WorksheetTitle =
                        entity.WorksheetTitle,

                    SchoolName =
                        entity.SchoolName,

                    StudentName =
                        entity.StudentName,

                    GradeName =
                        entity.GradeName,

                    Section =
                        entity.Section,

                    TeacherName =
                        entity.TeacherName,

                    CreatedAt =
                        entity.CreatedAt
                };

            return response;
        }


        public async Task<ResponceDto<GeneratedWorksheetResponseDto?>>UpdateAsync(long id,GeneratedWorksheetDto dto)
        {
            var response =new ResponceDto<GeneratedWorksheetResponseDto?>();

            var entity =await _context.GeneratedWorksheets.FirstOrDefaultAsync(x =>
                        x.GeneratedWorksheetId == id);

            if (entity == null)
            {
                response.Success = false;

                response.Message =
                    "Generated worksheet not found.";

                return response;
            }


            // Check Topic
            var topicExists =
                await _context.WorksheetTopics
                    .AnyAsync(x =>
                        x.TopicId == dto.TopicId &&
                        x.IsActive);

            if (!topicExists)
            {
                response.Success = false;

                response.Message =
                    "Topic not found.";

                return response;
            }


            var levelExists =
                await _context.LearningLevels
                    .AnyAsync(x =>
                        x.LevelId == dto.LevelId &&
                        x.IsActive);

            if (!levelExists)
            {
                response.Success = false;

                response.Message =
                    "Learning level not found.";

                return response;
            }


            // Check Difficulty
            var difficultyExists =
                await _context.Difficulties
                    .AnyAsync(x =>
                        x.DifficultyId == dto.DifficultyId &&
                        x.IsActive);

            if (!difficultyExists)
            {
                response.Success = false;

                response.Message =
                    "Difficulty not found.";

                return response;
            }

            if (dto.VisualStyleId.HasValue)
            {
                var visualStyleExists =
                    await _context.VisualStyles
                        .AnyAsync(x =>
                            x.VisualStyleId ==
                                dto.VisualStyleId.Value &&
                            x.IsActive);

                if (!visualStyleExists)
                {
                    response.Success = false;

                    response.Message =
                        "Visual style not found.";

                    return response;
                }
            }


            
            entity.TopicId =
                dto.TopicId;

            entity.LevelId =
                dto.LevelId;

            entity.DifficultyId =
                dto.DifficultyId;

            entity.VisualStyleId =
                dto.VisualStyleId;

            entity.QuestionCount =
                dto.QuestionCount;

            entity.WorksheetTitle =
                dto.WorksheetTitle;

            entity.SchoolName =
                dto.SchoolName;

            entity.StudentName =
                dto.StudentName;

            entity.GradeName =
                dto.GradeName;

            entity.Section =
                dto.Section;

            entity.TeacherName =
                dto.TeacherName;

            await _context.SaveChangesAsync();


            response.Success = true;

            response.Message =
                "Generated worksheet updated successfully.";

            response.Data =
                new GeneratedWorksheetResponseDto
                {
                    GeneratedWorksheetId =
                        entity.GeneratedWorksheetId,

                    TopicId =
                        entity.TopicId,

                    LevelId =
                        entity.LevelId,

                    DifficultyId =
                        entity.DifficultyId,

                    VisualStyleId =
                        entity.VisualStyleId,

                    QuestionCount =
                        entity.QuestionCount,

                    WorksheetTitle =
                        entity.WorksheetTitle,

                    SchoolName =
                        entity.SchoolName,

                    StudentName =
                        entity.StudentName,

                    GradeName =
                        entity.GradeName,

                    Section =
                        entity.Section,

                    TeacherName =
                        entity.TeacherName,

                    CreatedAt =
                        entity.CreatedAt
                };

            return response;
        }


        public async Task<ResponceDto<bool>>
            DeleteAsync(long id)
        {
            var response =
                new ResponceDto<bool>();

            var entity =
                await _context.GeneratedWorksheets
                    .FirstOrDefaultAsync(x =>
                        x.GeneratedWorksheetId == id);

            if (entity == null)
            {
                response.Success = false;

                response.Message =
                    "Generated worksheet not found.";

                response.Data = false;

                return response;
            }

            _context.GeneratedWorksheets
                .Remove(entity);

            await _context.SaveChangesAsync();

            response.Success = true;

            response.Message =
                "Generated worksheet deleted successfully.";

            response.Data = true;

            return response;
        }

    }
}