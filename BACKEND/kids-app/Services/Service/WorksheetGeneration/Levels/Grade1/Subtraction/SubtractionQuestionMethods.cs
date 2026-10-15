using kids_app.Dto.Addition;
using kids_app.Dto.GenratedWorkSheet;
using kids_app.Models;
using kids_app.Services.Configurations;
using kids_app.Services.Configurations.Addition;
using Microsoft.Extensions.Options;
using Org.BouncyCastle.Asn1.Cmp;
using System.Configuration;
using System.Text.Json;

namespace kids_app.Services
{
    public partial class Grade1WorksheetGenerationService
    {
        private GeneratedQuestion GenerateSubtractionWithObjects(int questionNumber, int questionTypeId, int levelId, int difficultyId, QuestionType questionType, List<string> visualIcons, HashSet<string> usedGameCombinations)
        {
            if (questionType == null)
            {
                throw new ArgumentNullException(nameof(questionType));
            }

            if (usedGameCombinations == null)
            {
                throw new ArgumentNullException(nameof(usedGameCombinations));
            }

            int actualDifficulty = ResolveDifficulty(difficultyId);
            var range = GetDifficultyRange(SubtractionDifficultyConfig.ByGrade, levelId, actualDifficulty);
            string code = questionType.Code?.Trim().ToUpperInvariant() ?? string.Empty;
            string icon = GetDatabaseVisualIcon(visualIcons, questionNumber);
            var combinations = GenerateUniqueGameCombinations(firstMin: range.Min, firstMax: range.Max, secondMin: range.Min, secondMax: range.Max, difficultyId: actualDifficulty,
            isvalid: (difficulty, first, second) =>
            {
                int difference = first - second;

                return first > second && difference > 0;
            });
            var item = GetUnusedCandidate(combinations, "SUBTRACTION_OBJECTS", x => $"{x.first}:{x.second}", usedGameCombinations);
            int firstNumber = item.first;

            int secondNumber = item.second;

            int difference = firstNumber - secondNumber;

            var firstGroup = Enumerable.Repeat(icon, firstNumber).ToList();
            var removedGroup = Enumerable.Repeat(icon, secondNumber).ToList();
            var remainingGroup = Enumerable.Repeat(icon, difference).ToList();

            object data;
            string questionText;
            string answer;

            switch (code)
            {
                case "OBJECT_SUBTRACTION_RESULT":

                    questionText =
                        "Take away the objects and find how many are left.";

                    answer =
                        difference.ToString();

                    data = new
                    {
                        questionType = "objectSubtractionResult",
                        icon,
                        firstGroup,
                        removedGroup,
                        remainingGroup,

                        firstCount = firstNumber,
                        removedCount = secondNumber,
                        remainingCount = difference,

                        operatorSymbol = "-",

                        equation =
                            $"{firstNumber} - {secondNumber} = ?",

                        selectionMode = "input",
                        answerType = "number"
                    };
                    break;
                case "OBJECT_SUBTRACTION_MISSING_TAKEAWAY":

                    questionText =
                        "How many objects were taken away?";

                    answer =
                        secondNumber.ToString();

                    data = new
                    {
                        questionType = "objectSubtractionMissingTakeaway",

                        icon,

                        firstGroup,
                        remainingGroup,

                        firstCount = firstNumber,
                        remainingCount = difference,

                        operatorSymbol = "-",

                        equation =
                            $"{firstNumber} - ? = {difference}",

                        selectionMode = "input",
                        answerType = "number"
                    };

                    break;

                case "OBJECT_SUBTRACTION_MISSING_START":

                    questionText =
                        "How many objects were there at the start?";

                    answer =
                        firstNumber.ToString();

                    data = new
                    {
                        questionType = "objectSubtractionMissingStart",

                        icon,

                        removedGroup,
                        remainingGroup,

                        removedCount = secondNumber,
                        remainingCount = difference,

                        operatorSymbol = "-",

                        equation =
                            $"? - {secondNumber} = {difference}",

                        selectionMode = "input",
                        answerType = "number"
                    };

                    break;
                case "OBJECT_GROUP_DIFFERENCE":

                    questionText =
                        "Compare the two groups. How many more objects are in the first group?";

                    answer =
                        difference.ToString();

                    data = new
                    {
                        questionType = "objectGroupDifference",

                        icon,

                        firstGroup,
                        secondGroup = removedGroup,

                        firstCount = firstNumber,
                        secondCount = secondNumber,

                        difference,

                        operatorSymbol = "-",

                        equation =
                            $"{firstNumber} - {secondNumber} = ?",

                        selectionMode = "input",
                        answerType = "number"
                    };
                    break;
                case "OBJECT_SUBTRACTION_EQUALIZE":

                    questionText =
                        "How many objects should be removed from the larger group to make both groups equal?";

                    answer =
                        difference.ToString();

                    data = new
                    {
                        questionType = "objectSubtractionEqualize",

                        icon,

                        firstGroup,
                        secondGroup = removedGroup,

                        firstCount = firstNumber,
                        secondCount = secondNumber,

                        targetCount = secondNumber,
                        removeCount = difference,

                        equation =
                            $"{firstNumber} - ? = {secondNumber}",

                        selectionMode = "input",
                        answerType = "number"
                    };
                    break;
                case "OBJECT_SUBTRACTION_CHOOSE_RESULT":

                    questionText = "Take away the objects. Choose the group that shows how many are left.";

                    answer = difference.ToString();

                    var options = new HashSet<int> { difference };

                    int attempts = 0;

                    while (options.Count < 4 && attempts < 100)
                    {
                        attempts++;

                        int candidate = _random.Next(range.Min, range.Max + 1);

                        options.Add(candidate);
                    }
                    var optionList = options.ToList();

                    Shuffle(optionList);

                    var optionGroups = optionList
                            .Select(option => new
                            {
                                value = option,
                                objects = Enumerable
                                        .Repeat(icon, option)
                                        .ToList()
                            })
                            .ToList();

                    data = new
                    {
                        questionType = "objectSubtractionChooseResult",

                        icon,

                        firstGroup,
                        removedGroup,
                        firstCount = firstNumber,
                        removedCount = secondNumber,

                        equation = $"{firstNumber} - {secondNumber} = ?",

                        options = optionGroups,

                        selectionMode = "single",
                        answerType = "number"
                    };

                    break;
                default:
                    throw new ArgumentException($"Unsupported subtraction object question type: {code}");

            }

            return CreateQuestion(questionNumber, questionTypeId, questionText, data, answer);
        }
        private GeneratedQuestion GenerateSubtractionNumberLine(int questionNumber, int questionTypeId, int levelId, int difficultyId, QuestionType questionType, HashSet<string> usedGameCombinations)
        {
            if (questionType == null)
            {
                throw new ArgumentNullException(nameof(questionType));
            }

            if (usedGameCombinations == null)
            {
                throw new ArgumentNullException(nameof(usedGameCombinations));
            }

            int actualDifficulty = ResolveDifficulty(difficultyId);
            var range = GetDifficultyRange(SubtractionDifficultyConfig.ByGrade, levelId, actualDifficulty);
            string code = questionType.Code?.Trim().ToUpperInvariant() ?? string.Empty;
            int min = range.Min;
            int max = range.Max;
            object data;
            string questionText;
            string answer;

            List<(int first, int second, int total)>? subtractionCombinations = null;

            if (code == "NUMBER_LINE_WRONG_LANDING" ||
                code == "NUMBER_LINE_MISSING_START" ||
                code == "NUMBER_LINE_MISSING_JUMPS" ||
                code == "NUMBER_LINE_FIND_DISTANCE")
            {
                subtractionCombinations =
                    GenerateUniqueGameCombinations(
                        firstMin: min,
                        firstMax: max,
                        secondMin: min,
                        secondMax: max,
                        difficultyId,
                        isvalid: (difficulty, first, second) =>
                        {
                            return first > second;
                        });
            }
            switch (code)
            {

                case "NUMBER_LINE_WRONG_LANDING":
                    {
                        var selected = GetUnusedCandidate(subtractionCombinations!, "SUBTRACTION_NUMBER_LINE_WRONG_LANDING", x => $"{x.first}:{x.second}", usedGameCombinations);

                        int startNumber = selected.first;
                        int endNumber = selected.second;
                        int backwardSteps = startNumber - endNumber;
                        var optionValues = Enumerable.Range(min, max - min + 1).Where(x => x != endNumber).ToList();
                        Shuffle(optionValues);
                        var options = new List<int> { endNumber };
                        options.AddRange(optionValues.Take(3));
                        Shuffle(options);

                        questionText =
                            $"Start at {startNumber} and move backward " +
                            $"{backwardSteps} steps. Which point is the correct landing point?";

                        answer = endNumber.ToString();
                        data = new
                        {
                            questionType = code,
                            numberLine = new
                            {
                                min,
                                max
                            },
                            startNumber,
                            backwardSteps,
                            endNumber,
                            options = options.Select(value => new { value, isCorrect = value == endNumber }).ToList(),
                            direction = "backward",
                            selectionMode = "single",
                            answerType = "number"
                        };

                        break;
                    }

                case "NUMBER_LINE_MISSING_START":
                    {
                        var selected =
                            GetUnusedCandidate(
                                subtractionCombinations!,
                                "SUBTRACTION_NUMBER_LINE_MISSING_START",
                                x => $"{x.first}:{x.second}",
                                usedGameCombinations);

                        int startNumber = selected.first;
                        int endNumber = selected.second;

                        int backwardSteps =
                            startNumber - endNumber;

                        questionText =
                            $"Find the starting number. Move backward " +
                            $"{backwardSteps} steps to land on {endNumber}.";

                        answer =
                            startNumber.ToString();

                        data = new
                        {
                            questionType = code,
                            numberLine = new
                            {
                                min,
                                max
                            },

                            startNumber = (int?)null,

                            endNumber,

                            backwardSteps,

                            direction = "backward",

                            equation = $"? - {backwardSteps} = {endNumber}",

                            selectionMode = "input",

                            answerType = "number"
                        };

                        break;
                    }


                case "NUMBER_LINE_MISSING_JUMPS":
                    {
                        var selected = GetUnusedCandidate(
                                subtractionCombinations!,
                                "SUBTRACTION_NUMBER_LINE_MISSING_JUMPS",
                                x => $"{x.first}:{x.second}",
                                usedGameCombinations);

                        int startNumber = selected.first;
                        int endNumber = selected.second;

                        int backwardSteps = startNumber - endNumber;

                        questionText =
                            $"Start at {startNumber}. How many steps backward " +
                            $"will take you to {endNumber}?";

                        answer = backwardSteps.ToString();
                        data = new
                        {
                            questionType = code,

                            numberLine = new
                            {
                                min,
                                max
                            },

                            startNumber,

                            endNumber,

                            backwardSteps = (int?)null,

                            direction = "backward",

                            equation = $"{startNumber} - ? = {endNumber}",

                            selectionMode = "input",

                            answerType = "number"
                        };

                        break;
                    }
                case "NUMBER_LINE_FIND_DISTANCE":
                    {
                        var selected =
                            GetUnusedCandidate(
                                subtractionCombinations!,
                                "SUBTRACTION_NUMBER_LINE_FIND_DISTANCE",
                                x => $"{x.first}:{x.second}",
                                usedGameCombinations);

                        int startNumber = selected.first;
                        int endNumber = selected.second;

                        int distance = startNumber - endNumber;

                        questionText =
                            "How many steps backward are there " +
                            $"from {startNumber} to {endNumber}?";

                        answer =
                            distance.ToString();

                        data = new
                        {
                            questionType = code,
                            numberLine = new
                            {
                                min,
                                max
                            },

                            startNumber,
                            endNumber,
                            distance,

                            direction = "backward",

                            selectionMode = "input",
                            answerType = "number"
                        };

                        break;
                    }
                case "NUMBER_LINE_SUBTRACTION_SEQUENCE":
                    {
                        var jumpCombinations = GenerateUniqueGameCombinations(
                                firstMin: 1,
                                firstMax: Math.Min(5, max),
                                secondMin: 1,
                                secondMax: Math.Min(5, max),
                                difficultyId,
                                isvalid: (difficulty, first, second) =>
                                {
                                    return first + second <= (max - min);
                                });
                        var sequenceCandidates = jumpCombinations.SelectMany(jump => Enumerable
                           .Range(min + jump.total, max - (min + jump.total) + 1)
                           .Select(start => new
                           {
                               start,
                               firstJump = jump.first,
                               secondJump = jump.second,
                               intermediate = start - jump.first,
                               finalNumber = start - jump.total
                           })).ToList();
                        var selected = GetUnusedCandidate(
                                           sequenceCandidates,
                                           "SUBTRACTION_NUMBER_LINE_SEQUENCE",
                                           x => $"{x.start}:{x.firstJump}:{x.secondJump}",
                                           usedGameCombinations);

                        int startNumber = selected.start;
                        int firstJump = selected.firstJump;
                        int intermediate = selected.intermediate;
                        int secondJump = selected.secondJump;
                        int finalNumber = selected.finalNumber;

                        questionText =
                            $"Start at {startNumber}. Move backward " +
                            $"{firstJump} steps, then move backward " +
                            $"{secondJump} steps. Where do you finish?";
                        answer = finalNumber.ToString();

                        data = new
                        {
                            questionType = code,

                            numberLine = new
                            {
                                min,
                                max
                            },

                            startNumber,
                            firstJump,
                            intermediate,
                            secondJump,
                            finalNumber,

                            jumps = new[]
                            {
                    new
                    {
                        start = startNumber,
                        end = intermediate,
                        size = firstJump,
                        direction = "backward"
                    }, new
                    {
                        start = intermediate,
                        end = finalNumber,
                        size = secondJump,
                        direction = "backward"
                    }
                },

                            equation = $"{startNumber} - {firstJump} - {secondJump} = ?",

                            selectionMode = "input",
                            answerType = "number"
                        };

                        break;
                    }
                default:
                    throw new ArgumentException($"Unsupported subtraction number-line question type: {code}");

            }
            return CreateQuestion(questionNumber, questionTypeId, questionText, data, answer);

        }
        private GeneratedQuestion GenerateSubtractionFactFamily(int questionNumber, int questionTypeId, int levelId, int difficultyId, QuestionType questionType, HashSet<string> usedGameCombinations)
        {
            if (questionType == null)
            {
                throw new ArgumentNullException(nameof(questionType));
            }

            if (usedGameCombinations == null)
            {
                throw new ArgumentNullException(nameof(usedGameCombinations));
            }

            string code = questionType.Code?.Trim().ToUpperInvariant() ?? string.Empty;

            if (code != "FACT_FAMILY_CHOOSE_CORRECT" &&
                code != "FACT_FAMILY_ODD_ONE_OUT" &&
                code != "FACT_FAMILY_TRUE_FALSE" &&
                code != "FACT_FAMILY_MISSING_EQUATION")
            {
                throw new ArgumentException(
                    $"Unsupported subtraction fact-family question type: {code}");
            }

            DifficultyRange range = GetDifficultyRange(SubtractionDifficultyConfig.ByGrade, levelId, difficultyId);

            int min = range.Min;
            int max = range.Max;

            if (min >= max)
            {
                throw new InvalidOperationException($"Invalid subtraction fact-family range {min}-{max}.");
            }


            var familyCombinations = GenerateUniqueGameCombinations(firstMin: 1, firstMax: max, secondMin: 1, secondMax: max, difficultyId,
                    isvalid: (difficulty, first, second) =>
                    {
                        int total = first + second;

                        return first > 0 &&
                               second > 0 &&
                               first != second &&
                               total >= min &&
                               total <= max;
                    });

            var selectedFamily = GetUnusedCandidate(familyCombinations, "SUBTRACTION_FACT_FAMILY", x =>
                        $"{Math.Min(x.first, x.second)}:" +
                        $"{Math.Max(x.first, x.second)}", usedGameCombinations);

            int smaller = Math.Min(selectedFamily.first, selectedFamily.second);

            int larger = Math.Max(selectedFamily.first, selectedFamily.second);

            int whole = selectedFamily.total;

            var validEquations = new List<string>{
            $"{smaller} + {larger} = {whole}",
            $"{larger} + {smaller} = {whole}",
            $"{whole} - {larger} = {smaller}",
            $"{whole} - {smaller} = {larger}"
           };

            string questionText;
            string answer;
            object data;

            switch (code)
            {

                case "FACT_FAMILY_CHOOSE_CORRECT":
                    {

                        int incorrectResult = smaller == 1 ? smaller + 1 : smaller - 1;


                        var correctOption = new List<string>{
                    $"{smaller} + {larger} = {whole}",
                    $"{larger} + {smaller} = {whole}",
                    $"{whole} - {larger} = {smaller}",
                    $"{whole} - {smaller} = {larger}"
                    };

                        var wrongOption1 = new List<string>{
                    $"{smaller} + {larger} = {incorrectResult}",
                    $"{larger} + {smaller} = {whole}",
                    $"{whole} - {larger} = {smaller}",
                    $"{whole} - {smaller} = {larger}"
                     };

                        var wrongOption2 = new List<string>{
                    $"{smaller} + {larger} = {whole}",
                    $"{larger} + {smaller} = {whole}",
                    $"{whole} - {larger} = {incorrectResult}",
                    $"{whole} - {smaller} = {larger}"
                     };

                        var wrongOption3 = new List<string>{
                    $"{smaller} + {larger} = {whole}",
                    $"{larger} - {smaller} = {whole}",
                    $"{whole} - {larger} = {smaller}",
                    $"{whole} - {smaller} = {larger}"
                      };

                        var options = new List<(List<string> equations, bool isCorrect)>
                        {
                            (correctOption, true),
                            (wrongOption1, false),
                            (wrongOption2, false),
                            (wrongOption3, false)
                        };


                        foreach (var option in options)
                        {
                            Shuffle(option.equations);
                        }

                        Shuffle(options);


                        var shuffledOptions = options
                                .Select((x, index) => new
                                {
                                    label = ((char)('A' + index)).ToString(),

                                    equations = x.equations,

                                    isCorrect = x.isCorrect
                                })
                                .ToList();

                        string correctLabel = shuffledOptions
                                .First(x => x.isCorrect)
                                .label;

                        questionText = "Which group of equations shows a correct fact family?";

                        answer = correctLabel;


                        data = new
                        {
                            questionType = code,
                            numbers =
                              new
                              {
                                  whole,
                                  larger,
                                  smaller
                              },
                            options = shuffledOptions,
                            selectionMode = "single",
                            answerType = "option"
                        };

                        break;
                    }

                case "FACT_FAMILY_ODD_ONE_OUT":
                    {
                        int incorrectResult = smaller == 1 ? smaller + 1 : smaller - 1;

                        var options = new List<(string label, string equation, bool isCorrect)>
                            {
                    (
                        "A",
                        $"{whole} - {larger} = {smaller}",
                        true
                    ),

                    (
                        "B",
                        $"{whole} - {smaller} = {larger}",
                        true
                    ),

                    (
                        "C",
                        $"{smaller} + {larger} = {whole}",
                        true
                    ),

                    (
                        "D",
                        $"{whole} - {larger} = {incorrectResult}",
                        false
                    )
                            };

                        Shuffle(options);

                        string correctLabel = options
                                .First(x => !x.isCorrect)
                                .label;

                        questionText = "Which equation does NOT belong to the fact family?";

                        answer = correctLabel;

                        data = new
                        {
                            questionType = code,
                            numbers = new
                            {
                                whole,
                                larger,
                                smaller
                            },
                            options = options
                                   .Select(x => new
                                   {
                                       label = x.label,
                                       equation = x.equation,
                                       isCorrect = x.isCorrect
                                   })
                                   .ToList(),
                            selectionMode = "single",
                            answerType = "option"
                        };

                        break;
                    }

                case "FACT_FAMILY_TRUE_FALSE":
                    {
                        bool statementIsCorrect = _random.Next(2) == 0;

                        string statement;

                        if (statementIsCorrect)
                        {
                            statement = validEquations[_random.Next(validEquations.Count)];
                        }
                        else
                        {
                            int incorrectResult = smaller == 1 ? smaller + 1 : smaller - 1;

                            var invalidEquations = new List<string> {
                        $"{whole} - {larger} = {incorrectResult}",
                        $"{whole} - {smaller} = {incorrectResult}",
                        $"{smaller} + {larger} = {incorrectResult}"
                         };

                            statement = invalidEquations[_random.Next(invalidEquations.Count)];
                        }

                        questionText = "Is this equation part of the correct fact family?";

                        answer = statementIsCorrect ? "True" : "False";

                        data = new
                        {
                            questionType = code,
                            numbers =
                               new
                               {
                                   whole,
                                   larger,
                                   smaller
                               },
                            statement,
                            options = new[]
                           {
                               "True",
                               "False"
                           },
                            statementIsCorrect,
                            selectionMode = "single",
                            answerType = "option"
                        };

                        break;
                    }

                case "FACT_FAMILY_MISSING_EQUATION":
                    {
                        var equations = new[] {
                    new
                    {
                       position = 1,
                       equation = $"{larger} + {smaller} = {whole}",
                       isMissing = false,
                       answer = (int?)null
                    },

                    new
                    {
                       position = 2,
                       equation = $"{whole} - {larger} = ?",
                       isMissing = true,
                       answer = (int?)smaller
                    },

                    new
                    {
                       position = 3,
                       equation =$"? - {smaller} = {larger}",
                       isMissing = true,
                       answer = (int?)whole
                    }
                 };

                        var missingAnswers = new[] { smaller, whole };

                        questionText = "Complete the missing numbers in the fact family.";

                        answer = JsonSerializer.Serialize(missingAnswers);

                        data = new
                        {
                            questionType = code,
                            numbers =
                               new
                               {
                                   whole,
                                   larger,
                                   smaller
                               },
                            equations,
                            missingAnswers,
                            selectionMode = "input",
                            answerType = "number-array"
                        };

                        break;
                    }


                default:
                    throw new ArgumentException(
                        $"Unsupported subtraction fact-family question type: {code}");
            }


            return CreateQuestion(questionNumber, questionTypeId, questionText, data, answer);
        }
        private GeneratedQuestion GenerateSubtractionActionQuestion(int questionNumber, int questionTypeId, int levelId, int difficultyId, QuestionType questionType, List<string> visualIcons, HashSet<string> usedGameCombinations)
        {
            if (questionType == null)
            {
                throw new ArgumentNullException(nameof(questionType));
            }

            if (visualIcons == null)
            {
                throw new ArgumentNullException(nameof(visualIcons));
            }

            if (usedGameCombinations == null)
            {
                throw new ArgumentNullException(nameof(usedGameCombinations));
            }

            string code = questionType.Code?.Trim().ToUpperInvariant() ?? string.Empty;

            if (code != "CROSS_OUT_OBJECTS" &&
                code != "DRAW_AND_CROSS_OUT" &&
                code != "CHOOSE_TAKE_AWAY" &&
                code != "MISSING_NUMBER_SUBTRACTION")
            {
                throw new ArgumentException(
                    $"Unsupported subtraction action question type: {code}");
            }

            DifficultyRange range = GetDifficultyRange(SubtractionDifficultyConfig.ByGrade, levelId, difficultyId);

            int min = range.Min;
            int max = range.Max;

            if (min > max)
            {
                throw new InvalidOperationException($"Invalid subtraction range {min}-{max}.");
            }

            string icon = GetDatabaseVisualIcon(visualIcons, questionNumber);


            var combinations = GenerateUniqueGameCombinations(
                    firstMin: min,
                    firstMax: max,
                    secondMin: min,
                    secondMax: max,
                    difficultyId,
                    isvalid: (difficulty, first, second) =>
                    {
                        int remaining = first - second;

                        return first > second &&
                               remaining > 0 &&
                               first <= max;
                    });

            var selected = GetUnusedCandidate(combinations, $"SUBTRACTION_ACTION_{code}", x => $"{x.first}:{x.second}", usedGameCombinations);

            int startCount = selected.first;

            int takeAwayCount = selected.second;

            int remainingCount = startCount - takeAwayCount;

            var objects = Enumerable.Repeat(icon, startCount).ToList();

            string questionText;
            string answer;
            object data;
            switch (code)
            {
                case "CROSS_OUT_OBJECTS":
                    {
                        questionText = $"There are {startCount} objects. " + $"Cross out {takeAwayCount} objects. " + "How many are left?";

                        answer = remainingCount.ToString();

                        data = new
                        {
                            questionType = code,
                            icon,
                            objects,
                            startCount,
                            crossOutCount = takeAwayCount,
                            remainingCount,
                            equation = $"{startCount} - {takeAwayCount} = ?",
                            interaction = "crossOut",
                            selectionMode = "input",
                            answerType = "number"
                        };

                        break;
                    }

                case "DRAW_AND_CROSS_OUT":
                    {
                        questionText =
                            $"There are {startCount} objects. " +
                            $"Draw a line through {takeAwayCount} objects. " +
                            "How many are left?";

                        answer = remainingCount.ToString();

                        data = new
                        {
                            questionType = code,
                            icon,
                            objects,
                            startCount,
                            crossOutCount = takeAwayCount,
                            remainingCount,
                            equation = $"{startCount} - {takeAwayCount} = ?",
                            interaction = "drawCrossOut",
                            allowDrawing = true,
                            drawingType = "crossOut",
                            selectionMode = "draw",
                            answerType = "number"
                        };

                        break;
                    }

                case "CHOOSE_TAKE_AWAY":
                    {
                        if (startCount < 5)
                        {
                            throw new InvalidOperationException("Choose-take-away question requires at least 5 starting objects.");
                        }

                        int targetCount = remainingCount;

                        int correctTakeAway = startCount - targetCount;

                        var possibleOptions = Enumerable.Range(1, startCount - 1).Where(value => value != correctTakeAway).ToList();

                        Shuffle(possibleOptions);

                        var optionValues = new List<int> { correctTakeAway };

                        optionValues.AddRange(possibleOptions.Take(3));

                        Shuffle(optionValues);

                        var options = optionValues.Select(value => new
                        {
                            value,

                            objects = Enumerable.Repeat(icon, value).ToList(),

                            isCorrect = value == correctTakeAway
                        })
                                .ToList();

                        questionText =
                            $"There are {startCount} objects. " +
                            $"We want {targetCount} objects left. " +
                            "Which should we take away?";

                        answer =
                            correctTakeAway.ToString();

                        data = new
                        {
                            questionType = code,
                            icon,
                            objects,
                            startCount,
                            targetCount,
                            takeAwayCount = correctTakeAway,
                            options,
                            equation = $"{startCount} - ? = {targetCount}",
                            selectionMode = "single",
                            answerType = "option"
                        };

                        break;
                    }

                case "MISSING_NUMBER_SUBTRACTION":
                    {
                        bool missingTakeAway = _random.Next(2) == 0;

                        if (missingTakeAway)
                        {
                            questionText = "Find the missing number in the subtraction.";

                            answer = takeAwayCount.ToString();

                            data = new
                            {
                                questionType = code,
                                icon,
                                objects,
                                startCount,
                                takeAwayCount = (int?)null,
                                remainingCount,
                                missingPosition = "takeAway",
                                equation = $"{startCount} - ? = {remainingCount}",
                                selectionMode = "input",
                                answerType = "number"
                            };
                        }
                        else
                        {
                            questionText =
                                "Find the missing starting number.";

                            answer = startCount.ToString();

                            data = new
                            {
                                questionType = code,
                                icon,
                                objects = Enumerable.Repeat(icon, remainingCount).ToList(),
                                startCount = (int?)null,
                                takeAwayCount,
                                remainingCount,
                                missingPosition = "start",
                                equation = $"? - {takeAwayCount} = {remainingCount}",
                                selectionMode = "input",
                                answerType = "number"
                            };
                        }

                        break;
                    }

                default:
                    throw new ArgumentException($"Unsupported subtraction action question type: {code}");
            }

            return CreateQuestion(questionNumber, questionTypeId, questionText, data, answer);
        }
        private static bool CanSubtractWithoutBorrowing(int firstNumber, int secondNumber)
        {
            if (firstNumber <= secondNumber || secondNumber < 0)
            {
                return false;
            }
            while (firstNumber > 0 || secondNumber > 0)
            {
                int firstDigit = firstNumber % 10;
                int secondDigit = secondNumber % 10;
                if (firstDigit < secondDigit)
                {
                    return false;
                }
                firstNumber /= 10;
                secondNumber /= 10;
            }
            return true;
        }
        private GeneratedQuestion GenerateSubtractionWithNumbers(int questionNumber, int questionTypeId, int levelId, int difficultyId, QuestionType questionType, HashSet<string> usedGameCombinations)
        {
            if (questionType == null)
            {
                throw new ArgumentNullException(nameof(questionType));
            }

            if (usedGameCombinations == null)
            {
                throw new ArgumentNullException(nameof(usedGameCombinations));
            }
            string code = questionType.Code?.Trim().ToUpperInvariant() ?? string.Empty;

            if (code != "NUMBER_SUBTRACTION_RESULT" &&
                code != "NUMBER_SUBTRACTION_MISSING_TAKEAWAY" &&
                code != "NUMBER_SUBTRACTION_MISSING_START" &&
                code != "NUMBER_SUBTRACTION_CHOOSE_RESULT")
            {
                throw new ArgumentException($"Unsupported subtraction question type: {code}");
            }


            DifficultyRange range = GetDifficultyRange(SubtractionDifficultyConfig.ByGrade, levelId, difficultyId);
            int min = range.Min;
            int max = range.Max;
            if (min < 1 || min >= max)
            {
                throw new InvalidOperationException($"Invalid subtraction range {min}-{max} " + $"for level {levelId}.");
            }
            var candidates = new List<(int first, int second, int difference)>();
            for (int first = min; first <= max; first++)
            {
                for (int second = min; second < first; second++)
                {
                    if (!CanSubtractWithoutBorrowing(first, second))
                    {
                        continue;
                    }
                    int candidateDifference = first - second;
                    candidates.Add((first, second, candidateDifference));
                }
            }
            if (candidates.Count == 0)
            {
                throw new InvalidOperationException(
                    $"No valid subtraction combinations are available " +
                    $"for level {levelId}, range {min}-{max}, " +
                    "without borrowing.");
            }
            var selected = GetUnusedCandidate(candidates, $"SUBTRACTION_WITH_NUMBERS_{code}", x => $"{x.first}:{x.second}", usedGameCombinations);
            int firstNumber = selected.first;
            int secondNumber = selected.second;
            int difference = selected.difference;

            string questionText;
            string answer;
            object data;

            switch (code)
            {
                case "NUMBER_SUBTRACTION_RESULT":
                    {
                        questionText = $"Subtract {secondNumber} from {firstNumber}. " + "What is the difference?";

                        answer = difference.ToString();

                        data = new
                        {
                            questionType = code,
                            firstNumber,
                            secondNumber,
                            difference = selected.difference,
                            operatorSymbol = "-",
                            equation = $"{firstNumber} - {secondNumber} = ?",
                            selectionMode = "input",
                            answerType = "number"
                        };
                        break;
                    }
                case "NUMBER_SUBTRACTION_MISSING_START":
                    {
                        questionText = "Find the missing starting number.";

                        answer = firstNumber.ToString();

                        data = new
                        {
                            questionType = code,
                            firstNumber = (int?)null,
                            secondNumber,
                            difference,
                            missingPosition = "start",
                            operatorSymbol = "-",
                            equation = $"? - {secondNumber} = {difference}",
                            selectionMode = "input",
                            answerType = "number"
                        };
                        break;
                    }
                case "NUMBER_SUBTRACTION_MISSING_TAKEAWAY":
                    {
                        questionText = "Find the missing number being subtracted.";

                        answer = secondNumber.ToString();

                        data = new
                        {
                            questionType = code,
                            firstNumber,
                            secondNumber = (int?)null,
                            difference,
                            missingPosition = "takeAway",
                            operatorSymbol = "-",
                            equation = $"{firstNumber} - ? = {difference}",
                            selectionMode = "input",
                            answerType = "number"
                        };
                        break;
                    }
                case "NUMBER_SUBTRACTION_CHOOSE_RESULT":
                    {
                        var distractors = Enumerable.Range(min, max - min + 1).Where(value => value != difference).ToList();
                        Shuffle(distractors);
                        var options = new List<int> { difference };
                        options.AddRange(distractors.Take(3));
                        Shuffle(options);

                        questionText = $"Solve {firstNumber} - {secondNumber}. " + "Choose the correct difference.";

                        answer = difference.ToString();

                        data = new
                        {
                            questionType = code,
                            firstNumber,
                            secondNumber,
                            difference,
                            operatorSymbol = "-",
                            equation = $"{firstNumber} - {secondNumber} = ?",
                            options,
                            selectionMode = "single",
                            answerType = "option"
                        };
                        break;
                    }
                default:
                    throw new ArgumentException($"Unsupported subtraction question type: {code}");
            }
            return CreateQuestion(questionNumber, questionTypeId, questionText, data, answer);
        }
        private GeneratedQuestion GenerateVisualSubtractionQuestion(int questionNumber,int questionTypeId,int levelId,int difficultyId,QuestionType questionType,List<string> visualIcons,HashSet<string> usedGameCombinations)
        {
            if (questionType == null)
            {
                throw new ArgumentNullException(nameof(questionType));
            }

            if (usedGameCombinations == null)
            {
                throw new ArgumentNullException(nameof(usedGameCombinations));
            }

            string code =
                questionType.Code?.Trim().ToUpperInvariant()
                ?? string.Empty;

            if (code != "UNFILLED_LEVEL_SHIFT" &&
                code != "MYSTERY_STORAGE_CHEST" &&
                code != "CALENDAR_SUBTRACTION_MISSING_DAYS")
            {
                throw new ArgumentException(
                    $"Unsupported visual subtraction question type: {code}");
            }


            if (code == "CALENDAR_SUBTRACTION_MISSING_DAYS")
            {
                CalendarSubtractionRange calendarRange = GetCalendarSubtractionRange(levelId, difficultyId);

                var calendarCandidates = new List<(int startDay, int targetDay, int daysBack)>();

                for (int candidateStartDay = calendarRange.MinStartDay; candidateStartDay <= calendarRange.MaxStartDay; candidateStartDay++)
                {
                    int maximumDaysBack = Math.Min(calendarRange.MaxDaysBack, candidateStartDay - 1);

                    for (int candidateDaysBack = calendarRange.MinDaysBack; candidateDaysBack <= maximumDaysBack; candidateDaysBack++)
                    {
                        int candidateTargetDay = candidateStartDay - candidateDaysBack;

                        if (candidateTargetDay < 1)
                        {
                            continue;
                        }
                        calendarCandidates.Add((candidateStartDay, candidateTargetDay, candidateDaysBack));
                    }
                }

                if (calendarCandidates.Count == 0)
                {
                    throw new InvalidOperationException(
                        $"No valid calendar subtraction combinations exist " +
                        $"for level {levelId}.");
                }

                var calendarSelected = GetUnusedCandidate(calendarCandidates,"CALENDAR_SUBTRACTION_MISSING_DAYS",x => $"{x.startDay}:{x.targetDay}",usedGameCombinations);

                int startDay = calendarSelected.startDay;
                int targetDay = calendarSelected.targetDay;
                int daysBack = calendarSelected.daysBack;

                var calendarDays = Enumerable
                    .Range(1, 31)
                    .Select(day => new
                    {
                        day,
                        isStartDay = day == startDay,
                        isTargetDay = day == targetDay,
                        isBetweenDates =
                            day > targetDay && day < startDay
                    })
                    .ToList();

                var calendarData = new
                {
                   questionType = code,
                   calendar = new
                   {
                       min = 1,
                       max = 31
                   },
                   startDay,
                   targetDay,
                   daysBack,
                   calendarDays,
                   missingPosition = "daysBack",
                   equation = $"{startDay} - ? = {targetDay}",
                   selectionMode = "input",
                   answerType = "number"
                };

                string calendarQuestionText =
                    $"The starting date is {startDay} and the target date " +
                    $"is {targetDay}. How many days must you move backward?";

                return CreateQuestion(questionNumber,questionTypeId,calendarQuestionText,calendarData,daysBack.ToString());
            }
            DifficultyRange range = GetDifficultyRange(SubtractionDifficultyConfig.ByGrade,levelId,difficultyId);

            int min = range.Min;
            int max = range.Max;

            if (min < 1 || min >= max)
            {
                throw new InvalidOperationException(
                    $"Invalid visual subtraction range {min}-{max} " +
                    $"for level {levelId}.");
            }

            var candidates = new List<(int first, int second, int difference)>();

            for (int first = min; first <= max; first++)
            {
                for (int second = min; second < first; second++)
                {
                    if (!CanSubtractWithoutBorrowing(first, second))
                    {
                        continue;
                    }

                    int candidateDifference = first - second;

                    candidates.Add((first, second, candidateDifference));
                }
            }

            if (candidates.Count == 0)
            {
                throw new InvalidOperationException(
                    $"No valid visual subtraction combinations exist " +
                    $"for level {levelId}, range {min}-{max}.");
            }

            var selected = GetUnusedCandidate(candidates,$"VISUAL_SUBTRACTION_{code}",x => $"{x.first}:{x.second}",usedGameCombinations);

            int firstNumber = selected.first;
            int secondNumber = selected.second;
            int difference = selected.difference;

            string questionText;
            string answer = difference.ToString();
            object data;

            switch (code)
            {

                case "UNFILLED_LEVEL_SHIFT":
                    {
                        var blocks = Enumerable
                            .Range(0, firstNumber)
                            .Select(index => new
                            {
                                position = index + 1,
                                state = index < secondNumber? "empty": "filled",
                                isFilled = index >= secondNumber
                            })
                            .ToList();

                        questionText =
                            $"A container starts with {firstNumber} filled blocks. " +
                            $"{secondNumber} blocks are emptied. " +
                            "How many filled blocks remain?";

                        data = new
                        {
                           questionType = code,
                           startCount = firstNumber,
                           emptiedCount = secondNumber,
                           remainingCount = difference,
                           blocks,
                           equation = $"{firstNumber} - {secondNumber} = ?",
                           selectionMode = "input",
                           answerType = "number"
                        };

                        break;
                    }

                case "MYSTERY_STORAGE_CHEST":
                    {
                        string icon = GetDatabaseVisualIcon(visualIcons,questionNumber);

                        var visibleObjects = Enumerable
                            .Repeat(icon, secondNumber)
                            .ToList();

                        questionText =
                            $"There are {firstNumber} objects in total. " +
                            $"You can see {secondNumber} objects outside the chest. " +
                            "How many objects are hidden inside?";

                        data = new
                        {
                          questionType = code,
                          icon,
                          totalCount = firstNumber,
                          visibleCount = secondNumber,
                          hiddenCount = difference,
                          visibleObjects,
                          equation = $"{firstNumber} - {secondNumber} = ?",
                          selectionMode = "input",
                          answerType = "number"
                        };

                        break;
                    }

                default:
                    throw new ArgumentException(
                        $"Unsupported visual subtraction question type: {code}");
            }

            return CreateQuestion(questionNumber,questionTypeId,questionText,data,answer);
        }
        private GeneratedQuestion GenerateCountdownLoopTrack(int questionNumber,int questionTypeId,string code,int levelId,int difficultyId,HashSet<string> usedGameCombinations)
        {
            if (usedGameCombinations == null)
            {
                throw new ArgumentNullException(nameof(usedGameCombinations));
            }

           
            int actualDifficulty = ResolveDifficulty(difficultyId);

            if (!SubtractionDifficultyConfig.ByGrade.TryGetValue(levelId,out var difficultyRanges))
            {
                throw new InvalidOperationException($"Subtraction difficulty configuration not found " +$"for level {levelId}.");
            }

            if (actualDifficulty < 1 || actualDifficulty > difficultyRanges.Length)
            {
                throw new ArgumentOutOfRangeException(nameof(difficultyId),difficultyId,$"Resolved difficulty {actualDifficulty} is not configured " +$"for level {levelId}.");
            }

            var range = difficultyRanges[actualDifficulty - 1];

            var (minSteps, maxSteps) = actualDifficulty switch
            {
                1 => (3, 6),
                2 => (4, 8),
                3 => (5, 10),

                _ => throw new ArgumentOutOfRangeException(
                    nameof(actualDifficulty))
            };

            for (int attempt = 0; attempt < 500; attempt++)
            {
                int startNumber = _random.Next(range.Min,range.Max + 1);

                int maxAllowedSteps = Math.Min(maxSteps,startNumber);

                if (maxAllowedSteps < minSteps)
                {
                    continue;
                }

                int stepsBack = _random.Next(minSteps,maxAllowedSteps + 1);

                int landingNumber = startNumber - stepsBack;

                var trackNumbers = Enumerable
                    .Range(0, stepsBack + 1)
                    .Select(i => startNumber - i)
                    .ToList();

                string combinationKey =
                    $"{code}:{startNumber}:{stepsBack}:{landingNumber}";

                if (usedGameCombinations.Contains(combinationKey))
                {
                    continue;
                }

                string questionText;
                object data;
                string answer = landingNumber.ToString();

                switch (code)
                {

                    case "BROKEN_FUSE_COUNTDOWN_TRACK":
                        {
                            int breakPosition = stepsBack;

                            var displayedTrackNumbers = trackNumbers
                                .Select((number, index) =>
                                    index == breakPosition
                                        ? (int?)null
                                        : number)
                                .ToList();

                            questionText =
                                $"The countdown fuse starts at {startNumber}. " +
                                $"It counts backward {stepsBack} places. " +
                                "Which number completes the broken fuse track?";

                            data = new
                            {
                                brokenFuseCountdownTrack = new
                                {
                                    startNumber,
                                    trackNumbers = displayedTrackNumbers,
                                    breakMarker = breakPosition,
                                    trackStyle = "broken-fuse",
                                    equation = $"{startNumber} - {stepsBack} = ?"
                                }
                            };

                            break;
                        }

                    case "DUAL_EXIT_COUNTDOWN_SPLIT":
                        {
                            int decoyExit = landingNumber == 0
                                ? landingNumber + 1
                                : landingNumber - 1;

                            bool correctOnA = _random.Next(0, 2) == 0;

                            int branchA = correctOnA
                                ? landingNumber
                                : decoyExit;

                            int branchB = correctOnA
                                ? decoyExit
                                : landingNumber;

                            questionText =
                                $"A vehicle starts at {startNumber} and moves " +
                                $"{stepsBack} places backward. " +
                                "Which exit shows the correct landing number?";

                            data = new
                            {
                                dualExitCountdownSplit = new
                                {
                                    startNumber,
                                    branchA,
                                    branchB,
                                    trackStyle = "dual-exit",
                                    equation = $"{startNumber} - {stepsBack} = ?"
                                }
                            };

                            break;
                        }


                    case "TARGET_LANDMARK_BRAKING_TRACK":
                        {
                            questionText =
                                $"A racing car starts at {startNumber}. " +
                                $"It brakes and moves backward {stepsBack} places. " +
                                "Which landmark will it reach?";

                            data = new
                            {
                                targetLandmarkBrakingTrack = new
                                {
                                    startNumber,
                                    targetLandmark = landingNumber,
                                    footprints = trackNumbers,
                                    trackStyle = "landmark-braking",
                                    equation = $"{startNumber} - {stepsBack} = ?"
                                }
                            };

                            break;
                        }

                    case "LOOP_DE_LOOP_PORTAL_WARP":
                        {
                            questionText =
                                $"Enter the portal at {startNumber}. " +
                                $"Travel backward {stepsBack} positions. " +
                                "Which number is on the landing pad?";

                            data = new
                            {
                                loopDeLoopPortalWarp = new
                                {
                                    trackNumbers,
                                    portalEntry = startNumber,
                                    backwardSlots = stepsBack,
                                    landingPad = landingNumber,
                                    portalStyle = "loop-portal",
                                    equation = $"{startNumber} - {stepsBack} = ?"
                                }
                            };

                            break;
                        }

                    default:
                        throw new ArgumentException(
                            $"Unsupported countdown question type: {code}",
                            nameof(code));
                }
                if (!usedGameCombinations.Add(combinationKey))
                {
                    continue;
                }

                return CreateQuestion(questionNumber,questionTypeId,questionText,data,answer);
            }

            throw new InvalidOperationException(
                $"Could not generate a unique question for {code}. " +
                "The available combinations may be exhausted.");
        }
        private GeneratedQuestion GenerateTwoStepSubtractionStory(int questionNumber,int questionTypeId,int levelId,int difficultyId,QuestionType questionType,HashSet<string> usedGameCombinations)
        {
            if (questionType == null)
                throw new ArgumentNullException(nameof(questionType));

            if (usedGameCombinations == null)
                throw new ArgumentNullException(nameof(usedGameCombinations));

            string code = questionType.Code?.Trim().ToUpperInvariant() ?? "";

            string[] supportedTypes =
            {
        "STORY_GIVE_AWAY_TWICE",
        "STORY_BUS_PASSENGERS",
        "STORY_SPEND_TWICE",
        "STORY_USE_SUPPLIES"
    };

            if (!supportedTypes.Contains(code))
                throw new ArgumentException(
                    $"Unsupported story question type: {code}");

            int actualDifficulty = ResolveDifficulty(difficultyId);

            DifficultyRange range = GetDifficultyRange(
                SubtractionDifficultyConfig.ByGrade,
                levelId,
                actualDifficulty);

            int min = range.Min;
            int max = range.Max;

            var candidates =
                new List<(int start, int first, int second, int remaining)>();

            for (int start = Math.Max(3, min); start <= max; start++)
            {
                for (int first = 1; first < start - 1; first++)
                {
                    for (int second = 1; second < start - first; second++)
                    {
                        int remaining = start - first - second;

                        if (remaining < 1)
                            continue;

                        candidates.Add((start, first, second, remaining));
                    }
                }
            }

            if (candidates.Count == 0)
                throw new InvalidOperationException(
                    $"No valid story questions for level {levelId}, range {min}-{max}.");

            var selected = GetUnusedCandidate(
                candidates,
                $"TWO_STEP_STORY_{code}",
                x => $"{x.start}:{x.first}:{x.second}",
                usedGameCombinations);

            int startCount = selected.start;
            int firstTakeAway = selected.first;
            int secondTakeAway = selected.second;
            int afterFirst = startCount - firstTakeAway;
            int remainingCount = selected.remaining;

            string subject;
            string item;
            string action1;
            string action2;
            string questionText;

            switch (code)
            {
                case "STORY_GIVE_AWAY_TWICE":
                    subject = "Riya";
                    item = "stickers";
                    action1 = $"gives away {firstTakeAway}";
                    action2 = $"gives away {secondTakeAway} more";
                    questionText =
                        $"{subject} has {startCount} {item}. " +
                        $"She {action1} and then {action2}. " +
                        $"How many {item} are left?";
                    break;

                case "STORY_BUS_PASSENGERS":
                    subject = "A bus";
                    item = "passengers";
                    action1 = $"lets {firstTakeAway} passengers get off";
                    action2 = $"lets {secondTakeAway} more passengers get off";
                    questionText =
                        $"{subject} has {startCount} {item}. " +
                        $"At the first stop, it {action1}. " +
                        $"At the next stop, it {action2}. " +
                        $"How many passengers remain on the bus?";
                    break;

                case "STORY_SPEND_TWICE":
                    subject = "Aarav";
                    item = "coins";
                    action1 = $"spends {firstTakeAway} coins";
                    action2 = $"spends {secondTakeAway} more coins";
                    questionText =
                        $"{subject} has {startCount} {item}. " +
                        $"He {action1} and then {action2}. " +
                        $"How many coins does he have left?";
                    break;

                default: // STORY_USE_SUPPLIES
                    subject = "Mia";
                    item = "crayons";
                    action1 = $"uses {firstTakeAway} crayons";
                    action2 = $"uses {secondTakeAway} more crayons";
                    questionText =
                        $"{subject} has {startCount} {item}. " +
                        $"She {action1} and then {action2}. " +
                        $"How many crayons are unused?";
                    break;
            }

            object data = new
            {
                renderKey = "TWO_STEP_SUBTRACTION_STORY",
                questionType = code,
                startCount,
                firstTakeAway,
                remainingAfterFirst = afterFirst,
                secondTakeAway,
                remainingCount,
                story = questionText,
                equation = $"{startCount} - {firstTakeAway} - {secondTakeAway} = ?",
                steps = new[]
                {
            new
            {
                step = 1,
                equation = $"{startCount} - {firstTakeAway} = ?",
                answer = afterFirst
            },
            new
            {
                step = 2,
                equation = $"{afterFirst} - {secondTakeAway} = ?",
                answer = remainingCount
            }
        },
                selectionMode = "input",
                answerType = "number"
            };

            return CreateQuestion(
                questionNumber,
                questionTypeId,
                questionText,
                data,
                remainingCount.ToString());
        }
        private GeneratedQuestion GenerateSubtractionDetective(int questionNumber,int questionTypeId,int levelId,int difficultyId,QuestionType questionType,HashSet<string> usedGameCombinations)
        {
            if (questionType == null)
                throw new ArgumentNullException(nameof(questionType));

            if (usedGameCombinations == null)
                throw new ArgumentNullException(nameof(usedGameCombinations));

            string code = questionType.Code?.Trim().ToUpperInvariant() ?? "";

            int actualDifficulty = ResolveDifficulty(difficultyId);

            DifficultyRange range = GetDifficultyRange(
                SubtractionDifficultyConfig.ByGrade,
                levelId,
                actualDifficulty);

            int min = Math.Max(2, range.Min);
            int max = range.Max;

            if (min > max)
                throw new InvalidOperationException(
                    $"Invalid detective range {min}-{max}.");

            switch (code)
            {
                case "DETECTIVE_MISSING_NUMBER":
                    {
                        var candidates = new List<(int start, int takeAway, int result)>();

                        for (int start = min; start <= max; start++)
                        {
                            for (int takeAway = 1; takeAway < start; takeAway++)
                            {
                                int result = start - takeAway;

                                if (result >= 1)
                                    candidates.Add((start, takeAway, result));
                            }
                        }

                        if (candidates.Count == 0)
                            throw new InvalidOperationException(
                                "No missing-number questions are available.");

                        var selected = GetUnusedCandidate(
                            candidates,
                            $"SUBTRACTION_DETECTIVE_{code}",
                            x => $"{x.start}:{x.takeAway}:{x.result}",
                            usedGameCombinations);

                        int missingNumber = selected.takeAway;

                        string text =
                            $"{selected.start} - □ = {selected.result}. " +
                            "Find the missing number.";

                        object data = new
                        {
                            renderKey = "SUBTRACTION_DETECTIVE",
                            questionType = code,
                            startNumber = selected.start,
                            missingPosition = "subtrahend",
                            result = selected.result,
                            equation = $"{selected.start} - □ = {selected.result}",
                            selectionMode = "input",
                            answerType = "number"
                        };

                        return CreateQuestion(
                            questionNumber, questionTypeId, text, data,
                            missingNumber.ToString());
                    }

                case "DETECTIVE_FIND_ERROR":
                    {
                        var candidates = new List<
                            (int start, int takeAway, int wrongAnswer)>();

                        for (int start = min; start <= max; start++)
                        {
                            for (int takeAway = 1; takeAway < start; takeAway++)
                            {
                                int correctAnswer = start - takeAway;

                                for (int wrong = 0; wrong <= max; wrong++)
                                {
                                    if (wrong != correctAnswer)
                                    {
                                        candidates.Add((start, takeAway, wrong));
                                    }
                                }
                            }
                        }

                        if (candidates.Count == 0)
                            throw new InvalidOperationException(
                                "No calculation-error questions are available.");

                        var selected = GetUnusedCandidate(
                            candidates,
                            $"SUBTRACTION_DETECTIVE_{code}",
                            x => $"{x.start}:{x.takeAway}:{x.wrongAnswer}",
                            usedGameCombinations);

                        int correct = selected.start - selected.takeAway;

                        string text =
                            $"A child says {selected.start} - {selected.takeAway} " +
                            $"= {selected.wrongAnswer}. Is the answer correct?";

                        object data = new
                        {
                            renderKey = "SUBTRACTION_DETECTIVE",
                            questionType = code,
                            startNumber = selected.start,
                            takeAway = selected.takeAway,
                            shownAnswer = selected.wrongAnswer,
                            correctAnswer = correct,
                            equation =
                                $"{selected.start} - {selected.takeAway} = {selected.wrongAnswer}",
                            options = new[] { "Correct", "Incorrect" },
                            selectionMode = "choice"
                        };

                        return CreateQuestion(
                            questionNumber, questionTypeId, text, data,
                            $"Incorrect. The correct answer is {correct}.");
                    }

                case "DETECTIVE_MATCH_EQUATION":
                    {
                        var candidates = new List<
                            (int target, int start, int takeAway)>();

                        for (int target = 1; target < max; target++)
                        {
                            for (int start = min; start <= max; start++)
                            {
                                int takeAway = start - target;

                                if (takeAway >= 1 && takeAway < start)
                                {
                                    candidates.Add((target, start, takeAway));
                                }
                            }
                        }

                        if (candidates.Count == 0)
                            throw new InvalidOperationException(
                                "No equation-matching questions are available.");

                        var selected = GetUnusedCandidate(candidates,$"SUBTRACTION_DETECTIVE_{code}",x => $"{x.target}:{x.start}:{x.takeAway}",usedGameCombinations);

                        string correctEquation = $"{selected.start} - {selected.takeAway}";

                        var wrongOptions = new List<string>();

                        for (int start = min; start <= max; start++)
                        {
                            for (int takeAway = 1; takeAway < start; takeAway++)
                            {
                                if (start - takeAway == selected.target)
                                    continue;

                                string equation = $"{start} - {takeAway}";

                                if (!wrongOptions.Contains(equation))
                                    wrongOptions.Add(equation);
                            }
                        }

                        if (wrongOptions.Count < 2)
                            throw new InvalidOperationException(
                                "Not enough unique incorrect equations are available.");

                        for (int i = wrongOptions.Count - 1; i > 0; i--)
                        {
                            int j = _random.Next(i + 1);
                            (wrongOptions[i], wrongOptions[j]) =
                                (wrongOptions[j], wrongOptions[i]);
                        }

                        var options = new List<string>
                       {
                        correctEquation,
                        wrongOptions[0],
                        wrongOptions[1]
                        };

                        for (int i = options.Count - 1; i > 0; i--)
                        {
                            int j = _random.Next(i + 1);
                            (options[i], options[j]) = (options[j], options[i]);
                        }

                        string text =
                            $"Which subtraction equation equals {selected.target}?";

                        object data = new
                        {
                            renderKey = "SUBTRACTION_DETECTIVE",
                            questionType = code,
                            targetNumber = selected.target,
                            options,
                            selectionMode = "choice"
                        };

                        return CreateQuestion(
                            questionNumber, questionTypeId, text, data,
                            correctEquation);
                    }

                case "DETECTIVE_NUMBER_CHAIN":
                    {
                        var candidates = new List<
                            (int start, int firstTakeAway, int secondTakeAway)>();

                        for (int start = min; start <= max; start++)
                        {
                            for (int first = 1; first < start - 1; first++)
                            {
                                for (int second = 1; second < start - first; second++)
                                {
                                    int final = start - first - second;

                                    if (final >= 1)
                                        candidates.Add((start, first, second));
                                }
                            }
                        }

                        if (candidates.Count == 0)
                            throw new InvalidOperationException(
                                "No number-chain questions are available.");

                        var selected = GetUnusedCandidate(
                            candidates,
                            $"SUBTRACTION_DETECTIVE_{code}",
                            x => $"{x.start}:{x.firstTakeAway}:{x.secondTakeAway}",
                            usedGameCombinations);

                        int missingNumber = selected.start - selected.firstTakeAway;
                        int finalNumber = missingNumber - selected.secondTakeAway;

                        string text =
                            $"{selected.start} → -{selected.firstTakeAway} → □ " +
                            $"→ -{selected.secondTakeAway} → {finalNumber}. " +
                            "Find the missing number.";

                        object data = new
                        {
                            renderKey = "SUBTRACTION_DETECTIVE",
                            questionType = code,
                            startNumber = selected.start,
                            firstTakeAway = selected.firstTakeAway,
                            secondTakeAway = selected.secondTakeAway,
                            missingNumber,
                            finalNumber,
                            selectionMode = "input",
                            answerType = "number"
                        };

                        return CreateQuestion(questionNumber, questionTypeId, text, data,missingNumber.ToString());
                    }

                default:
                    throw new ArgumentException(
                        $"Unsupported subtraction detective type: {code}");
            }
        }
        private GeneratedQuestion GenerateMentalSubtraction(int questionNumber,int questionTypeId,int levelId,int difficultyId,QuestionType questionType,HashSet<string> usedGameCombinations)
        {
            if (questionType == null)
                throw new ArgumentNullException(nameof(questionType));

            if (usedGameCombinations == null)
                throw new ArgumentNullException(nameof(usedGameCombinations));

            string code = questionType.Code?.Trim().ToUpperInvariant()?? string.Empty;

            string[] supportedTypes =
            {
    "SUBTRACT_WITHIN_ZERO_TEN",
    "SUBTRACT_BY_COUNTING_BACK",
    "SUBTRACT_BY_COUNTING_UP",
    "MISSING_MINUEND_OR_SUBTRAHEND_WITHIN_TEN",
    "SUBTRACT_WITHIN_ONE_TWENTY",
    "SUBTRACT_ONE_DIGIT_FROM_ONE_HUNDREDD_NO_REGROUPING",
    "SUBTRACT_ONE_DIGIT_FROM_ONE_HUNDREED_MISSING_NUMBERS",
    "SUBTRACT_WHOLE_TENS",
    "SUBTRACT_WHOLE_TENS_MISSING_NUMBERS",
    "SUBTRACT_FROM_WHOLE_TENS"
};

            if (!supportedTypes.Contains(code))
            {
                throw new ArgumentException(
                    $"Unsupported mental subtraction question type: {code}");
            }

            if (!supportedTypes.Contains(code))
            {
                throw new ArgumentException(
                    $"Unsupported mental subtraction question type: {code}");
            }

            int actualDifficulty = ResolveDifficulty(difficultyId);

            if (!SubtractionDifficultyConfig.ByGrade.TryGetValue(
                    levelId,
                    out var configuredRanges))
            {
                throw new ArgumentException(
                    $"Subtraction difficulty configuration not found for level {levelId}.");
            }

            if (actualDifficulty < 1 ||
                actualDifficulty > configuredRanges.Length)
            {
                throw new ArgumentException(
                    $"Difficulty {actualDifficulty} is not configured for level {levelId}.");
            }

            DifficultyRange range = configuredRanges[actualDifficulty - 1];

            int configuredMin = Math.Max(1, range.Min);
            int configuredMax = range.Max;

            var candidates =
                new List<(int start, int takeAway, int result, string? missingPosition)>();

            void AddCandidate(int start,int takeAway,string? missingPosition = null)
            {
                if (start < configuredMin || start > configuredMax)
                    return;

                int result = start - takeAway;

                if (result < 0)
                    return;

                candidates.Add((start, takeAway, result, missingPosition));
            }


            if (code == "SUBTRACT_WITHIN_ZERO_TEN")
            {
                int upperBound = Math.Min(10, configuredMax);

                for (int start = configuredMin;
                     start <= upperBound;
                     start++)
                {
                    for (int takeAway = 1;
                         takeAway <= start;
                         takeAway++)
                    {
                        AddCandidate(start, takeAway);
                    }
                }
            }


            else if (code == "SUBTRACT_BY_COUNTING_BACK")
            {
                int maximumSteps = actualDifficulty switch
                {
                    1 => 5,
                    2 => 8,
                    3 => 10,
                    _ => throw new ArgumentOutOfRangeException(nameof(difficultyId))
                };

                for (int start = Math.Max(2, configuredMin);start <= configuredMax;start++)
                {
                    for (int steps = 1;
                         steps <= Math.Min(maximumSteps, start);
                         steps++)
                    {
                        AddCandidate(start, steps);
                    }
                }
            }


            else if (code == "SUBTRACT_BY_COUNTING_UP")
            {
                int maximumSteps = actualDifficulty switch
                {
                    1 => 5,
                    2 => 8,
                    3 => 10,
                    _ => throw new ArgumentOutOfRangeException(nameof(difficultyId))
                };

                for (int lower = configuredMin;
                     lower <= configuredMax;
                     lower++)
                {
                    for (int steps = 1;
                         steps <= maximumSteps &&
                         lower + steps <= configuredMax;
                         steps++)
                    {
                        int upper = lower + steps;

                        AddCandidate(upper, lower);
                    }
                }
            }

            else if (code == "MISSING_MINUEND_OR_SUBTRAHEND_WITHIN_TEN")
            {
                int upperBound = Math.Min(10, configuredMax);

                for (int start = configuredMin;
                     start <= upperBound;
                     start++)
                {
                    for (int takeAway = 1;
                         takeAway < start;
                         takeAway++)
                    {
                        AddCandidate(start, takeAway, "minuend");
                        AddCandidate(start, takeAway, "subtrahend");
                    }
                }
            }


            else if (code == "SUBTRACT_WITHIN_ONE_TWENTY")
            {
                int upperBound = Math.Min(20, configuredMax);

                for (int start = configuredMin;
                     start <= upperBound;
                     start++)
                {
                    for (int takeAway = 1;
                         takeAway < start;
                         takeAway++)
                    {
                        AddCandidate(start, takeAway);
                    }
                }
            }

            else if (
                code == "SUBTRACT_ONE_DIGIT_FROM_ONE_HUNDREDD_NO_REGROUPING" ||
                code == "SUBTRACT_ONE_DIGIT_FROM_ONE_HUNDREED_MISSING_NUMBERS")
            {
                int upperBound = Math.Min(100, configuredMax);

                bool isMissingNumber =
                    code == "SUBTRACT_ONE_DIGIT_FROM_ONE_HUNDREED_MISSING_NUMBERS";

                for (int start = configuredMin;start <= upperBound;start++)
                {
                    for (int takeAway = 1;takeAway <= 9 && takeAway < start;takeAway++)
                    {
                        if (!CanSubtractWithoutBorrowing(start, takeAway))
                            continue;

                        AddCandidate(start,takeAway,isMissingNumber ? "subtrahend" : null);
                    }
                }
            }

            else if (code == "SUBTRACT_WHOLE_TENS" ||code == "SUBTRACT_WHOLE_TENS_MISSING_NUMBERS")
            {
                int firstWholeTen = ((configuredMin + 9) / 10) * 10;

                int lastWholeTen = (configuredMax / 10) * 10;

                bool isMissingNumber =  code == "SUBTRACT_WHOLE_TENS_MISSING_NUMBERS";

                for (int start = firstWholeTen;start <= lastWholeTen;start += 10)
                {
                    for (int takeAway = firstWholeTen;takeAway < start && takeAway <= lastWholeTen;takeAway += 10)
                    {
                        if (isMissingNumber)
                        {
                            AddCandidate(start, takeAway, "minuend");
                            AddCandidate(start, takeAway, "subtrahend");
                            AddCandidate(start, takeAway, "difference");
                        }
                        else
                        {
                            AddCandidate(start, takeAway);
                        }
                    }
                }
            }

            else if (code == "SUBTRACT_FROM_WHOLE_TENS")
            {
                int firstWholeTen = ((configuredMin + 9) / 10) * 10;

                int lastWholeTen = (configuredMax / 10) * 10;

                for (int start = firstWholeTen;start <= lastWholeTen;start += 10)
                {
                    for (int takeAway = 1;takeAway <= 9;takeAway++)
                    {
                        AddCandidate(start, takeAway);
                    }
                }
            }


            if (candidates.Count == 0)
            {
                throw new InvalidOperationException(
                    $"No candidates are available for {code}, " +
                    $"level {levelId}, difficulty {actualDifficulty}, " +
                    $"configured range {range.Min}-{range.Max}. " +
                    "Check whether the configured range supports this category.");
            }

            var selected = GetUnusedCandidate(candidates,$"MENTAL_SUBTRACTION_{code}",x => $"{x.start}:{x.takeAway}:{x.missingPosition}",usedGameCombinations);

            int startNumber = selected.start;
            int takeAwayNumber = selected.takeAway;
            int resultNumber = selected.result;
            string? missingPosition = selected.missingPosition;


            string equation;
            string questionText;
            string answer;

            switch (missingPosition)
            {
                case "minuend":
                    equation = $"? - {takeAwayNumber} = {resultNumber}";
                    answer = startNumber.ToString();
                    questionText = $"{equation}. Find the missing number.";
                    break;

                case "subtrahend":
                    equation = $"{startNumber} - ? = {resultNumber}";
                    answer = takeAwayNumber.ToString();
                    questionText = $"{equation}. Find the missing number.";
                    break;

                case "difference":
                    equation = $"{startNumber} - {takeAwayNumber} = ?";
                    answer = resultNumber.ToString();
                    questionText = $"{equation}. Find the missing number.";
                    break;

                default:
                    equation = $"{startNumber} - {takeAwayNumber} = ?";
                    answer = resultNumber.ToString();
                    questionText = equation;
                    break;
            }

            if (code == "SUBTRACT_BY_COUNTING_BACK")
            {
                questionText =
                    $"{startNumber} - {takeAwayNumber} = ?";
            }
            else if (code == "SUBTRACT_BY_COUNTING_UP")
            {
                questionText =
                    $"{startNumber} - {takeAwayNumber} = ?";
            }

            List<int?> countingBackNumbers = code == "SUBTRACT_BY_COUNTING_BACK"
                    ? Enumerable
                        .Range(0, takeAwayNumber + 1)
                        .Select(index =>
                            index == takeAwayNumber
                                ? (int?)null
                                : startNumber - index)
                        .ToList()
                    : new List<int?>();

            List<int> countingUpNumbers = code == "SUBTRACT_BY_COUNTING_UP"
                    ? Enumerable
                        .Range(0, resultNumber + 1)
                        .Select(index => takeAwayNumber + index)
                        .ToList()
                    : new List<int>();

            object data = new
            {
               questionType = code,
               startNumber = missingPosition == "minuend"? (int?)null: startNumber,
               takeAway = missingPosition == "subtrahend"? (int?)null: takeAwayNumber,
               difference = missingPosition == "difference"? (int?)null: resultNumber,
               missingPosition = missingPosition ?? "difference",
               equation,
               countingBackNumbers,
               countingUpNumbers,
               countingSteps =  code == "SUBTRACT_BY_COUNTING_BACK"? (int?)takeAwayNumber: code == "SUBTRACT_BY_COUNTING_UP"? resultNumber: null,
               selectionMode = "input",
               answerType = "number"
            };

            return CreateQuestion(questionNumber,questionTypeId,questionText,data,answer);
        }
        private GeneratedQuestion GenerateSubtractionPixelMystery(int questionNumber,int questionTypeId,int levelId,int difficultyId,QuestionType questionType,HashSet<string> usedGameCombinations)
        {
            if (questionType == null)
                throw new ArgumentNullException(nameof(questionType));

            if (usedGameCombinations == null)
                throw new ArgumentNullException(nameof(usedGameCombinations));

            string code =
                questionType.Code?.Trim().ToUpperInvariant() ?? string.Empty;

            string[] supportedCodes =
            {
                    "PIXEL_COLOR_BY_DIFFERENCE",
                    "PIXEL_FIX_BROKEN_SQUARES",
                    "PIXEL_MATCH_DIFFERENCE",
                    "PIXEL_MISSING_EQUATION"
            };

            if (!supportedCodes.Contains(code))
            {
                throw new ArgumentException(
                    $"Unsupported Pixel Mystery question type: {code}");
            }

            int actualDifficulty = ResolveDifficulty(difficultyId);

            DifficultyRange range = GetDifficultyRange(
                SubtractionDifficultyConfig.ByGrade,
                levelId,
                actualDifficulty);

            int min = range.Min;
            int max = range.Max;

            if (min < 1 || min >= max)
            {
                throw new InvalidOperationException(
                    $"Invalid subtraction range {min}-{max} for level {levelId}.");
            }

            const int rows = 4;
            const int columns = 4;
            const int cellCount = rows * columns;

            // A small pixel-art rocket pattern.
            // The correct layout is kept out of the visible question data.
            string[,] pixelLayout =
            {
                { "BLUE", "BLUE", "YELLOW", "BLUE" },
                { "BLUE", "RED",  "CYAN",   "RED"  },
                { "RED",  "RED",  "RED",    "ORANGE" },
                { "BLUE", "RED",  "ORANGE", "BLUE" }
            };

            var colors = new List<(string Name, string Hex)>
           {
                ("BLUE",   "#60A5FA"),
                ("RED",    "#F87171"),
                ("YELLOW", "#FACC15"),
                ("CYAN",   "#22D3EE"),
                ("ORANGE", "#FB923C")
        };

            int maxDifference = Math.Min(
                max - min,
                Math.Max(5, max / 4));

            if (maxDifference < colors.Count)
            {
                throw new InvalidOperationException(
                    "The current number range is too small for the Pixel Mystery palette.");
            }

            var possibleDifferences = Enumerable
                .Range(1, maxDifference)
                .ToList();

            Shuffle(possibleDifferences);

            var selectedDifferences = possibleDifferences
                .Take(colors.Count)
                .OrderBy(x => x)
                .ToList();
            var colorFrequency = colors
                .Select(color =>
                {
                    int count = 0;

                    for (int row = 0; row < rows; row++)
                    {
                        for (int column = 0; column < columns; column++)
                        {
                            if (pixelLayout[row, column] == color.Name)
                                count++;
                        }
                    }

                    return new
                    {
                        color.Name,
                        Count = count
                    };
                })
                .OrderByDescending(x => x.Count)
                .ThenBy(x => x.Name)
                .ToList();

            var differenceByColor = new Dictionary<string, int>();

            for (int i = 0; i < colorFrequency.Count; i++)
            {
                differenceByColor[colorFrequency[i].Name] =
                    selectedDifferences[i];
            }

            foreach (var frequency in colorFrequency)
            {
                int difference = differenceByColor[frequency.Name];

                int availableEquationCount =
                    max - min - difference + 1;

                if (availableEquationCount < frequency.Count)
                {
                    throw new InvalidOperationException(
                        $"Not enough unique equations for color {frequency.Name}. " +
                        "Use a larger number range or a smaller pixel pattern.");
                }
            }

            var colorKey = colors
                .Select(color => new
                {
                    color = color.Name,
                    hex = color.Hex,
                    difference = differenceByColor[color.Name]
                })
                .ToArray();

            string keyPrefix =
                $"SUBTRACTION_PIXEL_MYSTERY:{code}:L{levelId}:D{actualDifficulty}";

            (int Start, int TakeAway, int Result) CreateEquation(
                int result,
                HashSet<string> usedEquations)
            {
                int lowestStart = min + result;

                if (lowestStart > max)
                {
                    throw new InvalidOperationException(
                        $"Cannot create an equation for difference {result}.");
                }

                var availableStarts = Enumerable
                    .Range(lowestStart, max - lowestStart + 1)
                    .Where(start =>
                        !usedEquations.Contains($"{start}:{start - result}"))
                    .ToList();

                if (availableStarts.Count == 0)
                {
                    throw new InvalidOperationException(
                        $"No unused equations remain for difference {result}.");
                }

                int first = availableStarts[
                    _random.Next(availableStarts.Count)];

                int second = first - result;

                usedEquations.Add($"{first}:{second}");

                return (first, second, result);
            }

            List<(
                string Id,
                int Row,
                int Column,
                int Start,
                int TakeAway,
                int Result,
                string ExpectedColor)> BuildGrid(
                    HashSet<string> usedEquations)
            {
                var cells = new List<(
                    string Id,
                    int Row,
                    int Column,
                    int Start,
                    int TakeAway,
                    int Result,
                    string ExpectedColor)>();

                for (int row = 0; row < rows; row++)
                {
                    for (int column = 0; column < columns; column++)
                    {
                        int index = row * columns + column;

                        string expectedColor = pixelLayout[row, column];

                        int result = differenceByColor[expectedColor];

                        var equation = CreateEquation(result, usedEquations);

                        cells.Add((
                            $"PIXEL_{index + 1:D2}",
                            row,
                            column,
                            equation.Start,
                            equation.TakeAway,
                            equation.Result,
                            expectedColor));
                    }
                }

                return cells;
            }

            string GridSignature(
                IEnumerable<(string Id, int Row, int Column,
                    int Start, int TakeAway, int Result, string ExpectedColor)> cells)
            {
                return string.Join(
                    "|",
                    cells.Select(x => $"{x.Start}-{x.TakeAway}"));
            }


            if (code == "PIXEL_COLOR_BY_DIFFERENCE")
            {
                for (int attempt = 0; attempt < 200; attempt++)
                {
                    var usedEquations = new HashSet<string>();
                    var cells = BuildGrid(usedEquations);

                    string combinationKey =
                        $"{keyPrefix}:{GridSignature(cells)}";

                    if (!usedGameCombinations.Add(combinationKey))
                        continue;

                    var correctColors = cells.ToDictionary(
                        x => x.Id,
                        x => x.ExpectedColor);

                    string questionText =
                        "Solve each subtraction equation and select its matching color. " +
                        "Color all the pixels to reveal the hidden picture.";

                    object data = new
                    {
                        renderKey = "SUBTRACTION_PIXEL_MYSTERY",
                        questionType = code,
                        puzzleTitle = "Reveal the Hidden Picture",
                        instructions =
                            "Solve each equation. Match its difference to the color key.",
                        rows,
                        columns,
                        colorKey,
                        cells = cells.Select(x => new
                        {
                            id = x.Id,
                            row = x.Row,
                            column = x.Column,
                            equation = $"{x.Start} - {x.TakeAway} = ?",
                            colorOptions = colors.Select(c => c.Name).ToArray()
                        }).ToArray(),
                        answerMode = "pixel-colors"
                    };

                    return CreateQuestion(
                        questionNumber,
                        questionTypeId,
                        questionText,
                        data,
                        System.Text.Json.JsonSerializer.Serialize(correctColors));
                }

                throw new InvalidOperationException(
                    "Could not generate a unique Pixel Color puzzle.");
            }


            if (code == "PIXEL_FIX_BROKEN_SQUARES")
            {
                for (int attempt = 0; attempt < 200; attempt++)
                {
                    var usedEquations = new HashSet<string>();
                    var cells = BuildGrid(usedEquations);

                    var shuffledIndices = Enumerable
                        .Range(0, cellCount)
                        .ToList();

                    Shuffle(shuffledIndices);

                    var brokenIndices = shuffledIndices
                        .Take(4)
                        .ToHashSet();

                    var correctRepairs = new Dictionary<string, string>();
                    var visibleCells = new List<object>();
                    var signature = new List<string>();

                    foreach (var cell in cells)
                    {
                        bool isBroken = brokenIndices.Contains(
                            cell.Row * columns + cell.Column);

                        string shownColor = cell.ExpectedColor;

                        if (isBroken)
                        {
                            var alternatives = colors
                                .Select(c => c.Name)
                                .Where(name => name != cell.ExpectedColor)
                                .ToList();

                            shownColor = alternatives[
                                _random.Next(alternatives.Count)];

                            correctRepairs[cell.Id] = cell.ExpectedColor;
                        }

                        visibleCells.Add(new
                        {
                            id = cell.Id,
                            row = cell.Row,
                            column = cell.Column,
                            equation = $"{cell.Start} - {cell.TakeAway} = ?",
                            shownColor
                        });

                        signature.Add(
                            $"{cell.Start}-{cell.TakeAway}-{shownColor}");
                    }

                    string combinationKey =
                        $"{keyPrefix}:{string.Join("|", signature)}";

                    if (!usedGameCombinations.Add(combinationKey))
                        continue;

                    string questionText =
                        "Four pixels are colored incorrectly. Use the equations and " +
                        "color key to identify and repair the four broken pixels.";

                    object data = new
                    {
                        renderKey = "SUBTRACTION_PIXEL_MYSTERY",
                        questionType = code,
                        puzzleTitle = "Repair the Broken Pixels",
                        instructions =
                            "Check each equation against the color key. Fix the four " +
                            "pixels whose displayed colors are incorrect.",
                        rows,
                        columns,
                        colorKey,
                        cells = visibleCells,
                        brokenPixelCount = 4,
                        answerMode = "repair-pixels"
                    };

                    return CreateQuestion(
                        questionNumber,
                        questionTypeId,
                        questionText,
                        data,
                        System.Text.Json.JsonSerializer.Serialize(correctRepairs));
                }

                throw new InvalidOperationException(
                    "Could not generate a unique Broken Pixels puzzle.");
            }

            if (code == "PIXEL_MATCH_DIFFERENCE")
            {
                for (int attempt = 0; attempt < 200; attempt++)
                {
                    int targetDifference = selectedDifferences[
                        _random.Next(selectedDifferences.Count)];

                    var distractorDifferences = Enumerable
                        .Range(1, max - min)
                        .Where(x => x != targetDifference)
                        .ToList();

                    if (distractorDifferences.Count < 6)
                        continue;

                    Shuffle(distractorDifferences);

                    var usedEquations = new HashSet<string>();

                    var rawCards = new List<(
                        int Start,
                        int TakeAway,
                        int Result,
                        bool IsMatch)>();

                    for (int i = 0; i < 2; i++)
                    {
                        var equation = CreateEquation(
                            targetDifference,
                            usedEquations);

                        rawCards.Add((
                            equation.Start,
                            equation.TakeAway,
                            equation.Result,
                            true));
                    }

                    foreach (int difference in distractorDifferences.Take(6))
                    {
                        var equation = CreateEquation(
                            difference,
                            usedEquations);

                        rawCards.Add((
                            equation.Start,
                            equation.TakeAway,
                            equation.Result,
                            false));
                    }

                    Shuffle(rawCards);

                    string combinationKey =
                        $"{keyPrefix}:{targetDifference}:" +
                        string.Join("|", rawCards.Select(x =>
                            $"{x.Start}-{x.TakeAway}"));

                    if (!usedGameCombinations.Add(combinationKey))
                        continue;

                    var cards = rawCards
                        .Select((x, index) => new
                        {
                            id = $"PIXEL_{index + 1:D2}",
                            row = index / 4,
                            column = index % 4,
                            equation = $"{x.Start} - {x.TakeAway}"
                        })
                        .ToArray();

                    var answerIds = rawCards
                        .Select((x, index) => new
                        {
                            x.IsMatch,
                            id = $"PIXEL_{index + 1:D2}"
                        })
                        .Where(x => x.IsMatch)
                        .Select(x => x.id)
                        .ToArray();

                    string questionText =
                        $"Find the two pixel cards whose subtraction answers equal " +
                        $"{targetDifference}.";

                    object data = new
                    {
                        renderKey = "SUBTRACTION_PIXEL_MYSTERY",
                        questionType = code,
                        puzzleTitle = "Find the Matching Pixels",
                        instructions =
                            "Solve each equation. Select exactly two cards with the target difference.",
                        targetDifference,
                        rows = 2,
                        columns = 4,
                        cells = cards,
                        requiredSelections = 2,
                        answerMode = "multi-select"
                    };

                    return CreateQuestion(
                        questionNumber,
                        questionTypeId,
                        questionText,
                        data,
                        System.Text.Json.JsonSerializer.Serialize(answerIds));
                }

                throw new InvalidOperationException(
                    "Could not generate a unique Matching Pixels puzzle.");
            }


            if (code == "PIXEL_MISSING_EQUATION")
            {
                for (int attempt = 0; attempt < 200; attempt++)
                {
                    var usedEquations = new HashSet<string>();
                    var cells = BuildGrid(usedEquations);

                    string combinationKey =
                        $"{keyPrefix}:MISSING:{GridSignature(cells)}";

                    if (!usedGameCombinations.Add(combinationKey))
                        continue;

                    var answers = cells.ToDictionary(
                        x => x.Id,
                        x => x.Result);

                    string questionText =
                        "Complete the missing number in every subtraction equation. " +
                        "Use the color key to reveal the hidden picture.";

                    object data = new
                    {
                        renderKey = "SUBTRACTION_PIXEL_MYSTERY",
                        questionType = code,
                        puzzleTitle = "Complete the Missing Pixels",
                        instructions =
                            "Find the missing difference in each equation. " +
                            "Use each correct answer to determine its pixel color.",
                        rows,
                        columns,
                        colorKey,
                        cells = cells.Select(x => new
                        {
                            id = x.Id,
                            row = x.Row,
                            column = x.Column,
                            equation = $"{x.Start} - {x.TakeAway} = ?",
                            missingPart = "difference"
                        }).ToArray(),
                        answerMode = "pixel-missing-numbers",
                        answerType = "number"
                    };

                    return CreateQuestion(
                        questionNumber,
                        questionTypeId,
                        questionText,
                        data,
                        System.Text.Json.JsonSerializer.Serialize(answers));
                }

                throw new InvalidOperationException(
                    "Could not generate a unique Missing Equation puzzle.");
            }

            throw new ArgumentException(
                $"Unsupported Pixel Mystery question type: {code}");
        }
        private GeneratedQuestion GenerateSubtractionEscapeVault(int questionNumber,int questionTypeId,int levelId,int difficultyId,QuestionType questionType,HashSet<string> usedGameCombinations)
        {
            if (questionType == null)
                throw new ArgumentNullException(nameof(questionType));

            if (usedGameCombinations == null)
                throw new ArgumentNullException(nameof(usedGameCombinations));

            string code =
                questionType.Code?.Trim().ToUpperInvariant() ?? string.Empty;

            string[] supportedCodes =
            {
                "VAULT_CIPHER_CODE",
                "VAULT_SECURITY_FILTER",
                "VAULT_LOCK_RANKING",
                "VAULT_NUMBER_TILE_KEY"
            };

            if (!supportedCodes.Contains(code))
            {
                throw new ArgumentException(
                    $"Unsupported subtraction escape-vault question type: {code}",
                    nameof(questionType));
            }

            int actualDifficulty = ResolveDifficulty(difficultyId);

            DifficultyRange range = GetDifficultyRange(
                SubtractionDifficultyConfig.ByGrade,
                levelId,
                actualDifficulty);

            int minStart = Math.Max(1, range.Min);
            int maxNumber = range.Max;

            if (maxNumber - minStart < 3 || maxNumber < 5)
            {
                throw new InvalidOperationException(
                    $"The number range {minStart}-{maxNumber} is too small " +
                    "to generate an Escape Vault puzzle.");
            }

            (int start, int takeAway, int result) CreateEquation(int result)
            {
                int lowestStart = Math.Max(minStart, result + 1);

                if (lowestStart > maxNumber)
                {
                    throw new InvalidOperationException(
                        $"Cannot create a subtraction equation for result {result} " +
                        $"inside range {minStart}-{maxNumber}.");
                }

                int start = _random.Next(lowestStart, maxNumber + 1);

                return (start,start - result,result);
            }

            List<int> PickDistinctResults(
                IEnumerable<int> source,
                int count)
            {
                var values = source.Distinct().ToList();

                if (values.Count < count)
                {
                    throw new InvalidOperationException(
                        $"Not enough distinct results are available for {code}.");
                }

                Shuffle(values);

                return values.Take(count).ToList();
            }


            if (code == "VAULT_CIPHER_CODE")
            {
                var symbols = new List<(string name, string icon)>
        {
            ("STAR", "⭐"),
            ("KEY", "🔑"),
            ("ROCKET", "🚀"),
            ("CROWN", "👑"),
            ("DIAMOND", "💎"),
            ("MOON", "🌙")
        };

                for (int attempt = 0; attempt < 500; attempt++)
                {
                    var results = PickDistinctResults(
                        Enumerable.Range(1, maxNumber - 1),
                        3);

                    Shuffle(symbols);

                    var selectedSymbols = symbols.Take(3).ToList();

                    var equations = results
                        .Select((result, index) =>
                        {
                            var equation = CreateEquation(result);

                            return (start: equation.start,takeAway: equation.takeAway,result: equation.result,symbolName: selectedSymbols[index].name,symbol: selectedSymbols[index].icon);
                        })
                        .ToList();

                    Shuffle(equations);

                    string combinationKey =
                        $"{code}:" +
                        string.Join(
                            "|",
                            equations.Select(x =>
                                $"{x.start}-{x.takeAway}:{x.symbolName}"));

                    if (!usedGameCombinations.Add(combinationKey))
                        continue;

                    string answer = string.Join(
                        "-",
                        equations.Select(x => x.symbolName));

                    string questionText =
                        "The vault needs a three-symbol code. Solve each subtraction " +
                        "equation, then use the number-to-symbol key to reveal the code.";

                    object data = new
                    {
                        renderKey = "SUBTRACTION_ESCAPE_VAULT",
                        questionType = code,
                        puzzleTitle = "Secret Cipher Lock",

                        instructions =
                            "Solve the equations in order. Match each answer to " +
                            "the symbol key, then enter the symbols in the same order.",

                        symbolKey = equations
                            .OrderBy(x => x.result)
                            .Select(x => new
                            {
                                value = x.result,
                                symbolName = x.symbolName,
                                symbol = x.symbol
                            })
                            .ToArray(),

                        equations = equations
                            .Select((x, index) => new
                            {
                                id = $"EQUATION_{index + 1}",
                                equation =
                                    $"{x.start} - {x.takeAway} = ?"
                            })
                            .ToArray(),

                        answerMode = "symbol-sequence",
                        symbolCount = 3
                    };

                    return CreateQuestion(questionNumber,questionTypeId,questionText,data,answer);
                }

                throw new InvalidOperationException(
                    "Could not generate an unused Secret Cipher Lock puzzle.");
            }

            if (code == "VAULT_SECURITY_FILTER")
            {
                int threshold = Math.Min(10,Math.Max(3, maxNumber / 2));

                var matchingResults = Enumerable
                    .Range(1, maxNumber - 1)
                    .Where(x => x % 2 == 1 && x > threshold)
                    .ToList();

                var nonMatchingResults = Enumerable
                    .Range(1, maxNumber - 1)
                    .Where(x => !(x % 2 == 1 && x > threshold))
                    .ToList();

                if (matchingResults.Count < 2 ||
                    nonMatchingResults.Count < 2)
                {
                    throw new InvalidOperationException(
                        $"The range {minStart}-{maxNumber} does not provide enough " +
                        "matching and non-matching results for the Security Scanner.");
                }

                for (int attempt = 0; attempt < 500; attempt++)
                {
                    var selectedResults = PickDistinctResults(
                            matchingResults, 2)
                        .Concat(
                            PickDistinctResults(nonMatchingResults, 2))
                        .ToList();

                    var cards =
                        new List<(string id, int start, int takeAway, int result)>();

                    foreach (int result in selectedResults)
                    {
                        var equation = CreateEquation(result);

                        cards.Add((
                            string.Empty,
                            equation.start,
                            equation.takeAway,
                            equation.result));
                    }

                    Shuffle(cards);

                    for (int i = 0; i < cards.Count; i++)
                    {
                        cards[i] = ($"CARD_{(char)('A' + i)}",cards[i].start,cards[i].takeAway,cards[i].result);
                    }

                    string combinationKey =
                        $"{code}:{threshold}:" +
                        string.Join(
                            "|",
                            cards.Select(x =>
                                $"{x.start}-{x.takeAway}"));

                    if (!usedGameCombinations.Add(combinationKey))
                        continue;

                    string answer = string.Join(
                        ",",
                        cards
                            .Where(x =>
                                x.result % 2 == 1 &&
                                x.result > threshold)
                            .Select(x => x.id)
                            .OrderBy(x => x, StringComparer.Ordinal));

                    string conditionText =
                        $"odd and greater than {threshold}";

                    string questionText =
                        $"The security scanner accepts answers that are {conditionText}. " +
                        "Select every subtraction card that passes the scanner.";

                    object data = new
                    {
                        renderKey = "SUBTRACTION_ESCAPE_VAULT",
                        questionType = code,
                        puzzleTitle = "Security Scanner",

                        instructions =
                            "Select all cards that satisfy the scanner rule.",

                        targetRule = new
                        {
                            parity = "odd",
                            greaterThan = threshold,
                            description = conditionText
                        },

                        cards = cards
                            .Select(x => new
                            {
                                id = x.id,
                                equation = $"{x.start} - {x.takeAway}"
                            })
                            .ToArray(),

                        answerMode = "multi-select",
                        minimumCorrectSelections = 2,
                        maximumCorrectSelections = 2
                    };

                    return CreateQuestion(
                        questionNumber,
                        questionTypeId,
                        questionText,
                        data,
                        answer);
                }

                throw new InvalidOperationException(
                    "Could not generate an unused Security Scanner puzzle.");
            }


            if (code == "VAULT_LOCK_RANKING")
            {
                for (int attempt = 0; attempt < 500; attempt++)
                {
                    var results = PickDistinctResults(
                        Enumerable.Range(1, maxNumber - 1),
                        4);

                    var cards =
                        new List<(string id, int start, int takeAway, int result)>();

                    foreach (int result in results)
                    {
                        var equation = CreateEquation(result);

                        cards.Add((
                            string.Empty,
                            equation.start,
                            equation.takeAway,
                            equation.result));
                    }

                    Shuffle(cards);

                    for (int i = 0; i < cards.Count; i++)
                    {
                        cards[i] = ($"LOCK_{(char)('A' + i)}",cards[i].start,cards[i].takeAway,cards[i].result);
                    }

                    string combinationKey = $"{code}:" + string.Join("|",cards.Select(x =>$"{x.start}-{x.takeAway}"));

                    if (!usedGameCombinations.Add(combinationKey))
                        continue;

                    string answer = string.Join(
                        ",",
                        cards
                            .OrderBy(x => x.result)
                            .Select(x => x.id));

                    string questionText =
                        "Calculate the four lock cards. Arrange them from the smallest " +
                        "subtraction answer to the largest to discover the unlock order.";

                    object data = new
                    {
                        renderKey = "SUBTRACTION_ESCAPE_VAULT",
                        questionType = code,
                        puzzleTitle = "Combination Lock Ranking",

                        instructions =
                            "Put the cards in ascending order: smallest difference " +
                            "first and largest difference last.",

                        cards = cards
                            .Select(x => new
                            {
                                id = x.id,
                                equation = $"{x.start} - {x.takeAway}"
                            })
                            .ToArray(),

                        order = "ascending",
                        answerMode = "order-cards",
                        cardCount = 4
                    };

                    return CreateQuestion(
                        questionNumber,
                        questionTypeId,
                        questionText,
                        data,
                        answer);
                }

                throw new InvalidOperationException(
                    "Could not generate an unused Combination Lock Ranking puzzle.");
            }


            if (code == "VAULT_NUMBER_TILE_KEY")
            {
                var numberPool = Enumerable
                    .Range(minStart, maxNumber - minStart + 1)
                    .ToList();

                for (int attempt = 0; attempt < 1000; attempt++)
                {
                    Shuffle(numberPool);

                    var tileNumbers = numberPool.Take(4).ToList();

                    if (tileNumbers.Distinct().Count() != 4)
                        continue;

                    var positivePairs = (
                        from start in tileNumbers
                        from takeAway in tileNumbers
                        where start > takeAway
                        select (
                            start,
                            takeAway,
                            difference: start - takeAway))
                        .ToList();

                    var uniqueDifferencePairs = positivePairs
                        .Where(pair =>
                            positivePairs.Count(
                                other => other.difference == pair.difference) == 1)
                        .ToList();

                    if (uniqueDifferencePairs.Count == 0)
                        continue;

                    var chosenPair = uniqueDifferencePairs[
                        _random.Next(uniqueDifferencePairs.Count)];

                    var tiles = tileNumbers
                        .Select((number, index) =>
                            (id: $"TILE_{(char)('A' + index)}", number))
                        .ToList();

                    var startTile = tiles.Single(
                        x => x.number == chosenPair.start);

                    var takeAwayTile = tiles.Single(
                        x => x.number == chosenPair.takeAway);

                    int targetDifference = chosenPair.difference;

                    string combinationKey =
                        $"{code}:{targetDifference}:" +
                        string.Join("|", tiles.Select(x => x.number));

                    if (!usedGameCombinations.Add(combinationKey))
                        continue;

                    string questionText =
                        $"The vault key must show a subtraction answer of {targetDifference}. " +
                        "Choose two number tiles and place them in order to build the key.";

                    object data = new
                    {
                        renderKey = "SUBTRACTION_ESCAPE_VAULT",
                        questionType = code,
                        puzzleTitle = "Build the Missing Key",

                        instructions =
                            $"Choose a starting number and a number to subtract " +
                            $"so the answer is {targetDifference}.",

                        targetDifference,

                        numberTiles = tiles
                            .Select(x => new
                            {
                                id = x.id,
                                number = x.number
                            })
                            .ToArray(),

                        @operator = "-",
                        answerMode = "ordered-two-tiles",
                        tileCount = 4
                    };

                    string answer =
                        $"{startTile.id},{takeAwayTile.id}";

                    return CreateQuestion(questionNumber,questionTypeId,questionText,data,answer);
                }

                throw new InvalidOperationException(
                    "Could not generate an unused Build the Missing Key puzzle.");
            }

            throw new ArgumentException(
                $"Unsupported subtraction escape-vault question type: {code}",
                nameof(questionType));
        }
        private GeneratedQuestion GenerateSubtractionNumberStrategyLab(int questionNumber,int questionTypeId,int levelId,int difficultyId,QuestionType questionType,HashSet<string> usedGameCombinations)
        {
            if (questionType == null)
                throw new ArgumentNullException(nameof(questionType));

            if (usedGameCombinations == null)
                throw new ArgumentNullException(nameof(usedGameCombinations));

            string code =
                questionType.Code?.Trim().ToUpperInvariant() ?? string.Empty;

            string[] supportedCodes =
            {
        "NUMERIC_COMPENSATION_BRIDGE",
        "NUMERIC_EQUATION_BALANCER",
        "NUMERIC_TARGET_DIFFERENCE_BUILDER",
        "NUMERIC_DIFFERENCE_PATTERN_CHECK"
    };

            if (!supportedCodes.Contains(code))
            {
                throw new ArgumentException(
                    $"Unsupported subtraction strategy question type: {code}");
            }

            int actualDifficulty = ResolveDifficulty(difficultyId);

            DifficultyRange range = GetDifficultyRange(
                SubtractionDifficultyConfig.ByGrade,
                levelId,
                actualDifficulty);

            int min = range.Min;
            int max = range.Max;

            if (min < 1 || min >= max)
            {
                throw new InvalidOperationException(
                    $"Invalid subtraction range {min}-{max} for level {levelId}.");
            }

            string keyPrefix =
                $"SUBTRACTION_NUMBER_STRATEGY_LAB:{code}:" +
                $"L{levelId}:D{actualDifficulty}";


            if (code == "NUMERIC_COMPENSATION_BRIDGE")
            {
                var candidates =
                    new List<(int start, int takeAway, int rounded, int compensation)>();

                for (int start = min; start <= max; start++)
                {
                    for (int takeAway = min; takeAway < start; takeAway++)
                    {
                        int rounded = ((takeAway + 9) / 10) * 10;

                        int compensation = rounded - takeAway;

                        if (compensation <= 0)
                            continue;

                        if (rounded > start || rounded > max)
                            continue;

                        candidates.Add((
                            start,
                            takeAway,
                            rounded,
                            compensation));
                    }
                }

                var selected = GetUnusedCandidate(
                    candidates,
                    keyPrefix,
                    x => $"{x.start}:{x.takeAway}",
                    usedGameCombinations);

                string questionText =
                    $"Complete the equivalent subtraction: " +
                    $"{selected.start} - {selected.takeAway} = " +
                    $"{selected.start} - {selected.rounded} + □";

                object data = new
                {
                    renderKey = "SUBTRACTION_NUMBER_STRATEGY_LAB",
                    questionType = code,
                    puzzleTitle = "Compensation Bridge",

                    originalStart = selected.start,
                    originalTakeAway = selected.takeAway,
                    roundedTakeAway = selected.rounded,

                    equation =
                        $"{selected.start} - {selected.takeAway} = " +
                        $"{selected.start} - {selected.rounded} + □",

                    answerMode = "input",
                    answerType = "number"
                };

                return CreateQuestion(
                    questionNumber,
                    questionTypeId,
                    questionText,
                    data,
                    selected.compensation.ToString());
            }


            if (code == "NUMERIC_EQUATION_BALANCER")
            {
                var candidates =
                    new List<(
                        int leftStart,
                        int leftTakeAway,
                        int rightTakeAway,
                        int rightStart,
                        int difference)>();

                for (int leftStart = min; leftStart <= max; leftStart++)
                {
                    for (int leftTakeAway = min;
                         leftTakeAway < leftStart;
                         leftTakeAway++)
                    {
                        int difference = leftStart - leftTakeAway;
                        for (int rightTakeAway = min;
                             rightTakeAway + difference <= max;
                             rightTakeAway++)
                        {
                            int rightStart = difference + rightTakeAway;

                            if (rightStart < min || rightStart > max)
                                continue;

                            // Avoid presenting exactly the same equation twice.
                            if (rightStart == leftStart &&
                                rightTakeAway == leftTakeAway)
                            {
                                continue;
                            }

                            candidates.Add((
                                leftStart,
                                leftTakeAway,
                                rightTakeAway,
                                rightStart,
                                difference));
                        }
                    }
                }

                var selected = GetUnusedCandidate(
                    candidates,
                    keyPrefix,
                    x =>
                        $"{x.leftStart}:{x.leftTakeAway}:{x.rightTakeAway}",
                    usedGameCombinations);

                string questionText =
                    $"Make both sides equal: " +
                    $"{selected.leftStart} - {selected.leftTakeAway} = " +
                    $"□ - {selected.rightTakeAway}";

                object data = new
                {
                    renderKey = "SUBTRACTION_NUMBER_STRATEGY_LAB",
                    questionType = code,
                    puzzleTitle = "Balance Both Equations",

                    leftStart = selected.leftStart,
                    leftTakeAway = selected.leftTakeAway,
                    rightTakeAway = selected.rightTakeAway,

                    equation =
                        $"{selected.leftStart} - {selected.leftTakeAway} = " +
                        $"□ - {selected.rightTakeAway}",

                    answerMode = "input",
                    answerType = "number"
                };

                return CreateQuestion(
                    questionNumber,
                    questionTypeId,
                    questionText,
                    data,
                    selected.rightStart.ToString());
            }


            if (code == "NUMERIC_TARGET_DIFFERENCE_BUILDER")
            {
                int targetMaximum = Math.Max(1, (max - min) / 5);

                int targetDifference = 0;
                List<int> numberTiles = new();

                int CountTargetPairs(List<int> numbers, int target)
                {
                    int count = 0;

                    for (int i = 0; i < numbers.Count; i++)
                    {
                        for (int j = i + 1; j < numbers.Count; j++)
                        {
                            if (Math.Abs(numbers[i] - numbers[j]) == target)
                                count++;
                        }
                    }

                    return count;
                }

                for (int attempt = 0; attempt < 1000; attempt++)
                {
                    int target = _random.Next(1, targetMaximum + 1);

                    int largestPossibleSmallerNumber = max - target;

                    if (largestPossibleSmallerNumber < min)
                        continue;

                    int firstLow = _random.Next(
                        min,
                        largestPossibleSmallerNumber + 1);

                    int secondLow = _random.Next(
                        min,
                        largestPossibleSmallerNumber + 1);

                    var baseValues = new List<int>
            {
                firstLow,
                firstLow + target,
                secondLow,
                secondLow + target
            };
                    if (baseValues.Distinct().Count() != 4)
                        continue;

                    if (CountTargetPairs(baseValues, target) != 2)
                        continue;

                    var extraCandidates = new List<int>();

                    for (int extra = min; extra <= max; extra++)
                    {
                        if (baseValues.Contains(extra))
                            continue;

                        var proposed = baseValues
                            .Append(extra)
                            .ToList();

                        if (CountTargetPairs(proposed, target) == 2)
                            extraCandidates.Add(extra);
                    }

                    if (extraCandidates.Count == 0)
                        continue;

                    int extraNumber = extraCandidates[
                        _random.Next(extraCandidates.Count)];

                    targetDifference = target;

                    numberTiles = baseValues
                        .Append(extraNumber)
                        .ToList();

                    break;
                }

                if (numberTiles.Count != 5)
                {
                    throw new InvalidOperationException(
                        "Could not create a number bank with exactly two " +
                        "subtraction pairs matching the target difference.");
                }
                var tiles = numberTiles
                    .Select((value, index) => new
                    {
                        id = $"NUMBER_{(char)('A' + index)}",
                        value
                    })
                    .ToList();

                Shuffle(tiles);

                var correctEquations = tiles
                    .SelectMany(minuend =>
                        tiles
                            .Where(subtrahend =>
                                minuend.value > subtrahend.value &&
                                minuend.value - subtrahend.value ==
                                    targetDifference)
                            .Select(subtrahend => new
                            {
                                minuendTileId = minuend.id,
                                subtrahendTileId = subtrahend.id
                            }))
                    .ToList();

                string combinationKey =
                    $"{keyPrefix}:{targetDifference}:" +
                    string.Join(
                        ",",
                        numberTiles.OrderBy(x => x));

                if (!usedGameCombinations.Add(combinationKey))
                {
                    throw new InvalidOperationException(
                        "This target-difference number bank has already been used. " +
                        "Generate another worksheet combination.");
                }

                string questionText =
                    $"Use the five number tiles to build exactly two different " +
                    $"subtraction equations with a difference of {targetDifference}.";

                object data = new
                {
                    renderKey = "SUBTRACTION_NUMBER_STRATEGY_LAB",
                    questionType = code,
                    puzzleTitle = "Build the Target Difference",

                    targetDifference,

                    numberTiles = tiles
                        .Select(x => new
                        {
                            id = x.id,
                            value = x.value
                        })
                        .ToArray(),

                    requiredEquationCount = 2,
                    answerMode = "build-two-equations"
                };

                return CreateQuestion(
                    questionNumber,
                    questionTypeId,
                    questionText,
                    data,
                    System.Text.Json.JsonSerializer.Serialize(correctEquations));
            }


            if (code == "NUMERIC_DIFFERENCE_PATTERN_CHECK")
            {
                int maximumStep = Math.Min(5, (max - min) / 4);

                if (maximumStep < 1)
                {
                    throw new InvalidOperationException(
                        "The configured number range is too small for a sequence puzzle.");
                }

                for (int attempt = 0; attempt < 500; attempt++)
                {
                    int step = _random.Next(1, maximumStep + 1);

                    int minimumStart = min + 4 * step;

                    if (minimumStart > max)
                        continue;

                    int start = _random.Next(minimumStart, max + 1);

                    var correctSequence = Enumerable
                        .Range(0, 5)
                        .Select(i => start - i * step)
                        .ToList();

                    // Corrupt a middle position so the remaining terms
                    // reveal the intended arithmetic pattern.
                    int wrongIndex = _random.Next(1, 4);

                    var possibleWrongValues = Enumerable
                        .Range(min, max - min + 1)
                        .Where(value => !correctSequence.Contains(value))
                        .ToList();

                    if (possibleWrongValues.Count == 0)
                        continue;

                    int incorrectValue = possibleWrongValues[
                        _random.Next(possibleWrongValues.Count)];

                    var displayedSequence = correctSequence.ToList();
                    displayedSequence[wrongIndex] = incorrectValue;

                    string combinationKey =
                        $"{keyPrefix}:" +
                        string.Join(",", displayedSequence);

                    if (!usedGameCombinations.Add(combinationKey))
                        continue;

                    var sequenceData = displayedSequence
                        .Select((value, index) => new
                        {
                            id = $"POSITION_{index + 1}",
                            position = index + 1,
                            value
                        })
                        .ToArray();

                    string questionText =
                        "One number breaks the subtraction pattern. " +
                        "Find the incorrect number and enter the number that " +
                        "should replace it.";

                    object data = new
                    {
                        renderKey = "SUBTRACTION_NUMBER_STRATEGY_LAB",
                        questionType = code,
                        puzzleTitle = "Find the Broken Number Pattern",

                        instructions =
                            "Find the constant amount being subtracted. " +
                            "Identify the incorrect number and correct it.",

                        sequence = sequenceData,
                        answerMode = "identify-and-correct-number"
                    };

                    object answer = new
                    {
                        position = wrongIndex + 1,
                        correctedValue = correctSequence[wrongIndex]
                    };

                    return CreateQuestion(
                        questionNumber,
                        questionTypeId,
                        questionText,
                        data,
                        System.Text.Json.JsonSerializer.Serialize(answer));
                }

                throw new InvalidOperationException(
                    "Could not generate a unique Number Pattern puzzle.");
            }

            throw new ArgumentException(
                $"Unsupported subtraction strategy question type: {code}");
        }
        private GeneratedQuestion GenerateSubtractionNumberPropertiesLab(int questionNumber,int questionTypeId,int levelId,int difficultyId,QuestionType questionType,HashSet<string> usedGameCombinations)
        {
            if (questionType == null)
                throw new ArgumentNullException(nameof(questionType));

            if (usedGameCombinations == null)
                throw new ArgumentNullException(nameof(usedGameCombinations));

            string code =
                questionType.Code?.Trim().ToUpperInvariant() ?? string.Empty;

            int actualDifficulty = ResolveDifficulty(difficultyId);

            DifficultyRange range = GetDifficultyRange(SubtractionNumberPropertiesDifficultyConfig.ByGrade,levelId,actualDifficulty);

            int min = range.Min;
            int max = range.Max;

            if (min < 1 || max <= min)
            {
                throw new InvalidOperationException(
                    $"Invalid number-properties range {min}-{max}.");
            }

            string keyPrefix =
                $"SUBTRACTION_NUMBER_PROPERTIES:{code}:L{levelId}:D{actualDifficulty}";

            bool NeedsBorrowing(int minuend, int subtrahend)
            {
                int borrow = 0;
                bool needed = false;

                while (minuend > 0 || subtrahend > 0)
                {
                    int firstDigit = minuend % 10 - borrow;
                    int secondDigit = subtrahend % 10;

                    if (firstDigit < secondDigit)
                    {
                        needed = true;
                        borrow = 1;
                    }
                    else
                    {
                        borrow = 0;
                    }

                    minuend /= 10;
                    subtrahend /= 10;
                }

                return needed;
            }

            if (code == "NUMERIC_REVERSE_DIGIT_DIFFERENCE")
            {
                var candidates = new List<(
                    int original,
                    int reversed,
                    int difference)>();

                int firstNumber = Math.Max(10, min);
                int lastNumber = Math.Min(99999, max);

                for (int number = firstNumber; number <= lastNumber; number++)
                {
                    int reversed = int.Parse(
                        new string(number.ToString().Reverse().ToArray()));

                    if (reversed < min || reversed > max)
                        continue;

                    if (number <= reversed)
                        continue;

                    candidates.Add((number,reversed,number - reversed));
                }

                var selected = GetUnusedCandidate(
                    candidates,
                    keyPrefix,
                    x => $"{x.original}:{x.reversed}",
                    usedGameCombinations);

                string questionText =
                    $"Reverse the digits of {selected.original}. " +
                    $"Subtract the smaller number from the larger: " +
                    $"{selected.original} - {selected.reversed} = ?";

                object data = new
                {
                    renderKey = "SubtractionNumberProperties",
                    questionType = code,
                    puzzleTitle = "Reverse-Digit Challenge",
                    originalNumber = selected.original,
                    reversedNumber = selected.reversed,
                    equation =
                        $"{selected.original} - {selected.reversed} = ?",
                    answerMode = "input",
                    answerType = "number"
                };

                return CreateQuestion(questionNumber,questionTypeId,questionText,data,selected.difference.ToString());
            }


            if (code == "NUMERIC_BORROWING_PREDICTOR")
            {
                var candidates = new List<(int minuend,int subtrahend,bool needsBorrow)>();

                var sampledEquations = new HashSet<string>();

                for (int attempt = 0;
                     attempt < 6000 && candidates.Count < 1000;
                     attempt++)
                {
                    int minuend = _random.Next(min + 1, max + 1);
                    int subtrahend = _random.Next(min, minuend);

                    string equationKey = $"{minuend}:{subtrahend}";

                    if (!sampledEquations.Add(equationKey))
                        continue;

                    candidates.Add((minuend,subtrahend,NeedsBorrowing(minuend, subtrahend)));
                }

                var selected = GetUnusedCandidate(
                    candidates,
                    keyPrefix,
                    x => $"{x.minuend}:{x.subtrahend}",
                    usedGameCombinations);

                string answer = selected.needsBorrow ? "Yes" : "No";

                string questionText =
                    $"Does {selected.minuend} - {selected.subtrahend} " +
                    "require borrowing? Do not calculate the final answer.";

                object data = new
                {
                    renderKey = "SubtractionNumberProperties",
                    questionType = code,
                    puzzleTitle = "Borrowing Radar",
                    minuend = selected.minuend,
                    subtrahend = selected.subtrahend,
                    equation =
                        $"{selected.minuend} - {selected.subtrahend}",
                    options = new[] { "Yes", "No" },
                    answerMode = "single-choice"
                };

                return CreateQuestion(questionNumber,questionTypeId,questionText,data,answer);
            }
            

            if (code == "NUMERIC_DIGIT_CLUE_RECONSTRUCTION")
            {
                int twoDigitMin = Math.Max(10, min);
                int twoDigitMax = Math.Min(99, max);

                if (twoDigitMin > twoDigitMax)
                {
                    throw new InvalidOperationException(
                        "Digit reconstruction requires a range containing " +
                        "two-digit numbers.");
                }

                var rawCandidates = new List<(
                    int startTens,
                    int takeAwayTens,
                    int startOnes,
                    int takeAwayOnes,
                    int difference,
                    int digitSum)>();

                for (int startTens = 1; startTens <= 9; startTens++)
                {
                    for (int takeAwayTens = 1;
                         takeAwayTens <= 9;
                         takeAwayTens++)
                    {
                        for (int startOnes = 0; startOnes <= 9; startOnes++)
                        {
                            for (int takeAwayOnes = 0;
                                 takeAwayOnes <= 9;
                                 takeAwayOnes++)
                            {
                                int start = startTens * 10 + startOnes;
                                int takeAway = takeAwayTens * 10 + takeAwayOnes;

                                if (start < twoDigitMin ||
                                    start > twoDigitMax ||
                                    takeAway < twoDigitMin ||
                                    takeAway > twoDigitMax ||
                                    start <= takeAway)
                                {
                                    continue;
                                }

                                rawCandidates.Add((
                                    startTens,
                                    takeAwayTens,
                                    startOnes,
                                    takeAwayOnes,
                                    start - takeAway,
                                    startOnes + takeAwayOnes));
                            }
                        }
                    }
                }

                var candidates = rawCandidates
                    .GroupBy(x =>
                        $"{x.startTens}:{x.takeAwayTens}:" +
                        $"{x.difference}:{x.digitSum}")
                    .Where(group => group.Count() == 1)
                    .Select(group => group.Single())
                    .ToList();

                var selected = GetUnusedCandidate(
                    candidates,
                    keyPrefix,
                    x =>
                        $"{x.startTens}:{x.takeAwayTens}:" +
                        $"{x.difference}:{x.digitSum}",
                    usedGameCombinations);

                string questionText =
                    $"Find the missing digits: " +
                    $"{selected.startTens}□ - {selected.takeAwayTens}□ = " +
                    $"{selected.difference}. " +
                    $"The two missing digits add up to {selected.digitSum}.";

                object data = new
                {
                    renderKey = "SUBTRACTION_NUMBER_PROPERTIES_LAB",
                    questionType = code,
                    puzzleTitle = "Digit-Clue Reconstruction",
                    equation =
                        $"{selected.startTens}□ - " +
                        $"{selected.takeAwayTens}□ = {selected.difference}",
                    missingDigitsSum = selected.digitSum,
                    answerMode = "two-digit-input"
                };

                object answer = new
                {
                    firstMissingDigit = selected.startOnes,
                    secondMissingDigit = selected.takeAwayOnes
                };

                return CreateQuestion(
                    questionNumber,
                    questionTypeId,
                    questionText,
                    data,
                    JsonSerializer.Serialize(answer));
            }
            if (code == "NUMERIC_MAXIMUM_DIFFERENCE")
            {
                var arrangementsByDigitSet = new Dictionary<
                    string,
                    List<(int minuend, int subtrahend, int difference)>>();

                for (int d1 = 0; d1 <= 9; d1++)
                    for (int d2 = 0; d2 <= 9; d2++)
                        for (int d3 = 0; d3 <= 9; d3++)
                            for (int d4 = 0; d4 <= 9; d4++)
                            {
                                if (d1 == d2 || d1 == d3 || d1 == d4 ||
                                    d2 == d3 || d2 == d4 || d3 == d4)
                                {
                                    continue;
                                }

                                if (d1 == 0 || d3 == 0)
                                    continue;

                                int minuend = d1 * 10 + d2;
                                int subtrahend = d3 * 10 + d4;

                                if (minuend < min || minuend > max ||
                                    subtrahend < min || subtrahend > max ||
                                    minuend <= subtrahend)
                                {
                                    continue;
                                }

                                string digitsKey = string.Join(
                                    "",
                                    new[] { d1, d2, d3, d4 }.OrderBy(x => x));

                                if (!arrangementsByDigitSet.TryGetValue(
                                        digitsKey, out var arrangements))
                                {
                                    arrangements = new List<(
                                        int minuend,
                                        int subtrahend,
                                        int difference)>();

                                    arrangementsByDigitSet[digitsKey] = arrangements;
                                }

                                arrangements.Add((minuend,subtrahend,minuend - subtrahend));
                            }

                var candidates = new List<(string digits,int minuend,int subtrahend,int difference)>();

                foreach (var entry in arrangementsByDigitSet)
                {
                    int maximumDifference = entry.Value.Max(x => x.difference);

                    var winners = entry.Value
                        .Where(x => x.difference == maximumDifference)
                        .ToList();

                    if (winners.Count != 1)
                        continue;

                    candidates.Add((entry.Key,winners[0].minuend,winners[0].subtrahend,winners[0].difference));
                }

                var selected = GetUnusedCandidate(candidates,keyPrefix,x => x.digits,usedGameCombinations);

                int[] digitTiles = selected.digits
                    .Select(ch => ch - '0')
                    .ToArray();

                string questionText =
                    "Use each of the four digit tiles exactly once to create " +
                    "two two-digit numbers. Make the largest possible positive " +
                    "subtraction difference.";

                object data = new
                {
                    renderKey = "SubtractionNumberProperties",
                    questionType = code,
                    puzzleTitle = "Maximum Difference Builder",
                    digitTiles,
                    instructions =
                        "Arrange the four digits into a two-digit minuend " +
                        "and a two-digit subtrahend. Use every digit exactly once.",
                    answerMode = "build-two-numbers"
                };

                object answer = new
                {
                    minuend = selected.minuend,
                    subtrahend = selected.subtrahend,
                    difference = selected.difference
                };

                return CreateQuestion(questionNumber,questionTypeId,questionText,data,JsonSerializer.Serialize(answer));
            }

            throw new ArgumentException(
                $"Unsupported number-properties question type: {code}");
        }
        private GeneratedQuestion GenerateSubtractionConstraintEngineering(int questionNumber,int questionTypeId,int levelId,int difficultyId,QuestionType questionType,HashSet<string> usedGameCombinations)
        {
            if (questionType == null)
                throw new ArgumentNullException(nameof(questionType));

            if (usedGameCombinations == null)
                throw new ArgumentNullException(nameof(usedGameCombinations));

            string code = questionType.Code?.Trim().ToUpperInvariant() ?? string.Empty;

            string[] supportedCodes =
            {
               "CONSTRAINT_DIFFERENCE_WINDOW",
               "CONSTRAINT_OPERAND_CHANGE_IMPACT",
               "CONSTRAINT_MINIMUM_ADJUSTMENT",
               "CONSTRAINT_COUNT_VALID_PAIRS"
            };

            if (!supportedCodes.Contains(code))
            {
                throw new ArgumentException(
                    $"Unsupported Constraint Engineering question type: {code}");
            }

            int actualDifficulty = ResolveDifficulty(difficultyId);

            DifficultyRange range = GetDifficultyRange(SubtractionConstraintEngineeringDifficultyConfig.ByGrade,levelId,actualDifficulty);

            int min = range.Min;
            int max = range.Max;
            int span = max - min;

            if (min < 1 || span < 10)
            {
                throw new InvalidOperationException(
                    $"Invalid Constraint Engineering range {min}-{max}.");
            }

            string keyPrefix =
                $"SUBTRACTION_CONSTRAINT_ENGINEERING:{code}:" +
                $"L{levelId}:D{actualDifficulty}";
            bool TryRegisterCombination(string signature)
            {
                return usedGameCombinations.Add(
                    $"{keyPrefix}:{signature}");
            }

            (int minuend, int subtrahend, int difference)
                CreateEquationForDifference(
                    int difference,
                    HashSet<string> locallyUsedEquations)
            {
                if (difference < 1 || difference > span)
                {
                    throw new ArgumentOutOfRangeException(
                        nameof(difference),
                        "Difference must fit inside the configured number range.");
                }

                int smallestMinuend = min + difference;

                for (int attempt = 0; attempt < 500; attempt++)
                {
                    int minuend = _random.Next(
                        smallestMinuend,
                        max + 1);

                    int subtrahend = minuend - difference;
                    string signature = $"{minuend}:{subtrahend}";

                    if (!locallyUsedEquations.Add(signature))
                        continue;

                    return (minuend, subtrahend, difference);
                }

                throw new InvalidOperationException(
                    $"Could not generate an unused equation for difference {difference}.");
            }


            if (code == "CONSTRAINT_DIFFERENCE_WINDOW")
            {
                int resultWindowWidth = Math.Max(2, span / 20);

                int maximumWindowStart = Math.Min(
                    max - resultWindowWidth,
                    min + Math.Max(2, span / 6));

                int smallestPossibleMinuend =
                    min + (span * 3 / 4);

                for (int attempt = 0; attempt < 1000; attempt++)
                {
                    int minuend = _random.Next(smallestPossibleMinuend,max + 1);

                    int resultMinimum = _random.Next(min,maximumWindowStart + 1);

                    int resultMaximum = resultMinimum + resultWindowWidth;

                    int smallestSubtrahend = minuend - resultMaximum;

                    int largestSubtrahend =  minuend - resultMinimum;

                    if (smallestSubtrahend < min ||
                        largestSubtrahend > max ||
                        smallestSubtrahend > largestSubtrahend)
                    {
                        continue;
                    }

                    string signature =
                        $"{minuend}:{resultMinimum}:{resultMaximum}";

                    if (!TryRegisterCombination(signature))
                        continue;

                    string questionText =
                        $"The difference must be between {resultMinimum} " +
                        $"and {resultMaximum}, inclusive. For {minuend} - x, " +
                        "find the smallest and largest possible values of x.";

                    object data = new
                    {
                        renderKey = "SubtractionConstraintEngineering",
                        questionType = code,
                        puzzleTitle = "Find the Valid Difference Window",

                        minuend,
                        minimumResult = resultMinimum,
                        maximumResult = resultMaximum,

                        equation = $"{minuend} - x",
                        constraint =
                            $"{resultMinimum} <= {minuend} - x <= {resultMaximum}",

                        answerMode = "two-number-input",
                        answerFields = new[]
                        {
                    "smallestSubtrahend",
                    "largestSubtrahend"
                }
                    };

                    object answer = new
                    {
                        smallestSubtrahend,
                        largestSubtrahend
                    };

                    return CreateQuestion(questionNumber,questionTypeId,questionText,data,JsonSerializer.Serialize(answer));
                }

                throw new InvalidOperationException(
                    "Could not generate a unique Difference Window puzzle.");
            }
            

            if (code == "CONSTRAINT_OPERAND_CHANGE_IMPACT")
            {
                for (int attempt = 0; attempt < 2000; attempt++)
                {
                    int first = _random.Next(min + 1, max);
                    int second = _random.Next(min, first);

                    int increaseFirst = _random.Next(
                        1,
                        max - first + 1);

                    int increaseSecond = _random.Next(
                        1,
                        max - second + 1);

                    int changedFirst = first + increaseFirst;
                    int changedSecond = second + increaseSecond;

                    if (changedFirst <= changedSecond)
                        continue;

                    string signature =
                        $"{first}:{second}:{increaseFirst}:{increaseSecond}";

                    if (!TryRegisterCombination(signature))
                        continue;

                    int originalDifference = first - second;
                    int newDifference = changedFirst - changedSecond;

                    string questionText =
                        $"Start with {first} - {second}. " +
                        $"Increase the first number by {increaseFirst} and " +
                        $"the second number by {increaseSecond}. " +
                        "What is the new difference?";

                    object data = new
                    {
                        renderKey = "SubtractionConstraintEngineering",
                        questionType = code,
                        puzzleTitle = "Operand Change Impact",

                        originalMinuend = first,
                        originalSubtrahend = second,
                        originalDifference,

                        increaseFirst,
                        increaseSecond,

                        newMinuend = changedFirst,
                        newSubtrahend = changedSecond,

                        equation = $"{changedFirst} - {changedSecond} = ?",

                        answerMode = "input",
                        answerType = "number"
                    };

                    return CreateQuestion(questionNumber,questionTypeId,questionText,data,newDifference.ToString());
                }

                throw new InvalidOperationException(
                    "Could not generate a unique Operand Change Impact puzzle.");
            }


            if (code == "CONSTRAINT_MINIMUM_ADJUSTMENT")
            {
                int minimumTargetDifference = Math.Max(2, min / 2);

                for (int attempt = 0; attempt < 2000; attempt++)
                {
                    int subtrahend = _random.Next(min, max - 1);

                    int maximumTargetDifference =
                        max - subtrahend;

                    if (maximumTargetDifference <
                        minimumTargetDifference)
                    {
                        continue;
                    }

                    int targetDifference = _random.Next(minimumTargetDifference,maximumTargetDifference + 1);
                    int currentDifference = _random.Next(
                        1,
                        targetDifference);

                    int minuend = subtrahend + currentDifference;

                    int adjustment =
                        targetDifference - currentDifference;

                    int adjustedMinuend =
                        minuend + adjustment;

                    if (minuend < min ||
                        minuend > max ||
                        adjustedMinuend > max ||
                        adjustment <= 0)
                    {
                        continue;
                    }

                    string signature =
                        $"{minuend}:{subtrahend}:{targetDifference}";

                    if (!TryRegisterCombination(signature))
                        continue;

                    string questionText =
                        $"The current difference is {minuend} - {subtrahend}. " +
                        $"What is the smallest positive amount to add to {minuend} " +
                        $"so the new difference becomes {targetDifference}?";

                    object data = new
                    {
                        renderKey = "SubtractionConstraintEngineering",
                        questionType = code,
                        puzzleTitle = "Minimum Adjustment",

                        originalMinuend = minuend,
                        subtrahend,
                        currentDifference,
                        targetDifference,

                        equation =
                            $"({minuend} + x) - {subtrahend} = {targetDifference}",

                        answerMode = "input",
                        answerType = "number"
                    };

                    return CreateQuestion(questionNumber,questionTypeId,questionText,data,adjustment.ToString());
                }

                throw new InvalidOperationException(
                    "Could not generate a unique Minimum Adjustment puzzle.");
            }


            if (code == "CONSTRAINT_COUNT_VALID_PAIRS")
            {
                int minimumDifference =
                    Math.Max(2, span / 5);

                int maximumDifference = Math.Min(
                    span,
                    Math.Max(minimumDifference + 2, span * 3 / 5));

                bool IsValidDifference(int difference)
                {
                    return difference % 2 == 0 &&
                           difference >= minimumDifference &&
                           difference <= maximumDifference;
                }

                int ChooseDifference(
                    bool mustBeValid,
                    HashSet<int> usedDifferences)
                {
                    for (int attempt = 0; attempt < 5000; attempt++)
                    {
                        int difference = _random.Next(1, span + 1);

                        if (IsValidDifference(difference) != mustBeValid)
                            continue;

                        if (usedDifferences.Add(difference))
                            return difference;
                    }

                    return -1;
                }

                for (int attempt = 0; attempt < 300; attempt++)
                {
                    var usedDifferences = new HashSet<int>();
                    var usedEquations = new HashSet<string>();

                    int validCount = _random.Next(1, 6);
                    int invalidCount = 6 - validCount;

                    var cards = new List<(int minuend,int subtrahend,int difference,bool isValid)>();

                    bool failed = false;

                    for (int i = 0; i < validCount; i++)
                    {
                        int difference = ChooseDifference(mustBeValid: true,usedDifferences);

                        if (difference < 0)
                        {
                            failed = true;
                            break;
                        }

                        var equation = CreateEquationForDifference(
                            difference,
                            usedEquations);

                        cards.Add((equation.minuend,equation.subtrahend,difference,true));
                    }

                    if (failed)
                        continue;

                    for (int i = 0; i < invalidCount; i++)
                    {
                        int difference = ChooseDifference(
                            mustBeValid: false,
                            usedDifferences);

                        if (difference < 0)
                        {
                            failed = true;
                            break;
                        }

                        var equation = CreateEquationForDifference(
                            difference,
                            usedEquations);

                        cards.Add((equation.minuend,equation.subtrahend,difference,false));
                    }

                    if (failed || cards.Count != 6)
                        continue;

                    Shuffle(cards);

                    string signature = string.Join(
                        "|",
                        cards.Select(x =>
                            $"{x.minuend}-{x.subtrahend}"));

                    if (!TryRegisterCombination(signature))
                        continue;

                    string questionText =
        $"Count the equations whose difference is even and " +
        $"between {minimumDifference} and {maximumDifference}, " +
        "inclusive.";

                    var cardData = cards
                        .Select((x, index) => new
                        {
                            id = $"EQUATION_{index + 1}",
                            equation = $"{x.minuend} - {x.subtrahend}",
                            isValid = x.isValid
                        })
                        .ToArray();

                    // Store the correct equation IDs, not the numeric count.
                    string[] correctCardIds = cardData
                        .Where(x => x.isValid)
                        .Select(x => x.id)
                        .ToArray();

                    object data = new
                    {
                        renderKey = "SUBTRACTION_CONSTRAINT_ENGINEERING",
                        questionType = code,
                        puzzleTitle = "Count the Valid Pairs",

                        rule = new
                        {
                            parity = "even",
                            minimumDifference,
                            maximumDifference,
                            inclusive = true
                        },

                        cards = cardData
                            .Select(x => new
                            {
                                x.id,
                                x.equation
                            })
                            .ToArray(),

                        totalEquations = cards.Count,
                        answerMode = "multi-select",
                        answerType = "equation-ids"
                    };

                    return CreateQuestion(questionNumber,questionTypeId,questionText,data,JsonSerializer.Serialize(correctCardIds));
                }

                throw new InvalidOperationException(
                    "Could not generate a unique Count Valid Pairs puzzle.");
            }

            throw new ArgumentException(
                $"Unsupported Constraint Engineering question type: {code}");
        }
        private GeneratedQuestion GenerateSubtractionAlgorithmStudio(int questionNumber,int questionTypeId,int levelId,int difficultyId,QuestionType questionType,HashSet<string> usedGameCombinations)
        {
            if (questionType == null)
                throw new ArgumentNullException(nameof(questionType));

            if (usedGameCombinations == null)
                throw new ArgumentNullException(nameof(usedGameCombinations));

            string code =
                questionType.Code?.Trim().ToUpperInvariant() ?? string.Empty;

            string[] supportedCodes =
            {
        "ALGORITHM_COLUMN_ALIGNMENT",
        "ALGORITHM_REGROUP_TRACE",
        "ALGORITHM_PARTIAL_DIFFERENCE_ASSEMBLY",
        "ALGORITHM_INVERSE_VERIFICATION"
    };

            if (!supportedCodes.Contains(code))
            {
                throw new ArgumentException(
                    $"Unsupported Algorithm Studio question type: {code}");
            }

            int actualDifficulty = ResolveDifficulty(difficultyId);

            DifficultyRange range = GetDifficultyRange(
                SubtractionAlgorithmStudioDifficultyConfig.ByGrade,
                levelId,
                actualDifficulty);

            int min = range.Min;
            int max = range.Max;

            if (min < 1 || max <= min)
            {
                throw new InvalidOperationException(
                    $"Invalid Algorithm Studio range {min}-{max}.");
            }

            string keyPrefix =
                $"SUBTRACTION_ALGORITHM_STUDIO:{code}:" +
                $"L{levelId}:D{actualDifficulty}";

            string[] placesRightToLeft =
            {
        "ones",
        "tens",
        "hundreds",
        "thousands",
        "tenThousands",
        "hundredThousands",
        "millions"
    };

            bool TryRegister(string signature)
            {
                return usedGameCombinations.Add(
                    $"{keyPrefix}:{signature}");
            }

            int DigitCount(int value) =>
                value.ToString().Length;

            int?[] PlaceDigits(
                string digits,
                int columnCount,
                int offset,
                bool reverse = false)
            {
                int[] values = digits
                    .Select(ch => ch - '0')
                    .ToArray();

                if (reverse)
                    Array.Reverse(values);

                var result = new int?[columnCount];

                for (int i = 0; i < values.Length; i++)
                    result[offset + i] = values[i];

                return result;
            }

            bool NeedsBorrowing(int minuend, int subtrahend)
            {
                int borrowFromRight = 0;
                bool foundBorrow = false;

                while (minuend > 0 || subtrahend > 0)
                {
                    int topDigit = minuend % 10 - borrowFromRight;
                    int bottomDigit = subtrahend % 10;

                    if (topDigit < bottomDigit)
                    {
                        foundBorrow = true;
                        borrowFromRight = 1;
                    }
                    else
                    {
                        borrowFromRight = 0;
                    }

                    minuend /= 10;
                    subtrahend /= 10;
                }

                return foundBorrow;
            }

            bool CanSubtractWithoutBorrowingLocal(
                int minuend,
                int subtrahend)
            {
                if (minuend <= subtrahend)
                    return false;

                int first = minuend;
                int second = subtrahend;

                while (first > 0 || second > 0)
                {
                    if (first % 10 < second % 10)
                        return false;

                    first /= 10;
                    second /= 10;
                }

                return true;
            }


            if (code == "ALGORITHM_COLUMN_ALIGNMENT")
            {
                int digitCount = DigitCount(max);

                int minuendLow = Math.Max(min,(int)Math.Pow(10, digitCount - 1));

                int minuendHigh = Math.Min(max,(int)Math.Pow(10, digitCount) - 1);

                int subtrahendLow = Math.Max(min,(int)Math.Pow(10, digitCount - 2));

                int subtrahendHigh = Math.Min(max,(int)Math.Pow(10, digitCount - 1) - 1);

                for (int attempt = 0; attempt < 2000; attempt++)
                {
                    int minuend = _random.Next(minuendLow,minuendHigh + 1);

                    int subtrahend = _random.Next(subtrahendLow,subtrahendHigh + 1);

                    string subDigits = subtrahend.ToString();

                    if (minuend <= subtrahend ||
                        subDigits == new string(subDigits.Reverse().ToArray()))
                    {
                        continue;
                    }

                    string signature = $"{minuend}:{subtrahend}";

                    if (!TryRegister(signature))
                        continue;

                    var optionSpecs =
                        new List<(int?[] SubDigits, bool IsCorrect)>
                        {
                    (
                        PlaceDigits(
                            subDigits,
                            digitCount,
                            digitCount - subDigits.Length),
                        true
                    ),

                    // Incorrect: digits are left-aligned.
                    (
                        PlaceDigits(
                            subDigits,
                            digitCount,
                            0),
                        false
                    ),
                    (
                        PlaceDigits(
                            subDigits,
                            digitCount,
                            digitCount - subDigits.Length,
                            reverse: true),
                        false
                    )
                        };

                    Shuffle(optionSpecs);

                    var visibleOptions = new List<object>();
                    string correctOptionId = string.Empty;

                    for (int i = 0; i < optionSpecs.Count; i++)
                    {
                        string optionId = $"LAYOUT_{(char)('A' + i)}";

                        visibleOptions.Add(new
                        {
                            id = optionId,
                            minuendDigits = PlaceDigits(
                                minuend.ToString(),
                                digitCount,
                                0),
                            subtrahendDigits = optionSpecs[i].SubDigits
                        });

                        if (optionSpecs[i].IsCorrect)
                            correctOptionId = optionId;
                    }

                    string questionText =
                        $"Which layout correctly aligns {minuend} - {subtrahend} " +
                        "by place value? Choose the correct arrangement before calculating.";

                    object data = new
                    {
                        renderKey = "SUBTRACTION_ALGORITHM_STUDIO",
                        questionType = code,
                        puzzleTitle = "Align the Columns",

                        minuend,
                        subtrahend,

                        columns = placesRightToLeft
                            .Take(digitCount)
                            .Reverse()
                            .ToArray(),

                        options = visibleOptions,
                        answerMode = "single-choice"
                    };

                    return CreateQuestion(questionNumber,questionTypeId,questionText,data,correctOptionId);
                }

                throw new InvalidOperationException(
                    "Could not generate a unique Column Alignment question.");
            }

            if (code == "ALGORITHM_REGROUP_TRACE")
            {
                for (int attempt = 0; attempt < 3000; attempt++)
                {
                    int minuend = _random.Next(min + 1, max + 1);
                    int subtrahend = _random.Next(min, minuend);

                    if (DigitCount(minuend) != DigitCount(subtrahend))
                        continue;

                    if (!NeedsBorrowing(minuend, subtrahend))
                        continue;

                    string signature = $"{minuend}:{subtrahend}";

                    if (!TryRegister(signature))
                        continue;

                    string first = minuend.ToString();
                    string second = subtrahend.ToString();

                    var trace = new List<(int Position,string Place,int MinuendDigit,int SubtrahendDigit,int BorrowFromRight,int BorrowFromLeft,int AdjustedMinuendDigit,int DifferenceDigit)>();
                    int borrowFromRight = 0;

                    for (int position = 0;
                         position < first.Length;
                         position++)
                    {
                        int index = first.Length - 1 - position;

                        int topDigit = first[index] - '0';
                        int bottomDigit = second[index] - '0';

                        int adjustedDigit = topDigit - borrowFromRight;

                        int borrowFromLeft =
                            adjustedDigit < bottomDigit ? 1 : 0;

                        if (borrowFromLeft == 1)
                            adjustedDigit += 10;

                        int resultDigit = adjustedDigit - bottomDigit;

                        trace.Add((position,placesRightToLeft[position],topDigit,bottomDigit,borrowFromRight,borrowFromLeft,adjustedDigit,resultDigit));

                        borrowFromRight = borrowFromLeft;
                    }

                    string questionText =
                        $"Complete the column-by-column regrouping steps for " +
                        $"{minuend} - {subtrahend}. Fill in the borrowing information " +
                        "and the result digit in every column.";

                    object data = new
                    {
                        renderKey = "SUBTRACTION_ALGORITHM_STUDIO",
                        questionType = code,
                        puzzleTitle = "Trace the Regrouping",

                        minuend,
                        subtrahend,

                        columns = trace
                            .OrderByDescending(x => x.Position)
                            .Select(x => new
                            {
                                place = x.Place,
                                minuendDigit = x.MinuendDigit,
                                subtrahendDigit = x.SubtrahendDigit,
                                inputFields = new[]
                                {
                            "borrowFromRight",
                            "borrowFromLeft",
                            "differenceDigit"
                                }
                            })
                            .ToArray(),

                        answerMode = "regroup-trace"
                    };

                    object answer = new
                    {
                        columns = trace
                            .OrderByDescending(x => x.Position)
                            .Select(x => new
                            {
                                place = x.Place,
                                borrowFromRight = x.BorrowFromRight,
                                borrowFromLeft = x.BorrowFromLeft,
                                adjustedMinuendDigit =
                                    x.AdjustedMinuendDigit,
                                differenceDigit = x.DifferenceDigit
                            })
                            .ToArray(),

                        finalDifference = minuend - subtrahend
                    };

                    return CreateQuestion(questionNumber,questionTypeId,questionText,data,JsonSerializer.Serialize(answer));
                }

                throw new InvalidOperationException(
                    "Could not generate a unique Regroup Trace question.");
            }


            if (code == "ALGORITHM_PARTIAL_DIFFERENCE_ASSEMBLY")
            {
                int digitCount = DigitCount(max);

                int lowestNumber = Math.Max(
                    min,
                    (int)Math.Pow(10, digitCount - 1));

                int highestNumber = Math.Min(
                    max,
                    (int)Math.Pow(10, digitCount) - 1);

                for (int attempt = 0; attempt < 6000; attempt++)
                {
                    int minuend = _random.Next(
                        lowestNumber,
                        highestNumber + 1);

                    if (minuend <= lowestNumber)
                        continue;

                    int subtrahend = _random.Next(
                        lowestNumber,
                        minuend);

                    if (!CanSubtractWithoutBorrowingLocal(
                            minuend,
                            subtrahend))
                    {
                        continue;
                    }

                    string signature = $"{minuend}:{subtrahend}";

                    if (!TryRegister(signature))
                        continue;

                    var parts = new List<(
                        string Place,
                        int PlaceValue,
                        int MinuendDigit,
                        int SubtrahendDigit,
                        int PartialDifference)>();

                    for (int position = digitCount - 1;
                         position >= 0;
                         position--)
                    {
                        int placeValue = (int)Math.Pow(10, position);

                        int minuendDigit =
                            minuend / placeValue % 10;

                        int subtrahendDigit =
                            subtrahend / placeValue % 10;

                        int partialDifference =
                            (minuendDigit - subtrahendDigit) * placeValue;

                        parts.Add((placesRightToLeft[position],placeValue,minuendDigit,subtrahendDigit,partialDifference));
                    }

                    int sumOfParts = parts.Sum(x => x.PartialDifference);
                    int finalDifference = minuend - subtrahend;

                    if (sumOfParts != finalDifference)
                    {
                        throw new InvalidOperationException(
                            "Partial differences do not equal the final difference.");
                    }

                    string questionText =
                        $"Calculate each place-value contribution for " +
                        $"{minuend} - {subtrahend}. Then add the partial differences " +
                        "to obtain the final result.";

                    object data = new
                    {
                        renderKey = "SUBTRACTION_ALGORITHM_STUDIO",
                        questionType = code,
                        puzzleTitle = "Assemble the Partial Differences",

                        minuend,
                        subtrahend,

                        parts = parts.Select(x => new
                        {
                            place = x.Place,
                            placeValue = x.PlaceValue,
                            minuendDigit = x.MinuendDigit,
                            subtrahendDigit = x.SubtrahendDigit,

                            equation =
                                $"({x.MinuendDigit} - {x.SubtrahendDigit}) " +
                                $"× {x.PlaceValue} = ?"
                        }).ToArray(),

                        finalEquation = $"{minuend} - {subtrahend} = ?",
                        answerMode = "partial-differences"
                    };

                    object answer = new
                    {
                        parts = parts.Select(x => new
                        {
                            place = x.Place,
                            partialDifference = x.PartialDifference
                        }).ToArray(),

                        sumOfParts,
                        finalDifference
                    };

                    return CreateQuestion(
                        questionNumber,
                        questionTypeId,
                        questionText,
                        data,
                        JsonSerializer.Serialize(answer));
                }

                throw new InvalidOperationException(
                    "Could not generate a unique Partial Difference question.");
            }

            if (code == "ALGORITHM_INVERSE_VERIFICATION")
            {
                for (int attempt = 0; attempt < 3000; attempt++)
                {
                    int minuend = _random.Next(min + 1, max + 1);
                    int subtrahend = _random.Next(min, minuend);

                    int difference = minuend - subtrahend;

                    string signature = $"{minuend}:{subtrahend}";

                    if (!TryRegister(signature))
                        continue;

                    var options = new List<(
                        string Equation,
                        bool IsCorrect)>
            {
                (
                    $"{subtrahend} + {difference} = {minuend}",
                    true
                ),

                (
                    $"{subtrahend + 1} + {difference} = {minuend}",
                    false
                ),

                (
                    $"{subtrahend} + {difference + 1} = {minuend}",
                    false
                ),

                (
                    $"{subtrahend} + {difference} = {minuend + 1}",
                    false
                )
            };

                    Shuffle(options);

                    var visibleOptions = new List<object>();
                    string correctOptionId = string.Empty;

                    for (int i = 0; i < options.Count; i++)
                    {
                        string optionId = $"VERIFY_{(char)('A' + i)}";

                        visibleOptions.Add(new
                        {
                            id = optionId,
                            equation = options[i].Equation
                        });

                        if (options[i].IsCorrect)
                            correctOptionId = optionId;
                    }

                    string questionText =
                        $"The result of {minuend} - {subtrahend} is {difference}. " +
                        "Which addition equation correctly verifies the subtraction?";

                    object data = new
                    {
                        renderKey = "SUBTRACTION_ALGORITHM_STUDIO",
                        questionType = code,
                        puzzleTitle = "Verify with Addition",

                        minuend,
                        subtrahend,
                        difference,

                        subtractionEquation =
                            $"{minuend} - {subtrahend} = {difference}",

                        options = visibleOptions,
                        answerMode = "single-choice"
                    };

                    return CreateQuestion(questionNumber,questionTypeId,questionText,data,correctOptionId);
                }

                throw new InvalidOperationException(
                    "Could not generate a unique Inverse Verification question.");
            }

            throw new ArgumentException(
                $"Unsupported Algorithm Studio question type: {code}");
        }


    }
}
