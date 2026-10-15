using FluentValidation;
using kids_app.Dto.CommonApiDto;
using kids_app.Dto.TopicLevelConfiguration;
using kids_app.Services.Interface;
using Microsoft.AspNetCore.Mvc;

namespace kids_app.Controller
{
    [Route("api/[controller]")]
    [ApiController]
    public class TopicLevelConfigController : ControllerBase
    {
        private readonly ITopicLevelConfiguration _topicLevelConfiguration;
        private readonly IValidator<TopicLevelConfigurationDto> _validator;

        public TopicLevelConfigController(ITopicLevelConfiguration topicLevelConfiguration, IValidator<TopicLevelConfigurationDto> validator)
        {
            _topicLevelConfiguration = topicLevelConfiguration;
            _validator = validator;
        }
        [HttpGet]
        public async Task<IActionResult> GetTopicLevelConfig()
        {
            try
            {
                var subject = await _topicLevelConfiguration.GetTopicLevelConfig();

                return Ok(subject);
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError,
                    new ResponceDto<object>
                    {
                        Success = false,
                        Message = "An error occurred while getting TopicConfig.",
                        Data = null,
                        Errors = new List<string>
                        {
                            ex.Message
                        }
                    });

            }
        }

        [HttpPost]
        public async Task<IActionResult> AddTopicLevelConfig(TopicLevelConfigurationDto topicLevelConfigurationDto)
        {
            try
            {
                var validationResult = await _validator.ValidateAsync(topicLevelConfigurationDto);
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
                var subject = await _topicLevelConfiguration.AddTopicLevelConfig(topicLevelConfigurationDto);

                return Ok(subject);
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError,
                    new ResponceDto<object>
                    {
                        Success = false,
                        Message = "An error occurred while Aedding TopicConfig.",
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
