using FluentValidation;
using kids_app.Dto.CommonApiDto;
using kids_app.Dto.QuestionCountOption;
using kids_app.Dto.QuestionType;
using kids_app.Services.Interface;
using Microsoft.AspNetCore.Mvc;

namespace kids_app.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class QuestionCountOptionController: ControllerBase
    {
        private readonly IQuestionCountOptionService _service;
        private readonly IValidator<QuestionCountOptionDto> _validator;

        public QuestionCountOptionController(IQuestionCountOptionService service, IValidator<QuestionCountOptionDto> validator)
        {
            _service = service;
            _validator = validator;
        }
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var result =await _service.GetAllAsync();

            return Ok(result);
        }

        [HttpGet("configuration/{topicLevelConfigurationId}")]
        public async Task<IActionResult>
            GetByConfigurationId(int topicLevelConfigurationId)
        {
            var result =await _service.GetByConfigurationIdAsync(topicLevelConfigurationId);

            return Ok(result);
        }

        [HttpGet("{questionCountOptionId}")]
        public async Task<IActionResult> GetById(
            int questionCountOptionId)
        {
            var result =
                await _service.GetByIdAsync(
                    questionCountOptionId);

            if (result == null)
            {
                return NotFound(new
                {
                    message ="Question count option not found."
                });
            }

            return Ok(result);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] QuestionCountOptionDto dto)
        {
            try
            {
                var validationResult = await _validator.ValidateAsync(dto);
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
                var result = await _service.CreateAsync(dto);

                return CreatedAtAction(
                    nameof(GetById),
                    new
                    {
                        questionCountOptionId = result.QuestionCountOptionId
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

        [HttpPut("{questionCountOptionId}")]
        public async Task<IActionResult> Update(
            int questionCountOptionId,
            [FromBody] QuestionCountOptionDto dto)
        {
            try
            {
                var result = await _service.UpdateAsync(questionCountOptionId,dto);

                if (result == null)
                {
                    return NotFound(new
                    {
                        message ="Question count option not found."
                    });
                }

                return Ok(result);
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

        [HttpDelete("{questionCountOptionId}")]
        public async Task<IActionResult> Delete(
            int questionCountOptionId)
        {
            var deleted =
                await _service.DeleteAsync(
                    questionCountOptionId);

            if (!deleted)
            {
                return NotFound(new
                {
                    message ="Question count option not found."
                });
            }

            return Ok(new
            {
                message ="Question count option deleted successfully."
            });
        }
    }
}