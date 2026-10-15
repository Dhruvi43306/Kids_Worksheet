using FluentValidation;
using kids_app.Dto.CommonApiDto;
using kids_app.Dto.VisuleStyle;
using kids_app.Services.Interface;
using Microsoft.AspNetCore.Mvc;

namespace kids_app.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TopicLevelVisualStyleController : ControllerBase
    {
        private readonly ITopicLevelVisualStyleService _service;
        private readonly IValidator<TopicLevelVisualStyleDto> _validator;

        public TopicLevelVisualStyleController(ITopicLevelVisualStyleService service, IValidator<TopicLevelVisualStyleDto> validator)
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

        [HttpGet("{topicLevelConfigurationId}/{visualStyleId}")]
        public async Task<IActionResult> GetById(int topicLevelConfigurationId,int visualStyleId)
        {
            var result = await _service.GetByIdAsync(topicLevelConfigurationId,visualStyleId);

            if (result == null)
            {
                return NotFound(new
                {
                    message = "Topic level visual style not found."
                });
            }

            return Ok(result);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] TopicLevelVisualStyleDto dto)
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

                return CreatedAtAction(nameof(GetById),
                    new
                    {
                        topicLevelConfigurationId =
                            result.TopicLevelConfigurationId,

                        visualStyleId =
                            result.VisualStyleId
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

        [HttpDelete("{topicLevelConfigurationId}/{visualStyleId}")]
        public async Task<IActionResult> Delete(
            int topicLevelConfigurationId,
            int visualStyleId)
        {
            var deleted = await _service.DeleteAsync(
                topicLevelConfigurationId,
                visualStyleId);

            if (!deleted)
            {
                return NotFound(new
                {
                    message = "Topic level visual style not found."
                });
            }

            return Ok(new
            {
                message = "Visual style removed successfully."
            });
        }
    }
}