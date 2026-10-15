using kids_app.Data;
using kids_app.Dto.GenratedWorkSheet;
using kids_app.Models;
using kids_app.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Text.RegularExpressions;

namespace kids_app.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class GeneratedWorksheetController
        : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly WorksheetQuestionGenerator _fallbackGenerator;
        private readonly EarlyLevelWorksheetGenerationService _earlyLevelGenerator;
        private readonly Grade1WorksheetGenerationService _grade1Generator;
        private readonly Grade2WorksheetGenerationService _grade2Generator;
        private readonly Grade3WorksheetGenerationService _grade3Generator;
        private readonly ILogger<GeneratedWorksheetController> _logger;

        public GeneratedWorksheetController(
            AppDbContext context,
            WorksheetQuestionGenerator fallbackGenerator,
            EarlyLevelWorksheetGenerationService earlyLevelGenerator,
            Grade1WorksheetGenerationService grade1Generator,
            Grade2WorksheetGenerationService grade2Generator,
            Grade3WorksheetGenerationService grade3Generator,
            ILogger<GeneratedWorksheetController> logger)
        {
            _context = context;
            _fallbackGenerator = fallbackGenerator;
            _earlyLevelGenerator = earlyLevelGenerator;
            _grade1Generator = grade1Generator;
            _grade2Generator = grade2Generator;
            _grade3Generator = grade3Generator;
            _logger = logger;
        }

        private ILevelWorksheetGenerationService ResolveLevelGenerator(string? levelName)
        {
            string normalized = new string((levelName ?? string.Empty)
                .Where(char.IsLetterOrDigit)
                .ToArray())
                .ToLowerInvariant();

            return normalized switch
            {
                "earlylevel" or "early" => _earlyLevelGenerator,
                "grade1" or "gradeone" or "firstgrade" => _grade1Generator,
                "grade2" or "gradetwo" or "secondgrade" => _grade2Generator,
                "grade3" or "gradethree" or "thirdgrade" => _grade3Generator,
                _ => _fallbackGenerator
            };
        }


        [HttpGet("{id:long}")]
        public async Task<IActionResult> GetGeneratedWorksheet(long id)
        {
            try
            {
                var worksheet = await _context.GeneratedWorksheets
                    .AsNoTracking()
                    .Include(x => x.Topic)
                    .Include(x => x.Level)
                    .Include(x => x.Difficulty)
                    .Include(x => x.VisualStyle)
                    .Include(x => x.Questions)
                        .ThenInclude(x => x.QuestionType)
                    .FirstOrDefaultAsync(x => x.GeneratedWorksheetId == id);

                if (worksheet == null)
                {
                    return NotFound(new
                    {
                        message = $"Generated worksheet with ID {id} was not found."
                    });
                }

                var category = worksheet.Questions
                    .Select(x => x.QuestionType?.WorksheetCategoryId)
                    .Where(x => x.HasValue)
                    .Select(x => x!.Value)
                    .Distinct()
                    .ToList();

                var categoryId = category.FirstOrDefault();
                var categoryName = string.Empty;

                if (categoryId > 0)
                {
                    categoryName = await _context.worksheetCategories
                        .AsNoTracking()
                        .Where(x => x.WorksheetCategoryId == categoryId)
                        .Select(x => x.categoryName)
                        .FirstOrDefaultAsync() ?? string.Empty;
                }

                var response = new
                {
                    generatedWorksheetId = worksheet.GeneratedWorksheetId,
                    topicId = worksheet.TopicId,
                    topicName = worksheet.Topic?.TopicName,
                    levelId = worksheet.LevelId,
                    levelName = worksheet.Level?.LevelName,
                    categoryId,
                    categoryName,
                    difficultyId = worksheet.DifficultyId,
                    difficultyName = worksheet.Difficulty?.Name,
                    visualStyleId = worksheet.VisualStyleId,
                    visualStyleName = worksheet.VisualStyle?.Name,
                    questionCount = worksheet.QuestionCount,
                    worksheetTitle = worksheet.WorksheetTitle,
                    schoolName = worksheet.SchoolName,
                    studentName = worksheet.StudentName,
                    gradeName = worksheet.GradeName,
                    section = worksheet.Section,
                    teacherName = worksheet.TeacherName,
                    questions = worksheet.Questions
                        .OrderBy(x => x.QuestionNumber)
                        .Select(x => new
                        {
                            generatedQuestionId = x.GeneratedQuestionId,
                            questionNumber = x.QuestionNumber,
                            questionTypeId = x.QuestionTypeId,
                            questionTypeCode = x.QuestionType?.Code,
                            questionTypeName = x.QuestionType?.TypeName,
                            rendererKey = x.QuestionType?.RendererKey,
                            cssClass = ResolveCssClass(x.QuestionType),
                            questionText = x.QuestionText,
                            questionDataJson = x.QuestionDataJson,
                            correctAnswer = x.CorrectAnswer,
                            marks = x.Marks
                        })
                        .ToList()
                };

                return Ok(response);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error retrieving generated worksheet {GeneratedWorksheetId}.", id);

                return StatusCode(StatusCodes.Status500InternalServerError, new
                {
                    message = "Unexpected error retrieving generated worksheet.",
                    error = ex.Message,
                    innerError = ex.InnerException?.Message
                });
            }
        }

        [HttpPost("generate")]
        public async Task<IActionResult> GenerateWorksheet([FromBody] GenerateWorksheetRequestDto request)
        {
            try
            {

                if (request == null)
                {
                    return BadRequest(new
                    {
                        message = "Request body is required."
                    });
                }

                if (request.TopicId <= 0)
                {
                    return BadRequest(new
                    {
                        message = "Valid topic ID is required."
                    });
                }

                if (request.LevelId <= 0)
                {
                    return BadRequest(new
                    {
                        message = "Valid learning level ID is required."
                    });
                }

                if (request.WorksheetCategoryId <= 0)
                {
                    return BadRequest(new
                    {
                        message = "Valid worksheet category ID is required."
                    });
                }

                if (request.DifficultyId <= 0)
                {
                    return BadRequest(new
                    {
                        message = "Valid difficulty ID is required."
                    });
                }

                if (request.QuestionCount <= 0)
                {
                    return BadRequest(new
                    {
                        message = "Question count must be greater than 0."
                    });
                }

                if (request.QuestionCount > 50)
                {
                    return BadRequest(new
                    {
                        message = "Question count cannot be greater than 50."
                    });
                }

                if (request.QuestionTypeIds == null || request.QuestionTypeIds.Count == 0)
                {
                    return BadRequest(new
                    {
                        message = "At least one question type is required."
                    });
                }


                var selectedQuestionTypeIds = request.QuestionTypeIds.Where(x => x > 0)
                                                                    .Distinct()
                                                                    .ToList();

                if (selectedQuestionTypeIds.Count == 0)
                {
                    return BadRequest(new
                    {
                        message = "At least one valid question type is required."
                    });
                }


                var topic = await _context.WorksheetTopics.AsNoTracking().FirstOrDefaultAsync(x => x.TopicId == request.TopicId);

                if (topic == null)
                {
                    return BadRequest(new
                    {
                        message = $"Invalid topic ID: " + $"{request.TopicId}."
                    });
                }

                var level = await _context.LearningLevels.AsNoTracking().FirstOrDefaultAsync(x => x.LevelId == request.LevelId);

                if (level == null)
                {
                    return BadRequest(new
                    {
                        message = $"Invalid learning level ID: " + $"{request.LevelId}."
                    });
                }

                ILevelWorksheetGenerationService selectedGenerator = ResolveLevelGenerator(level.LevelName);

                var category = await _context.worksheetCategories.AsNoTracking()
                        .FirstOrDefaultAsync(x => x.WorksheetCategoryId == request.WorksheetCategoryId && x.TopicId == request.TopicId && x.isActive);

                if (category == null)
                {
                    return BadRequest(new
                    {
                        message =
                            $"Category ID " +
                            $"{request.WorksheetCategoryId} " +
                            "does not belong to the selected topic " +
                            $"ID {request.TopicId} or is inactive."
                    });
                }

                var difficulty = await _context.Difficulties.AsNoTracking().FirstOrDefaultAsync(x => x.DifficultyId == request.DifficultyId);

                if (difficulty == null)
                {
                    return BadRequest(new
                    {
                        message = $"Invalid difficulty ID: " + $"{request.DifficultyId}."
                    });
                }
                var questionTypes = await _context.QuestionTypes
                                                            .AsNoTracking()
                                                             .Where(x => selectedQuestionTypeIds
                                                             .Contains(x.QuestionTypeId) && x.WorksheetCategoryId == request.WorksheetCategoryId)
                                                             .ToListAsync();


                bool requiredVisualStyle = questionTypes.Any(q =>
                {
                    var code = q.Code?.Trim().ToUpperInvariant() ?? string.Empty;
                    return code switch
                    {
                        "COUNT_OBJECTS" => true,
                        "PATTERN" => true,
                        "ODD_EVEN_PATTERNS" => true,
                        "HOW_MANY_ALTOGETHER" => true,
                        "COUNT_ADD_CHOOSE" => true,
                        "MATCH_OBJECTS_NUMBER" => true,
                        "COMPLETE_ADDITION_SENTENCE" => true,
                        "NUMBER_LINE_ADDITION" => false,

                        _ => false
                    };
                });
                if (requiredVisualStyle && !request.VisualStyleId.HasValue)
                {
                    return BadRequest(new
                    {
                        message = "Visual style is required for the selected question type."
                    });
                }
                VisualStyle? visualStyle = null;
                if (request.VisualStyleId.HasValue && request.VisualStyleId.Value > 0)
                {
                    visualStyle = await _context.VisualStyles.AsNoTracking()
                                                             .FirstOrDefaultAsync(x => x.VisualStyleId == request.VisualStyleId.Value);
                    if (visualStyle == null)
                    {
                        return BadRequest(new
                        {
                            message = $"Invalid visual style ID: " +
                                      $"{request.VisualStyleId.Value}."
                        });
                    }
                    if (!visualStyle.IsActive)
                    {
                        return BadRequest(new
                        {
                            message =
                                "Selected visual style is inactive."
                        });
                    }
                }
                var visualIcons = new List<string>();
                if (visualStyle != null)
                {
                    visualIcons = await _context.VisualStyleItems.AsNoTracking()
                                                                 .Where(x => x.VisualStyleId == visualStyle.VisualStyleId && x.IsActive && x.Icon != null && x.Icon != "")
                                                                 .OrderBy(x => x.DisplayOrder)
                                                                 .Select(x => x.Icon!)
                                                                 .ToListAsync();

                    if (visualIcons.Count == 0)
                    {
                        return BadRequest(new
                        {
                            message = "Selected visual style has no active icons."
                        });
                    }
                }
                string? visualStyleName = visualStyle?.Name;
                var foundQuestionTypeIds = questionTypes.Select(x => x.QuestionTypeId)
                                                        .ToHashSet();

                var invalidQuestionTypeIds = selectedQuestionTypeIds
                        .Where(id =>!foundQuestionTypeIds.Contains(id))
                        .ToList();

                if (invalidQuestionTypeIds.Count > 0)
                {
                    return BadRequest(new
                    {
                        message =
                            "One or more selected question types " +
                            "do not exist or do not belong to " +
                            "the selected category.",

                        categoryId = request.WorksheetCategoryId,

                        invalidQuestionTypeIds
                    });
                }
                var inactiveQuestionTypes =
                    questionTypes
                        .Where(x =>!x.IsActive)
                        .Select(x =>
                                new
                                {
                                    x.QuestionTypeId,
                                    x.TypeName,
                                    x.Code
                                })
                        .ToList();

                if (inactiveQuestionTypes.Count > 0)
                {
                    return BadRequest(new
                    {
                        message ="One or more selected question types are inactive.",

                        inactiveQuestionTypes
                    });
                }

                var missingRendererQuestionTypes =
                    questionTypes
                        .Where(x => x.IsActive && string.IsNullOrWhiteSpace(x.RendererKey))
                        .Select(x =>
                                new
                                {
                                    x.QuestionTypeId,
                                    x.TypeName,
                                    x.Code
                                })
                        .ToList();

                if (missingRendererQuestionTypes.Count > 0)
                {
                    return BadRequest(new
                    {
                        message = "One or more selected active question types do not have a RendererKey configured.",

                        missingRendererQuestionTypes
                    });
                }
            var questionTypeSequence = BuildQuestionTypeSequence(selectedQuestionTypeIds,request.QuestionCount);
             var worksheet =new GeneratedWorksheet
                    {
                        TopicId = request.TopicId,

                        LevelId = request.LevelId,

                        DifficultyId = request.DifficultyId,

                        VisualStyleId = request.VisualStyleId,

                        QuestionCount = request.QuestionCount,

                        WorksheetTitle = $"{topic.TopicName} - " + $"{category.categoryName} Worksheet",

                        SchoolName = request.SchoolName,

                        StudentName = request.StudentName,

                        GradeName = request.GradeName,

                        Section = request.Section,

                        TeacherName = request.TeacherName
                    };

                var usedNumbers = new HashSet<int>();
                var usedQuestionKeys = new HashSet<string>();
                var usedGameCombinations = new HashSet<string>();

                for (int i = 0; i < request.QuestionCount; i++)
                {
                    int questionNumber = i + 1;

                    int questionTypeId = questionTypeSequence[i];

                    var questionType = questionTypes.FirstOrDefault(x => x.QuestionTypeId == questionTypeId);

                    if (questionType == null)
                    {
                        return StatusCode(StatusCodes.Status500InternalServerError,
                            new
                            {
                                message = "Question type could not be loaded " + "during generation.",
                                questionNumber,
                                questionTypeId
                            });
                    }
                    GeneratedQuestion question;

                    try
                    {
                        const int maxAttempts = 100;
                        int attempts = 0;
                        while (true)
                        {
                            attempts++;
                            question = selectedGenerator.GenerateQuestion(questionNumber, questionType, request.LevelId, request.DifficultyId,
                             visualStyleName, visualIcons, usedNumbers,usedGameCombinations);
                            string questionKey = $"{question.QuestionTypeId}|{question.QuestionText}|{question.QuestionDataJson}";
                            if (usedQuestionKeys.Add(questionKey))
                            {
                                break;
                            }
                            if(attempts >= maxAttempts)
                            {
                                throw new InvalidOperationException($"Could not generate a unique question after {maxAttempts} attempts.");
                            }
                        }
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError(ex, "Question generation failed.");

                        return StatusCode(StatusCodes.Status500InternalServerError,
                            new
                            {
                                message = "Question generation failed.",

                                questionNumber,

                                questionTypeId = questionType.QuestionTypeId,

                                questionTypeName = questionType.TypeName,

                                questionTypeCode = questionType.Code,

                                difficultyId = request.DifficultyId,

                                visualStyleId = request.VisualStyleId,

                                visualStyleName,

                                error = ex.Message
                            });
                    }

                    if (question == null)
                    {
                        return StatusCode(StatusCodes.Status500InternalServerError,
                            new
                            {
                                message = "Generator returned null question.",

                                questionNumber,
                                questionTypeId
                            });
                    }

                    worksheet.Questions.Add(question);
                }


                if (worksheet.Questions.Count != request.QuestionCount)
                {
                    return StatusCode(StatusCodes.Status500InternalServerError,
                        new
                        {
                            message = "Generated question count " + "does not match requested count.",

                            expected = request.QuestionCount,

                            actual = worksheet.Questions.Count
                        });
                }


                try
                {
                    _context.GeneratedWorksheets.Add(worksheet);

                    await _context.SaveChangesAsync();
                }
                catch (DbUpdateException ex)
                {
                    _logger.LogError(ex, "Database error while saving worksheet.");

                    return StatusCode(StatusCodes.Status500InternalServerError,
                        new
                        {
                            message = "Worksheet generation succeeded, " + "but saving to database failed.",

                            error =ex.Message,

                            innerError =ex.InnerException?.Message
                        });
                }


                var questionTypeMap = questionTypes.ToDictionary(q => q.QuestionTypeId);

                var response = new{
                    generatedWorksheetId =worksheet.GeneratedWorksheetId,
                    topicId =worksheet.TopicId,
                    topicName =topic.TopicName,
                    levelId = worksheet.LevelId,
                    levelName =level.LevelName,
                    categoryId =category.WorksheetCategoryId,
                    categoryName =category.categoryName,
                    difficultyId =worksheet.DifficultyId,
                    difficultyName =difficulty.Name,
                    visualStyleId =worksheet.VisualStyleId,visualStyleName,
                    questionCount =worksheet.QuestionCount,
                    worksheetTitle =worksheet.WorksheetTitle,
                    schoolName =worksheet.SchoolName,
                    studentName =worksheet.StudentName,
                    gradeName =worksheet.GradeName,
                    section =worksheet.Section,
                    teacherName =worksheet.TeacherName,
                    questions =worksheet.Questions.OrderBy(x =>x.QuestionNumber).Select(x =>
                                        {
                                            var qt = questionTypeMap.GetValueOrDefault(x.QuestionTypeId);
                                            return new
                                            {
                                               generatedQuestionId = x.GeneratedQuestionId,
                                               questionNumber = x.QuestionNumber,
                                               questionTypeId = x.QuestionTypeId,
                                               questionTypeCode = qt?.Code,
                                               questionTypeName = qt?.TypeName,
                                               rendererKey = qt?.RendererKey,
                                               cssClass = ResolveCssClass(qt),
                                               questionText = x.QuestionText,
                                               questionDataJson = x.QuestionDataJson,
                                               correctAnswer = x.CorrectAnswer,
                                               marks = x.Marks
                                            };
                                        })
                                .ToList()
                    };


                return Ok(response);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex,"Unexpected error generating worksheet.");

                return StatusCode(StatusCodes.Status500InternalServerError,
                    new
                    {
                       message ="Unexpected error generating worksheet.",
                       error = ex.Message,
                       innerError = ex.InnerException?.Message
                    });
            }
        }

        private static string? ResolveCssClass(QuestionType? questionType)
        {
            if (questionType == null)
            {
                return null;
            }


            if (string.IsNullOrWhiteSpace(questionType.RendererKey))
            {
                return null;
            }

            var key = questionType.RendererKey.Trim();
            var kebabKey = Regex.Replace(key, "([a-z0-9])([A-Z])", "$1-$2");
            kebabKey = Regex.Replace(kebabKey, "[^a-zA-Z0-9]+", "-").Trim('-').ToLowerInvariant();

            return string.IsNullOrWhiteSpace(kebabKey)
                ? null
                : $"question-type-{kebabKey}";
        }

        private List<int> BuildQuestionTypeSequence(List<int> selectedTypes,int questionCount)
        {
            if (selectedTypes == null ||selectedTypes.Count == 0)
            {
                throw new ArgumentException("No question types were selected.");
            }

            if (questionCount <= 0)
            {
                throw new ArgumentException("Question count must be greater than zero.");
            }

            var sequence =new List<int>();

            for (int i = 0;i < questionCount;i++)
            {
                sequence.Add(selectedTypes[i % selectedTypes.Count]);
            }

            Shuffle(sequence);

            return sequence;
        }


        private void Shuffle(List<int> values)
        {
            if (values == null ||values.Count <= 1)
            {
                return;
            }

            for (int i = values.Count - 1;i > 0;i--)
            {
                int j = Random.Shared.Next(i + 1);

                (values[i],values[j]) = (values[j],values[i]);
            }
        }
    }
}