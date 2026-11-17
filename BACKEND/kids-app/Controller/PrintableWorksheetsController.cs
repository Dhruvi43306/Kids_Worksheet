
using kids_app.DTOs.PreGeneratedWorksheet;
using kids_app.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace kids_app.Controllers
{
    [ApiController]
    [Route("api/pre-generated-worksheets")]
    public class PreGeneratedWorksheetController : ControllerBase
    {
        private readonly IPreGeneratedWorksheetService _service;

        public PreGeneratedWorksheetController(
            IPreGeneratedWorksheetService service)
        {
            _service = service;
        }


        // ==========================================
        // 1. GET ALL ACTIVE SUBJECTS
        // GET: api/pre-generated-worksheets/subjects
        // ==========================================

        [HttpGet("subjects")]
        public async Task<ActionResult<List<PreGeneratedSubjectDto>>>
            GetSubjects(CancellationToken cancellationToken)
        {
            var subjects = await _service.GetSubjectsAsync(
                cancellationToken);

            return Ok(subjects);
        }


        // ==========================================
        // 2. GET TOPICS BY SUBJECT
        // GET: api/pre-generated-worksheets/subjects/1/topics
        // ==========================================

        [HttpGet("subjects/{subjectId:int}/topics")]
        public async Task<ActionResult<List<PreGeneratedTopicDto>>>
            GetTopicsBySubject(
                int subjectId,
                CancellationToken cancellationToken)
        {
            if (subjectId <= 0)
            {
                return BadRequest("Invalid SubjectId.");
            }

            var topics = await _service.GetTopicsBySubjectAsync(
                subjectId,
                cancellationToken);

            return Ok(topics);
        }


        // ==========================================
        // 3. GET TOPIC LEVELS AND DIFFICULTIES
        // GET: api/pre-generated-worksheets/topics/2/options
        // ==========================================

        [HttpGet("topics/{topicId:int}/options")]
        public async Task<ActionResult<PreGeneratedTopicOptionsDto>>
            GetTopicOptions(
                int topicId,
                CancellationToken cancellationToken)
        {
            if (topicId <= 0)
            {
                return BadRequest("Invalid TopicId.");
            }

            var options = await _service.GetTopicOptionsAsync(
                topicId,
                cancellationToken);

            if (options == null)
            {
                return NotFound("Topic not found or inactive.");
            }

            return Ok(options);
        }


        // ==========================================
        // 4. GET WORKSHEET FILES
        // GET: api/pre-generated-worksheets/topics/2/worksheets
        //     ?levelId=2&difficultyId=1
        // ==========================================


        [HttpGet("topics/{topicId:int}/worksheets")]
        public async Task<ActionResult<List<PreGeneratedWorksheetDto>>>
    GetWorksheets(
        int topicId,
        [FromQuery] int categoryId,
        [FromQuery] int levelId,
        [FromQuery] int difficultyId,
        CancellationToken cancellationToken)
        {
            if (topicId <= 0 ||
                categoryId <= 0 ||
                levelId <= 0 ||
                difficultyId <= 0)
            {
                return BadRequest(
                    "TopicId, CategoryId, LevelId and DifficultyId must be greater than zero.");
            }

            var worksheets = await _service.GetWorksheetsAsync(
                topicId,
                categoryId,
                levelId,
                difficultyId,
                cancellationToken
            );

            if (worksheets == null)
            {
                return NotFound(
                    "Invalid topic, category, level or difficulty.");
            }

            return Ok(worksheets);
        }

        [HttpGet("topics/{topicId:int}/categories")]
        public async Task<ActionResult<List<PreGeneratedWorksheetCategoryDto>>>
            GetCategories(
                int topicId,
                CancellationToken cancellationToken)
        {
            if (topicId <= 0)
                return BadRequest("Invalid TopicId.");

            var categories = await _service.GetCategoriesByTopicAsync(
                topicId,
                cancellationToken);

            return Ok(categories);
        }


        [HttpGet("topics/{topicId:int}/worksheets")]
        public async Task<ActionResult<List<PreGeneratedWorksheetDto>>>
            GetWorksheetsAsync(
                int topicId,
                [FromQuery] int categoryId,
                [FromQuery] int levelId,
                [FromQuery] int difficultyId,
                CancellationToken cancellationToken)
        {
            if (topicId <= 0 ||
                categoryId <= 0 ||
                levelId <= 0 ||
                difficultyId <= 0)
            {
                return BadRequest("All filter IDs must be greater than zero.");
            }

            var worksheets = await _service.GetWorksheetsAsync(
                topicId,
                categoryId,
                levelId,
                difficultyId,
                cancellationToken);

            if (worksheets == null)
                return NotFound("Invalid topic, category, level or difficulty.");

            return Ok(worksheets);
        }

    }
}
