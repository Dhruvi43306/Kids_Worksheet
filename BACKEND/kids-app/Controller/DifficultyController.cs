using FluentValidation;
using kids_app.Dto.CommonApiDto;
using kids_app.Dto.Difficulty;
using kids_app.Dto.Subject;
using kids_app.Services.Interface;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace kids_app.Controller
{
    [Route("api/[controller]")]
    [ApiController]
    public class DifficultyController : ControllerBase
    {
        private readonly IDifficultyService _difficultyService;
        private readonly IValidator<DifficultyDto> _validator;

        public DifficultyController(IDifficultyService difficultyService, IValidator<DifficultyDto> validator)
        {
            _difficultyService = difficultyService;
            _validator = validator;
        }

        [HttpGet]
        public async Task<IActionResult> GetSubject()
        {
            try
            {
                var subject = await _difficultyService.GetDifficulty();

                return Ok(subject);
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError,
                    new ResponceDto<object>
                    {
                        Success = false,
                        Message = "An error occurred while getting Difficulty.",
                        Data = null,
                        Errors = new List<string>
                        {
                            ex.Message
                        }
                    });

            }
        }

        [HttpPost]
        public async Task<IActionResult> AddDifficluty(DifficultyDto difficultyDto)
        {
            try
            {
                var validationResult = await _validator.ValidateAsync(difficultyDto);
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
                var difficulty = await _difficultyService.AddDifficulty(difficultyDto);

                return Ok(difficulty);
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError,
                    new ResponceDto<object>
                    {
                        Success = false,
                        Message = "An error occurred while Aedding subjects.",
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
