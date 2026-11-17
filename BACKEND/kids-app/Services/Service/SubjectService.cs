
using kids_app.Data;
using kids_app.Dto.CommonApiDto;
using kids_app.Dto.Subject;
using kids_app.Models;
using kids_app.Services.Interface;
using Microsoft.EntityFrameworkCore;

namespace kids_app.Services.Service
{
    public class SubjectService : ISubjectService
    {
        private readonly AppDbContext _context;

        public SubjectService(AppDbContext context)
        {
            _context = context
                ?? throw new ArgumentNullException(nameof(context));
        }

        // ==========================================
        // 1. ADD SUBJECT
        // ==========================================
        public async Task<ResponceDto<SubjectDto>> AddSubject(
            SubjectDto subjectDto)
        {
            var subject = new Subject
            {
                SubjectName = subjectDto.SubjectName,
                slug = subjectDto.slug,
                IsActive = subjectDto.IsActive
            };

            await _context.Subjects.AddAsync(subject);
            await _context.SaveChangesAsync();

            return new ResponceDto<SubjectDto>
            {
                Success = true,
                Message = "Subject Added Successfully",
                Data = new SubjectDto
                {
                    SubjectId = subject.SubjectId,
                    SubjectName = subject.SubjectName,
                    slug = subject.slug,
                    IsActive = subject.IsActive
                },
                Errors = new List<string>()
            };
        }

        // ==========================================
        // 2. GET ALL ACTIVE SUBJECTS
        // ==========================================
        public async Task<ResponceDto<List<SubjectDto>>> GetSubject()
        {
            var subjects = await _context.Subjects
                .AsNoTracking()
                .Where(x => x.IsActive)
                .OrderBy(x => x.SubjectName)
                .Select(x => new SubjectDto
                {
                    SubjectId = x.SubjectId,
                    SubjectName = x.SubjectName,
                    slug = x.slug,
                    IsActive = x.IsActive
                })
                .ToListAsync();

            return new ResponceDto<List<SubjectDto>>
            {
                Success = true,
                Message = "Subjects Retrieved Successfully",
                Data = subjects,
                Errors = new List<string>()
            };
        }
    }
}
