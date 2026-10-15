using kids_app.Dto.CommonApiDto;
using kids_app.Dto.Subject;

namespace kids_app.Services.Interface
{
    public interface ISubjectService
    {
        public Task<ResponceDto<List<SubjectDto>>> GetSubject();

        public Task<ResponceDto<SubjectDto>> AddSubject(SubjectDto subjectDto);

    }
}
