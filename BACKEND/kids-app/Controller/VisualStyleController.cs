using FluentValidation;
using kids_app.Dto.CommonApiDto;
using kids_app.Dto.IVisuleStyle;
using kids_app.Dto.Subject;
using kids_app.Services.Interface;
using kids_app.Services.Service;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace kids_app.Controller
{
    [Route("api/[controller]")]
    [ApiController]
    public class VisualStyleController : ControllerBase
    {
        private readonly IVisualStyleService _visualStyleService;
        private readonly IValidator<IVisualStyleDto> _validator;

        public VisualStyleController(IVisualStyleService visualStyleService,IValidator<IVisualStyleDto> validator)
        {
            _visualStyleService = visualStyleService; 
            _validator = validator;
        }

        [HttpGet]
        public async Task<IActionResult> GetVisualStyle()
        {
            try
            {
                var subject = await _visualStyleService.GetVisualStyle();

                return Ok(subject);
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError,
                    new ResponceDto<object>
                    {
                        Success = false,
                        Message = "An error occurred while getting style.",
                        Data = null,
                        Errors = new List<string>
                        {
                            ex.Message
                        }
                    });

            }
        }

        [HttpPost]
        public async Task<IActionResult> AddSubject(IVisualStyleDto visualStyleDto)
        {
            try
            {
                var validationResult = await _validator.ValidateAsync(visualStyleDto);
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
                var subject = await _visualStyleService.AddVisualStyle(visualStyleDto);

                return Ok(subject);
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError,
                    new ResponceDto<object>
                    {
                        Success = false,
                        Message = "An error occurred while Aedding styles.",
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
