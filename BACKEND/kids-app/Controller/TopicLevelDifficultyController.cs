using FluentValidation;
using kids_app.Dto.CommonApiDto;
using kids_app.Dto.Difficulty;
using kids_app.Services.Interface;
using Microsoft.AspNetCore.Mvc;

namespace kids_app.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TopicLevelDifficultyController : ControllerBase
    {
        private readonly ITopicLevelDifficultyService _service;
        private readonly IValidator<TopicLevelDifficultyDto> _validator;

        public TopicLevelDifficultyController(ITopicLevelDifficultyService service, IValidator<TopicLevelDifficultyDto> validator)
        {
            _service = service;
            _validator = validator;
        }


        [HttpPost]
        public async Task<IActionResult> Add([FromBody] TopicLevelDifficultyDto dto)
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
            var response = await _service.AddAsync(dto);

            if (!response.Success)
            {
                return BadRequest(response);
            }

            return Ok(response);
        }


  

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var response = await _service.GetAllAsync();

            return Ok(response);
        }


        [HttpGet("{topicLevelConfigurationId:int}/{difficultyId:int}")]
        public async Task<IActionResult> GetById(
            int topicLevelConfigurationId,
            int difficultyId)
        {
            var response = await _service.GetByIdAsync(
                topicLevelConfigurationId,
                difficultyId);

            if (!response.Success)
            {
                return NotFound(response);
            }

            return Ok(response);
        }



        [HttpDelete("{topicLevelConfigurationId:int}/{difficultyId:int}")]
        public async Task<IActionResult> Delete(
            int topicLevelConfigurationId,
            int difficultyId)
        {
            var response = await _service.DeleteAsync(
                topicLevelConfigurationId,
                difficultyId);

            if (!response.Success)
            {
                return NotFound(response);
            }

            return Ok(response);
        }
    }
}