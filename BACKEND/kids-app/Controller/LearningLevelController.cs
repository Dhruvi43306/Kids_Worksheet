using FluentValidation;
using kids_app.Dto.CommonApiDto;
using kids_app.Dto.LearningLevel;
using kids_app.Services.Interface;
using Microsoft.AspNetCore.Mvc;

namespace kids_app.Controller
{
    [Route("api/[controller]")]
    [ApiController]
    public class LearningLevelController : ControllerBase
    {
        private readonly ILearningLevel _learningLevel;
        private readonly IValidator<LearningLevelDto> _validator;

        public LearningLevelController(ILearningLevel learningLevel, IValidator<LearningLevelDto> validator)
        {
            _learningLevel = learningLevel;
            _validator = validator;
        }


        [HttpGet]
        public async Task<IActionResult> GetLearningLevel()
        {
            try
            {
                var level = await _learningLevel.GetLearningLevel();

                return Ok(level);
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError,
                    new ResponceDto<object>
                    {
                        Success = false,
                        Message = "An error occurred while getting level.",
                        Data = null,
                        Errors = new List<string>
                        {
                            ex.Message
                        }
                    });

            }
        }

        [HttpPost]
        public async Task<IActionResult> AddLearningLevel(LearningLevelDto learningLevelDto)
        {
            try
            {
                var validationResult = await _validator.ValidateAsync(learningLevelDto);
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
                var subject = await _learningLevel.AddLearningLevel(learningLevelDto);

                return Ok(subject);
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError,
                    new ResponceDto<object>
                    {
                        Success = false,
                        Message = "An error occurred while Aedding level.",
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
