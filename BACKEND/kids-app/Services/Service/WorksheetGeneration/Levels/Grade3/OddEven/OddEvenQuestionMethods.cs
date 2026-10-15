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
    public partial class Grade3WorksheetGenerationService
    {
        private GeneratedQuestion GenerateIdentifyOddEven(int questionNumber, int questionTypeId, int levelId, int difficultyId, string? visualStyleName, HashSet<string> usedGameCombinations)
        {
            if (usedGameCombinations == null)
            {
                throw new ArgumentNullException(nameof(usedGameCombinations));
            }
            var actualDifficulty = ResolveDifficulty(difficultyId);
            var range = GetDifficultyRange(AdditionDifficultyConfig.ByGrade, levelId, actualDifficulty);
            if (range.Min > range.Max)
            {
                throw new InvalidOperationException(
                    $"Invalid range {range.Min}-{range.Max} " +
                    $"for level {levelId}, difficulty {actualDifficulty}.");
            }
            var numbers = Enumerable.Range(range.Min, range.Max - range.Min + 1);

            int number = GetUnusedCandidate(numbers, "IDENTIFY_ODD_EVEN", number => number.ToString(), usedGameCombinations);


            string answer = number % 2 == 0 ? "Even" : "Odd";

            var data = new
            {
                questionType = "identifyOddEven",
                number,
                visualStyle = visualStyleName,
                options = new[]
               {
                    "Odd",
                    "Even"
                },

                selectionMode = "single"
            };

            return CreateQuestion(questionNumber, questionTypeId, "Look at the number. Is it odd or even?", data, answer);
        }
        private GeneratedQuestion GenerateCircleOdd(int questionNumber, int questionTypeId, int levelId, int difficultyId, HashSet<int> usedNumbers)
        {
            var actualDifficulty = ResolveDifficulty(difficultyId);
            var range = GetDifficultyRange(AdditionDifficultyConfig.ByGrade, levelId, actualDifficulty);
            const int count = 4;
            var numbers = GenerateNumbersWithRequiredParity(range.Min, range.Max, requireOdd: true, count, usedNumbers);
            int correct = numbers.First(x => x % 2 != 0);
            var data = new
            {
                questionType = "circleOdd",
                numbers,
                selectionMode = "single"
            };

            return CreateQuestion(questionNumber, questionTypeId, "Circle an odd number.", data, correct.ToString());
        }
        private GeneratedQuestion GenerateCircleEven(int questionNumber, int questionTypeId, int levelId, int difficultyId, HashSet<int> usedNumbers)
        {
            var actualDifficulty = ResolveDifficulty(difficultyId);
            var range = GetDifficultyRange(AdditionDifficultyConfig.ByGrade, levelId, actualDifficulty);

            const int count = 4;

            var numbers = GenerateNumbersWithRequiredParity(range.Min, range.Max, requireOdd: false, count, usedNumbers);

            int correct = numbers.First(x => x % 2 == 0);

            var data = new
            {
                questionType = "circleEven",
                numbers,
                selectionMode = "single"
            };

            return CreateQuestion(questionNumber, questionTypeId, "Circle an even number.", data, correct.ToString());
        }
        private GeneratedQuestion GenerateTrueFalse(int questionNumber, int questionTypeId, int levelId, int difficultyId, HashSet<int> usedNumbers)
        {
            var actualDifficulty = ResolveDifficulty(difficultyId);
            var range = GetDifficultyRange(AdditionDifficultyConfig.ByGrade, levelId, actualDifficulty);
            int number = GetUniqueNumber(range.Max, usedNumbers);

            bool numberIsEven = number % 2 == 0;

            bool statementIsEven = _random.Next(2) == 0;

            string statement = statementIsEven ? $"{number} is an even number." : $"{number} is an odd number.";

            bool correct = statementIsEven ? numberIsEven : !numberIsEven;

            var data = new
            {
                questionType = "trueFalse",

                number,

                statement,

                options = new[]
                {
                    "True",
                    "False"
                },

                selectionMode = "single"
            };

            return CreateQuestion(questionNumber, questionTypeId, "Is the statement true or false?", data, correct ? "True" : "False");
        }
        private GeneratedQuestion GenerateCountObjects(int questionNumber, int questionTypeId, int levelId, int difficultyId, List<string> visualIcons)
        {
            var actualDifficulty = ResolveDifficulty(difficultyId);
            var range = GetDifficultyRange(AdditionDifficultyConfig.ByGrade, levelId, actualDifficulty);
            int count = _random.Next(range.Min, range.Max + 1);
            string answer = count % 2 == 0 ? "Even" : "Odd";
            string icon = GetDatabaseVisualIcon(visualIcons, questionNumber);
            var icons = Enumerable.Repeat(icon, count).ToList();
            var data = new
            {
                questionType = "countObjects",
                count,
                icon,
                icons,
                options = new[]
                {
                    "Odd",
                    "Even"
                },

                selectionMode = "single"
            };

            return CreateQuestion(questionNumber, questionTypeId, "Count the objects. Is the number odd or even?", data, answer);
        }
        private GeneratedQuestion GenerateMatchOddEven(int questionNumber, int questionTypeId, int levelId, int difficultyId, HashSet<int> usedNumbers)
        {
            var actualDifficulty = ResolveDifficulty(difficultyId);
            var range = GetDifficultyRange(AdditionDifficultyConfig.ByGrade, levelId, actualDifficulty);
            const int count = 3; //meaning of const int
            var allNumbers = Enumerable.Range(range.Min, range.Max - range.Min + 1).ToList();

            var availableOddNumbers = Enumerable
              .Range(range.Min, range.Max - range.Min + 1)
              .Where(number => number % 2 != 0 && !usedNumbers.Contains(number))
              .ToList();

            var availableEvenNumbers =
                Enumerable
                    .Range(range.Min, range.Max - range.Min + 1)
                    .Where(number => number % 2 == 0 && !usedNumbers.Contains(number))
                    .ToList();
            if (availableOddNumbers.Count < count)
            {
                throw new InvalidOperationException(
                    $"Not enough unused odd numbers are available " +
                    $"for range {range.Min}-{range.Max}. " +
                    $"Required: {count}, Available: {availableOddNumbers.Count}.");
            }

            if (availableEvenNumbers.Count < count)
            {
                throw new InvalidOperationException(
                    $"Not enough unused even numbers are available " +
                    $"for range {range.Min}-{range.Max}. " +
                    $"Required: {count}, Available: {availableEvenNumbers.Count}.");
            }


            Shuffle(availableOddNumbers);
            Shuffle(availableEvenNumbers);
            var oddNumbers = availableOddNumbers.Take(count).ToList();

            var evenNumbers = availableEvenNumbers.Take(count).ToList();


            var pairs = oddNumbers.Select(number => new NumberAnswerDto
            {
                Number = number,
                Answer = "Odd"
            })
                .Concat(evenNumbers.Select(number => new NumberAnswerDto
                {
                    Number = number,
                    Answer = "Even"
                }))
                .ToList();

            Shuffle(pairs);
            var answers = pairs.ToDictionary(item => item.Number.ToString(),
                                            item => item.Answer);
            var data = new
            {
                questionType = "matchOddEven",
                pairs,
                options = new[]
                {
                    "Odd",
                    "Even"
                },

                selectionMode = "single"
            };

            return CreateQuestion(questionNumber, questionTypeId, "Match each number with Odd or Even.", data, JsonSerializer.Serialize(answers));
        }
        private GeneratedQuestion GenerateSorting(int questionNumber, int questionTypeId, int levelId, int difficultyId, HashSet<int> usedNumbers)
        {
            if (usedNumbers == null)
            {
                throw new ArgumentNullException(nameof(usedNumbers));
            }

            int actualDifficulty = ResolveDifficulty(difficultyId);

            var range = GetDifficultyRange(AdditionDifficultyConfig.ByGrade, levelId, actualDifficulty);

            if (range.Min > range.Max)
            {
                throw new InvalidOperationException(
                    $"Invalid sorting range {range.Min}-{range.Max} " +
                    $"for level {levelId}, difficulty {actualDifficulty}.");
            }

            int numberCount =
                actualDifficulty switch
                {
                    1 => 4,
                    2 => 5,
                    3 => 6,
                    _ => 6
                };

            var availableNumbers = Enumerable.Range(range.Min, range.Max - range.Min + 1).Where(number => !usedNumbers.Contains(number)).ToList();

            if (availableNumbers.Count < numberCount)
            {
                availableNumbers =
                    Enumerable.Range(range.Min, range.Max - range.Min + 1).ToList();
            }

            if (availableNumbers.Count < numberCount)
            {
                throw new InvalidOperationException(
                    $"Not enough numbers are available for sorting " +
                    $"in range {range.Min}-{range.Max}. " +
                    $"Required: {numberCount}, " +
                    $"Available: {availableNumbers.Count}.");
            }

            Shuffle(availableNumbers);

            var numbers = availableNumbers.Take(numberCount).ToList();

            foreach (var number in numbers)
            {
                usedNumbers.Add(number);
            }

            var answer = numbers.OrderBy(number => number).ToList();

            var data = new
            {
                questionType = "sorting",
                numbers,
                direction = "ascending",
                options = new[]
               {
                   "Smallest to Largest"
               },
                selectionMode = "single",
                answerType = "number-array"
            };

            return CreateQuestion(questionNumber, questionTypeId, "Sort the numbers from smallest to largest.", data, JsonSerializer.Serialize(answer));
        }
        private GeneratedQuestion GeneratePattern(int questionNumber, int questionTypeId, int difficultyId, string? visualStyleName, List<string> visualIcons)
        {
            if (visualIcons.Count == 0 || visualIcons == null)
            {
                throw new ArgumentNullException(nameof(visualIcons));
            }
            List<string> icons = visualIcons.Where(x => !string.IsNullOrWhiteSpace(x)).Distinct().ToList();
            if (icons.Count < 2)
            {
                throw new InvalidOperationException(
                    $"At least 2 unique VisualStyleItems are required " +
                    $"for visual style '{visualStyleName}'.");
            }
            Shuffle(icons);
            string firstIcon = icons[0];
            string secondIcon = icons[1];

            var pattern = new List<string> { firstIcon, secondIcon, firstIcon, secondIcon, "?" };
            var options = new List<string> { firstIcon, secondIcon };
            var data = new
            {
                questionType = "pattern",

                visualStyle = visualStyleName,
                pattern,
                icons = pattern,

                missingIndex = 4,
                options,
                selectionMode = "single",
                answertype = "option"
            };

            return CreateQuestion(questionNumber, questionTypeId, "Complete the pattern.", data, firstIcon);
        }
        private GeneratedQuestion GenerateMissingNumber(int questionNumber, int questionTypeId, int levelId, int difficultyId, HashSet<int> usedNumbers)
        {
            var range = GetDifficultyRange(AdditionDifficultyConfig.ByGrade, levelId, difficultyId); // why var not int
            int step = _random.Next(1, 4);
            int maxStart = range.Max - (4 * step);

            if (maxStart < 1)
            {
                step = 1;
                maxStart = range.Max - 4;
            }

            if (maxStart < 1)
            {
                throw new InvalidOperationException("Difficulty range is too small for a missing-number sequence.");
            }

            int start = _random.Next(1, maxStart + 1);

            var sequence = Enumerable.Range(0, 5).Select(i => start + i * step).ToList();

            int missingIndex = _random.Next(sequence.Count);

            int answer = sequence[missingIndex];

            sequence[missingIndex] = -1;

            foreach (var number in sequence)
            {
                if (number > 0)
                {
                    usedNumbers.Add(number);
                }
            }


            var options = new HashSet<int> { answer };
            if (answer + step <= range.Max)
            {
                options.Add(answer + step);
            }
            if (answer - step >= 1)
            {
                options.Add(answer - step);
            }
            if (answer + (2 * step) <= range.Max)
            {
                options.Add(answer + (2 * step));
            }
            int attempts = 0;
            int maxAttempts = 100;

            while (options.Count < 4 && attempts < maxAttempts)
            {
                attempts++;

                int candidate = _random.Next(1, range.Max + 1);

                if (!options.Contains(candidate))
                {
                    options.Add(candidate);
                }
            }
            var optionList = options.ToList();

            Shuffle(optionList);

            var data = new
            {
                questionType = "missingNumber",
                numbers = sequence,
                missingIndex,
                options,
                selectionMode = "single"
            };

            return CreateQuestion(questionNumber, questionTypeId, "Find the missing number.", data, answer.ToString());
        }
        private GeneratedQuestion GenerateReasoning(int questionNumber, int questionTypeId, int levelId, int difficultyId, HashSet<int> usedNumbers)
        {
            var actualDifficulty = ResolveDifficulty(difficultyId);
            var range = GetDifficultyRange(AdditionDifficultyConfig.ByGrade, levelId, actualDifficulty);

            int number = GetUniqueNumber(range.Max, usedNumbers);

            bool canDivide = number % 2 == 0;

            string questionText = $"Riya has {number} pencils. " + "Can she divide them equally into two groups?";

            string answer = canDivide ? "Yes" : "No";

            var data = new
            {
                questionType = "reasoning",
                number,
                options = new[]
               {
                   "Yes",
                   "No"
               },
                selectionMode = "single"
            };

            return CreateQuestion(questionNumber, questionTypeId, questionText, data, answer);
        }
    }
}
