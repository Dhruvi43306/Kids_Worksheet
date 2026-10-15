using FluentValidation;
using kids_app.Dto.CommonApiDto;
using kids_app.Dto.WorksheetTopic;
using kids_app.Services.Interface;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;

namespace kids_app.Controller
{
    [Route("api/[controller]")]
    [ApiController]
    public class WorkSheetTopicController : ControllerBase
    {
        private readonly IWorkSheetService _workSheetService;
        private readonly IValidator<WorksheetTopicDto> _validator;

        public WorkSheetTopicController(IWorkSheetService workSheetService, IValidator<WorksheetTopicDto> validator)
        {
            _workSheetService = workSheetService;
            _validator = validator;
        }

        [HttpGet]
        public async Task<IActionResult> GetWorkSheetTopic()
        {
            try
            {
                var worksheet = await _workSheetService.GetWorkSheetTopic();
                return Ok(worksheet);
            }
            catch(Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError,
                    new ResponceDto<WorksheetTopicDto>
                    {
                        Success = false,
                        Message = "While Error occure geting WorksheetTopic",
                        Data = null,
                        Errors = new List<string>()
                    });
            }
        }

        [HttpPost]
        public async Task<IActionResult> AddWorkSheetTopic(WorksheetTopicDto worksheetTopicDto)
        {
            try
            {
                var validationResult = await _validator.ValidateAsync(worksheetTopicDto);
                if (!validationResult.IsValid)
                {
                    return BadRequest(new ResponceDto<WorksheetTopicDto>
                    {
                        Success = false,
                        Message = "Validation Failed",
                        Data = null,
                        Errors = validationResult.Errors.Select(x => x.ErrorMessage).ToList()
                    });
                }
                var worksheet = await _workSheetService.AddWorkSheetTopic(worksheetTopicDto);
                return Ok(worksheet);
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError,
                    new ResponceDto<WorksheetTopicDto>
                    {
                        Success = false,
                        Message = "While Error occure Adding WorksheetTopic",
                        Data = null,
                        Errors = new List<string>()
                    });
            }
        }

        [HttpGet("subject/{subjectSlug}")]
        public async Task<IActionResult> GetWorkSheetTopicBySubject(
            string subjectSlug)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(subjectSlug))
                {
                    return BadRequest(
                        new ResponceDto<List<WorksheetTopicDto>>
                        {
                            Success = false,
                            Message = "Subject slug is required.",
                            Data = null,
                            Errors = new List<string>
                            {
                                "Subject slug cannot be empty."
                            }
                        }
                    );
                }

                var worksheet = await _workSheetService.GetWorkSheetTopicBySubject(subjectSlug);

                if (!worksheet.Success)
                {
                    return NotFound(worksheet);
                }

                return Ok(worksheet);
            }
            catch (Exception ex)
            {
                return StatusCode(
                    StatusCodes.Status500InternalServerError,new ResponceDto<List<WorksheetTopicDto>>
                    {
                        Success = false,
                        Message = "Error occurred while getting Worksheet Topics by subject.",
                        Data = null,
                        Errors = new List<string>
                        {
                            ex.Message
                        }
                    }
                );
            }
        }
        [HttpGet("subject/{subjectSlug}/{slug}")]
        public async Task<IActionResult> GetWorkSheetTopicBySlug(string subjectSlug,string slug)
        {
            try
            {
                var worksheet = await _workSheetService.GetWorkSheetTopicBySlug(subjectSlug, slug);

                if (!worksheet.Success || worksheet.Data == null)
                {
                    return NotFound(worksheet);
                }

                return Ok(worksheet);
            }
            catch (Exception ex)
            {
                return StatusCode(
                    StatusCodes.Status500InternalServerError,
                    new ResponceDto<WorksheetTopicDto>
                    {
                        Success = false,
                        Message = "Error occurred while getting WorksheetTopic.",
                        Data = null,
                        Errors = new List<string>{ex.Message}
                    }
                );
            }
        }
    }
}
