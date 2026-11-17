
using kids_app.Dto.CommonApiDto;
using kids_app.Dto.WorksheetTopic;
using kids_app.Services.Interface;
using Microsoft.AspNetCore.Mvc;

namespace kids_app.Controller
{
    [ApiController]
    [Route("api/[controller]")]
    public class WorkSheetTopicController : ControllerBase
    {
        private readonly IWorkSheetService _workSheetService;

        public WorkSheetTopicController(IWorkSheetService workSheetService)
        {
            _workSheetService = workSheetService;
        }

        // GET: api/WorkSheetTopic
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var result = await _workSheetService.GetWorkSheetTopic();

            return Ok(result);
        }

        // GET: api/WorkSheetTopic/subject/math
        [HttpGet("subject/{subjectSlug}")]
        public async Task<IActionResult> GetBySubject(string subjectSlug)
        {
            var result = await _workSheetService
                .GetWorkSheetTopicBySubject(subjectSlug);

            if (!result.Success)
            {
                return NotFound(result);
            }

            return Ok(result);
        }

        // GET: api/WorkSheetTopic/subject/math/addition
        [HttpGet("subject/{subjectSlug}/{slug}")]
        public async Task<IActionResult> GetBySlug(
            string subjectSlug,
            string slug)
        {
            var result = await _workSheetService
                .GetWorkSheetTopicBySlug(subjectSlug, slug);

            if (!result.Success)
            {
                return NotFound(result);
            }

            return Ok(result);
        }
    }
}
