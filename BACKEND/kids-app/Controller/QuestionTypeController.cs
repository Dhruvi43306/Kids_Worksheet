using FluentValidation;
using kids_app.Dto.CommonApiDto;
using kids_app.Dto.Difficulty;
using kids_app.Dto.QuestionType;
using kids_app.Services.Interface;
using Microsoft.AspNetCore.Mvc;

namespace kids_app.Controller
{
    [Route("api/[controller]")]
    [ApiController]
    public class QuestionTypeController : ControllerBase
    {
        private readonly IQuestionTypeService _questionTypeservice;
        private readonly IValidator<QuestionTypeDto> _validator;

        public QuestionTypeController(IQuestionTypeService questionTypeservice, IValidator<QuestionTypeDto> validator)
        {
            _questionTypeservice = questionTypeservice;
            _validator = validator;
        }
        [HttpGet]
        public async Task<IActionResult> GetQuestionType()
        {
            try
            {
                var level = await _questionTypeservice.GetQuestionType();

                return Ok(level);
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError,
                    new ResponceDto<object>
                    {
                        Success = false,
                        Message = "An error occurred while getting question.",
                        Data = null,
                        Errors = new List<string>
                        {
                            ex.Message
                        }
                    });

            }
        }

        [HttpPost]
        public async Task<IActionResult> AddLearningLevel(QuestionTypeDto questionTypeDto)
        {
            try
            {
                var validationResult = await _validator.ValidateAsync(questionTypeDto);
                if (!validationResult.IsValid)
                {
                    return BadRequest(
                        new ResponceDto<object>
                        {
                            Success = false,
                            Message = "Validation Failed",
                            Data = null,
                            Errors = validationResult.Errors
                                        .Select(x => x.ErrorMessage)
                                        .ToList()
                        });
                }
                var subject = await _questionTypeservice.AddQuestionType(questionTypeDto);

                return Ok(subject);
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError,
                    new ResponceDto<object>
                    {
                        Success = false,
                        Message = "An error occurred while Aedding question.",
                        Data = null,
                        Errors = new List<string>
                        {
                            ex.Message
                        }
                    });

            }
        }


    }
}
