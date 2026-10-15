using kids_app.Dto.CommonApiDto;
using kids_app.Dto.QuestionType;

namespace kids_app.Services.Interface
{
    public interface IQuestionTypeService
    {
        public Task<ResponceDto<List<QuestionTypeDto>>> GetQuestionType();

        public Task<ResponceDto<QuestionTypeDto>> AddQuestionType(QuestionTypeDto questionTypeDto);

    }
}
