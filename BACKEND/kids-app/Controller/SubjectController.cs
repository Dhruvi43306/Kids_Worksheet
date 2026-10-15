using FluentValidation;
using kids_app.Dto.CommonApiDto;
using kids_app.Dto.Subject;
using kids_app.Services.Interface;

using Microsoft.AspNetCore.Mvc;

namespace kids_app.Controller
{
    [Route("api/[controller]")]
    [ApiController]
    public class SubjectController : ControllerBase
    {
        private readonly ISubjectService _subjectService;
        private readonly IValidator<SubjectDto> _validator;
       
        public SubjectController(ISubjectService subjectService, IValidator<SubjectDto> validator)
        {
            _subjectService = subjectService;
            _validator = validator;
        }


        [HttpGet]
        public async Task<IActionResult> GetSubject()
        {
            try
            {
                var subject = await _subjectService.GetSubject();

                return Ok(subject);
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError,
                    new ResponceDto<object>
                    {
                        Success = false,
                        Message = "An error occurred while getting subjects.",
                        Data = null,
                        Errors = new List<string>
                        {
                            ex.Message
                        }
                    });

            }
        }

            [HttpPost]
            public async Task<IActionResult> AddSubject(SubjectDto subjectDto)
            {
                try
                {
                var validationResult = await _validator.ValidateAsync(subjectDto);
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
                 var subject = await _subjectService.AddSubject(subjectDto);

                    return Ok(subject);
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
