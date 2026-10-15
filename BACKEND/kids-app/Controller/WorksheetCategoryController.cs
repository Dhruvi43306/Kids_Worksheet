using kids_app.Dto.CommonApiDto;
using kids_app.Dto.WorksheetCategory;
using kids_app.Dto.WorksheetTopic;
using kids_app.Services.Interface;
using Microsoft.AspNetCore.Mvc;

namespace kids_app.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class WorksheetCategoryController : ControllerBase
    {
        private readonly IWorksheetCategory _worksheetCategoryService;

        public WorksheetCategoryController(
            IWorksheetCategory worksheetCategoryService)
        {
            _worksheetCategoryService = worksheetCategoryService;
        }

        [HttpGet]
        public async Task<ActionResult<List<WorksheetCategoryDto>>>
            GetCategories(
                [FromQuery] int topicId,
                [FromQuery] int levelId)
        {
            var categories =
                await _worksheetCategoryService
                    .GetCategoriesByTopicAndLevelAsync(
                        topicId,
                        levelId);

            return Ok(categories);
        }



        [HttpPost]
        public async Task<IActionResult> AddWorkSheetTopicCategory(WorksheetCategoryDto worksheetCategoryDto)
        {
            try
            {
              
                var worksheet = await _worksheetCategoryService.AddWorkSheetTopicCategory(worksheetCategoryDto);
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

    }
}