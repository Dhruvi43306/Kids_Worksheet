using kids_app.Services.Interface;
using Microsoft.AspNetCore.Mvc;

namespace kids_app.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class WorksheetGeneratorOptionsController: ControllerBase
    {
        private readonly IWorksheetGeneratorOptionsService _service;

        public WorksheetGeneratorOptionsController(IWorksheetGeneratorOptionsService service)
        {
            _service = service;
        }

        [HttpGet]
        public async Task<IActionResult> GetOptions([FromQuery] int topicId,[FromQuery] int levelId)
        {
            var result = await _service.GetOptionsAsync(topicId,levelId);

            if (!result.Success)
            {
                return NotFound(result);
            }

            return Ok(result);
        }
    }
}