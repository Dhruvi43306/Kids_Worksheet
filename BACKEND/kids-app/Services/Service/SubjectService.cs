using kids_app.Data;
using kids_app.Dto.CommonApiDto;
using kids_app.Dto.Subject;
using kids_app.Models;
using kids_app.Services.Interface;
using Microsoft.EntityFrameworkCore;

namespace kids_app.Services.Service
{
    public class SubjectService:ISubjectService
    {
        private readonly AppDbContext _context;
        private readonly IConfiguration _configuration;

        public SubjectService(AppDbContext context,IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        public async Task<ResponceDto<SubjectDto>> AddSubject(SubjectDto subjectDto)
        {
            var subject = new Subject
            {
                SubjectName = subjectDto.SubjectName,
                slug = subjectDto.slug
            };
            await _context.Subjects.AddAsync(subject);
            await _context.SaveChangesAsync();

            return new ResponceDto<SubjectDto>
            {
                Success = true,
                Message = "Subject Added SucceFully",
                Data = new SubjectDto
                {
                    SubjectName = subject.SubjectName,
                    slug = subject.slug
                },
                Errors = new List<string>()
            };
        }

        public async Task<ResponceDto<List<SubjectDto>>> GetSubject()
        {
            var subjects = await _context.Subjects
                           .Select(x => new SubjectDto
                           {
                               SubjectName = x.SubjectName,
                               slug = x.slug
                           })
                           .ToListAsync();
            return new ResponceDto<List<SubjectDto>>
            {
                Success = true,
                Message = "Subject Get all SucceFully",
                Data = subjects,
                Errors = new List<string>()
            };

        }
    }
}
