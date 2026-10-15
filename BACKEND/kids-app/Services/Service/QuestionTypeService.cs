using kids_app.Data;
using kids_app.Dto.CommonApiDto;
using kids_app.Dto.QuestionType;
using kids_app.Models;
using kids_app.Services.Interface;
using Microsoft.EntityFrameworkCore;

namespace kids_app.Services.Service
{
    public class QuestionTypeService:IQuestionTypeService
    {
        private readonly AppDbContext _context;
        private readonly IConfiguration _configuration;

        public QuestionTypeService(AppDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }
        public async Task<ResponceDto<QuestionTypeDto>> AddQuestionType(QuestionTypeDto questionTypeDto)
        {
            var question = new QuestionType
            {
                TypeName = questionTypeDto.TypeName,
                Code = questionTypeDto.Code,
                WorksheetCategoryId = questionTypeDto.WorksheetCategoryId,
                Description = questionTypeDto.Description,
                RendererKey = questionTypeDto.RendererKey,
            };
            await _context.QuestionTypes.AddAsync(question);
            await _context.SaveChangesAsync();

            return new ResponceDto<QuestionTypeDto>
            {
                Success = true,
                Message = "Question Added SucceFully",
                Data = new QuestionTypeDto
                {
                    WorksheetCategoryId = questionTypeDto.WorksheetCategoryId,
                    QuestionTypeId = question.QuestionTypeId,
                    TypeName = questionTypeDto.TypeName,
                    Code = questionTypeDto.Code,
                    Description = questionTypeDto.Description,
                    RendererKey = question.RendererKey,
                },
                Errors = new List<string>()
            };
        }

        public async Task<ResponceDto<List<QuestionTypeDto>>> GetQuestionType()
        {
            var questions = await _context.QuestionTypes
                           .Select(x => new QuestionTypeDto
                           {
                               WorksheetCategoryId = x.WorksheetCategoryId,
                               QuestionTypeId = x.QuestionTypeId,
                               TypeName = x.TypeName,
                               Code = x.Code,
                               Description = x.Description,
                               RendererKey = x.RendererKey,
                           })
                           .ToListAsync();
            return new ResponceDto<List<QuestionTypeDto>>
            {
                Success = true,
                Message = "Question Get all SucceFully",
                Data = questions,
                Errors = new List<string>()
            };

        }
    }
}
