using kids_app.Data;
using kids_app.Dto.CommonApiDto;
using kids_app.Dto.Subject;
using kids_app.Dto.WorksheetTopic;
using kids_app.Models;
using kids_app.Services.Interface;
using Microsoft.EntityFrameworkCore;

namespace kids_app.Services.Service
{
    public class WorkSheetTopic:IWorkSheetService
    {
        private readonly IConfiguration _configuration;
        private readonly AppDbContext _context;

        public WorkSheetTopic(IConfiguration configuration,AppDbContext context)
        {
            _configuration = configuration;
            _context = context;
        }
        public async Task<ResponceDto<WorksheetTopicDto>> AddWorkSheetTopic(WorksheetTopicDto workSheetTopicdto)
        {
            var worksheet = new WorksheetTopics
            {

                TopicName = workSheetTopicdto.TopicName,
                Description = workSheetTopicdto.Description,
                SubjectId = workSheetTopicdto.SubjectId,
                Slug = workSheetTopicdto.Slug
            };

            await _context.WorksheetTopics.AddAsync(worksheet);
            await _context.SaveChangesAsync();

            return new ResponceDto<WorksheetTopicDto>
            {
                Success = true,
                Message = "WorkSheetTopic Added SucceFully",
                Data = new WorksheetTopicDto
                {
                    TopicName = workSheetTopicdto.TopicName,
                    Description = workSheetTopicdto.Description,
                    SubjectId = workSheetTopicdto.SubjectId,
                    Slug = workSheetTopicdto.Slug
                },
                Errors = new List<string>()
            };
        }

        public async Task<ResponceDto<List<WorksheetTopicDto>>> GetWorkSheetTopic()
        {
            var worksheet = await _context.WorksheetTopics
                           .Select(x => new WorksheetTopicDto
                           {
                               TopicId = x.TopicId,
                               SubjectId = x.SubjectId,
                               TopicName = x.TopicName,
                               Slug = x.Slug,
                               Description = x.Description
                           })
                           .ToListAsync();
            return new ResponceDto<List<WorksheetTopicDto>>
            {
                Success = true,
                Message = "WorkSheetTopic Get all SucceFully",
                Data = worksheet,
                Errors = new List<string>()
            };

        }

        public async Task<ResponceDto<List<WorksheetTopicDto>>>
            GetWorkSheetTopicBySubject(string subjectSlug)
        {
            // First find the subject using its slug
            var subject = await _context.Subjects
                .FirstOrDefaultAsync(x =>
                    x.slug == subjectSlug &&
                    x.IsActive
                );

            if (subject == null)
            {
                return new ResponceDto<List<WorksheetTopicDto>>
                {
                    Success = false,
                    Message = $"Subject '{subjectSlug}' not found.",
                    Data = new List<WorksheetTopicDto>(),
                    Errors = new List<string>
                    {
                        "Subject not found."
                    }
                };
            }

            var worksheetTopics = await _context.WorksheetTopics
                .Where(x =>
                    x.SubjectId == subject.SubjectId &&
                    x.IsActive
                )
                .OrderBy(x => x.TopicId)
                .Select(x => new WorksheetTopicDto
                {
                    TopicId = x.TopicId,
                    SubjectId = x.SubjectId,
                    TopicName = x.TopicName,
                    Slug = x.Slug,
                    Description = x.Description
                })
                .ToListAsync();

            return new ResponceDto<List<WorksheetTopicDto>>
            {
                Success = true,
                Message = "Worksheet Topics Get Successfully",
                Data = worksheetTopics,
                Errors = new List<string>()
            };
        }
        public async Task<ResponceDto<WorksheetTopicDto>> GetWorkSheetTopicBySlug(
    string subjectSlug,
    string slug)
        {
            var worksheet = await _context.WorksheetTopics
                .Where(x =>
                    x.Slug == slug &&
                    x.IsActive &&
                    x.Subject.slug == subjectSlug
                )
                .Select(x => new WorksheetTopicDto
                {
                    TopicId = x.TopicId,
                    SubjectId = x.SubjectId,
                    TopicName = x.TopicName,
                    Slug = x.Slug,
                    Description = x.Description
                })
                .FirstOrDefaultAsync();

            if (worksheet == null)
            {
                return new ResponceDto<WorksheetTopicDto>
                {
                    Success = false,
                    Message = "Worksheet topic not found.",
                    Data = null,
                    Errors = new List<string>
            {
                "Worksheet topic does not exist."
            }
                };
            }

            return new ResponceDto<WorksheetTopicDto>
            {
                Success = true,
                Message = "Worksheet topic fetched successfully.",
                Data = worksheet,
                Errors = new List<string>()
            };
        }
    }
}
