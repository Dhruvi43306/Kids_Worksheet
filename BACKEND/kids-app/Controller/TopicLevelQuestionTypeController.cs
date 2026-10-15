using FluentValidation;
using kids_app.Dto.CommonApiDto;
using kids_app.Dto.QuestionType;
using kids_app.Services.Interface;
using Microsoft.AspNetCore.Mvc;

namespace kids_app.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TopicLevelQuestionTypeController
        : ControllerBase
    {
        private readonly ITopicLevelQuestionTypeService _service;
        private readonly IValidator<TopicLevelQuestionTypeDto> _validator;

        public TopicLevelQuestionTypeController(ITopicLevelQuestionTypeService service, IValidator<TopicLevelQuestionTypeDto> validator)
        {
            _service = service;
            _validator = validator;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var result = await _service.GetAllAsync();

            return Ok(result);
        }

        [HttpGet("{topicLevelConfigurationId}/{questionTypeId}")]
        public async Task<IActionResult> GetById(
            int topicLevelConfigurationId,
            int questionTypeId)
        {
            var result = await _service.GetByIdAsync(
                topicLevelConfigurationId,
                questionTypeId);

            if (result == null)
            {
                return NotFound(new
                {
                    message ="Topic level question type not found."
                });
            }

            return Ok(result);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] TopicLevelQuestionTypeDto dto)
        {
            try
            {
                var validationResult = await _validator.ValidateAsync(dto);
                if (!validationResult.IsValid)
                {
                    return BadRequest(new ResponceDto<object>
                      {
                          Success = false,
                          Message = "Validation Failed",
                          Data = null,
                          Errors = validationResult.Errors
                                      .Select(x => x.ErrorMessage)
                                      .ToList()
                      });
                }
                var result = await _service.CreateAsync(dto);

                return CreatedAtAction(
                    nameof(GetById),
                    new
                    {
                        topicLevelConfigurationId = result.TopicLevelConfigurationId,

                        questionTypeId = result.QuestionTypeId
                    },
                    result);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new
                {
                    message = ex.Message
                });
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(new
                {
                    message = ex.Message
                });
            }
        }

        [HttpDelete("{topicLevelConfigurationId}/{questionTypeId}")]
        public async Task<IActionResult> Delete(int topicLevelConfigurationId,int questionTypeId)
        {
            var deleted = await _service.DeleteAsync(topicLevelConfigurationId,questionTypeId);

            if (!deleted)
            {
                return NotFound(new
                {
                    message ="Topic level question type not found."
                });
            }

            return Ok(new
            {
                message = "Question type removed successfully."
            });
        }
    }
}