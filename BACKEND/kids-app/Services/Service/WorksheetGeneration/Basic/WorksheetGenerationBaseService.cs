using kids_app.Dto.Addition;
using kids_app.Dto.GenratedWorkSheet;
using kids_app.Models;
using kids_app.Services.Configurations;
using kids_app.Services.Configurations.Addition;
using kids_app.Services.Configurations.Easy_Mul_Division_Range;
using System.Text.Json;

namespace kids_app.Services
{
    public abstract class WorksheetGenerationBaseService : ILevelWorksheetGenerationService
    {
        protected readonly Random _random = new();

        public abstract GeneratedQuestion GenerateQuestion(int questionNumber,QuestionType questionType,int levelId,int difficultyId,string? visualStyleName,List<string> visualIcons,HashSet<int> usedNumbers,HashSet<string>? usedGameCombinations = null);

        protected void Shuffle<T>(List<T> values)
        {
            if (values == null || values.Count <= 1)
            {
                return;
            }

            for (int i = values.Count - 1; i > 0; i--)
            {
                int j = _random.Next(i + 1);
                (values[i], values[j]) = (values[j], values[i]);
            }
        }

        protected int GetMaximumNumber(int difficultyId)
        {
            return difficultyId switch
            {
                1 => 20,
                2 => 50,
                3 => 100,
                _ => 20
            };
        }

        protected GeneratedQuestion CreateQuestion(int questionNumber, int questionTypeId, string questionText, object data, string answer)
        {
            return new GeneratedQuestion
            {
                QuestionNumber = questionNumber,
                QuestionTypeId = questionTypeId,
                QuestionText = questionText,
                QuestionDataJson = JsonSerializer.Serialize(data),
                CorrectAnswer = answer,
                Marks = 1
            };
        }

        protected int GetUniqueNumber(int maxNumber, HashSet<int> usedNumbers)
        {
            if (maxNumber <= 0)
            {
                throw new ArgumentException("Maximum number must be greater than zero.", nameof(maxNumber));
            }

            var available = Enumerable.Range(1, maxNumber).Where(x => !usedNumbers.Contains(x)).ToList();

            if (available.Count == 0)
            {
                usedNumbers.Clear();
                available = Enumerable.Range(1, maxNumber).ToList();
            }

            int number = available[_random.Next(available.Count)];
            usedNumbers.Add(number);

            return number;
        }

        protected List<(int first, int second, int total)> GenerateUniqueGameCombinations(int firstMin, int firstMax, int secondMin, int secondMax, int difficultyId,Func<int, int, int, bool> isvalid)
        {
            int actualDifficulty = ResolveDifficulty(difficultyId);
            var combinations = new List<(int first, int second, int total)>();
            for (int first = firstMin; first <= firstMax; first++)
            {
                for (int second = secondMin; second <= secondMax; second++)
                {
                    if (!isvalid(actualDifficulty, first, second))
                    {
                        continue;
                    }
                    combinations.Add((first, second, first + second));
                }
            }
            if (combinations.Count == 0)
            {
                throw new InvalidOperationException("No valid game combinations are available for the selected difficulty");
            }
            Shuffle(combinations);

            return combinations;
        }

        protected List<int[]> GenerateUniqueGameCombinations(IEnumerable<int> values, int numberCount, int minTotal, int maxTotal, Func<int[], bool>? isValid = null)
        {
            if (values == null)
            {
                throw new ArgumentNullException(nameof(values));
            }

            if (numberCount < 1)
            {
                throw new ArgumentException("Number count must be greater than zero.", nameof(numberCount));
            }

            if (minTotal > maxTotal)
            {
                throw new ArgumentException("Minimum total cannot be greater than maximum total.");
            }

            var availableValues = values.Distinct().ToList();

            if (availableValues.Count == 0)
            {
                throw new InvalidOperationException("No values are available for generating combinations.");
            }

            var combinations = new List<int[]>();
            int[] current = new int[numberCount];
            int minimumValue = availableValues.Min();
            int maximumValue = availableValues.Max();

            void Build(int index, int currentTotal)
            {
                if (index == numberCount)
                {
                    if (currentTotal < minTotal || currentTotal > maxTotal)
                    {
                        return;
                    }

                    if (isValid != null && !isValid(current))
                    {
                        return;
                    }

                    combinations.Add(current.ToArray());
                    return;
                }

                foreach (int value in availableValues)
                {
                    int nextTotal = currentTotal + value;
                    int remainingCount = numberCount - index - 1;
                    int minimumRemaining = remainingCount * minimumValue;
                    int maximumRemaining = remainingCount * maximumValue;

                    if (nextTotal + minimumRemaining > maxTotal)
                    {
                        continue;
                    }

                    if (nextTotal + maximumRemaining < minTotal)
                    {
                        continue;
                    }

                    current[index] = value;
                    Build(index + 1, nextTotal);
                }
            }

            Build(0, 0);

            if (combinations.Count == 0)
            {
                throw new InvalidOperationException("No valid combinations are available for the selected rules.");
            }

            Shuffle(combinations);

            return combinations;
        }

        protected string GetDatabaseVisualIcon(List<string> visualIcons, int questionNumber)
        {
            if (visualIcons.Count == 0)
            {
                return "🍎";
            }
            return visualIcons[(questionNumber - 1) % visualIcons.Count];
        }

        protected int ResolveDifficulty(int difficultyId)
        {
            if (difficultyId == 4)
            {
                return _random.Next(1, 4);
            }
            if (difficultyId < 1 || difficultyId > 3)
            {
                throw new ArgumentOutOfRangeException(nameof(difficultyId), difficultyId, "Difficulty must be between 1 and 4.");
            }
            return difficultyId;
        }

        protected DifficultyRange GetDifficultyRange(Dictionary<int, DifficultyRange[]> config, int levelId, int difficultyId)
        {
            int actualDifficulty = ResolveDifficulty(difficultyId);
            if (!config.TryGetValue(levelId, out var ranges))
            {
                throw new ArgumentException($"Unsupported grade/level: {levelId}", nameof(levelId));
            }
            if (actualDifficulty < 1 || actualDifficulty > ranges.Length)
            {
                throw new ArgumentException($"Difficulty {actualDifficulty} is not configured for level {levelId}.", nameof(difficultyId));
            }
            return ranges[actualDifficulty - 1];
        }

        protected T GetUnusedCandidate<T>(IEnumerable<T> candidates, string keyPrefix, Func<T, string> keySelector, HashSet<string> usedKeys)
        {
            var availble = candidates.Where(x => !usedKeys.Contains($"{keyPrefix}:{keySelector(x)}")).ToList();
            if (availble.Count == 0)
            {
                throw new InvalidOperationException($"No unused combinations remain for {keyPrefix} at the selected difficulty.");
            }
            T selected = availble[_random.Next(availble.Count)];
            usedKeys.Add($"{keyPrefix}:{keySelector(selected)}");
            return selected;
        }

        protected List<int> GenerateNumbersWithRequiredParity(int minNumber, int maxNumber, bool requireOdd, int count, HashSet<int> usedNumbers)
        {
            if (minNumber > maxNumber)
            {
                throw new ArgumentException("Minimum number cannot be greater than maximum number.");
            }
            if (count < 1)
            {
                throw new ArgumentException("Count must be greater than zero.", nameof(count));
            }
            var allNumbers = Enumerable.Range(minNumber, maxNumber - minNumber + 1);

            var targetNumbers = allNumbers.Where(x => (x % 2 != 0) == requireOdd)
                                          .Where(x => !usedNumbers.Contains(x))
                                          .ToList();

            var oppositeNumbers = allNumbers.Where(x => (x % 2 != 0) != requireOdd)
                                            .Where(x => !usedNumbers.Contains(x))
                                            .ToList();

            Shuffle(targetNumbers);
            Shuffle(oppositeNumbers);

            if (targetNumbers.Count == 0)
            {
                targetNumbers = allNumbers.Where(x => (x % 2 != 0) == requireOdd).ToList();
                Shuffle(targetNumbers);
            }

            if (oppositeNumbers.Count == 0)
            {
                oppositeNumbers = allNumbers.Where(x => (x % 2 != 0) != requireOdd).ToList();
                Shuffle(oppositeNumbers);
            }

            if (targetNumbers.Count == 0)
            {
                throw new InvalidOperationException("No numbers available for the requested parity.");
            }

            var result = new List<int>();
            result.Add(targetNumbers[0]);

            foreach (var number in oppositeNumbers)
            {
                if (result.Count >= count)
                {
                    break;
                }
                result.Add(number);
            }
            foreach (var number in targetNumbers.Skip(1))
            {
                if (result.Count >= count)
                {
                    break;
                }
                result.Add(number);
            }
            foreach (var number in result)
            {
                usedNumbers.Add(number);
            }
            Shuffle(result);

            return result;
        }

        protected (int first, int second, int total) GenrateAdditionValues(int levelId, int difficultyId)
        {
            var range = GetDifficultyRange(AdditionDifficultyConfig.ByGrade, levelId, difficultyId);
            int minTotal = Math.Max(2, range.Min);

            if (range.Max < minTotal)
            {
                throw new InvalidOperationException(
                    "The selected difficulty range is too small " +
                    "to generate two positive addition numbers.");
            }

            int total = _random.Next(minTotal, range.Max + 1);
            int first = _random.Next(1, total);
            int second = total - first;

            return (first, second, total);
        }

        protected (int first, int second, int total, int carryCount) GenerateVerticalOperands(
            DifficultyRange range, int digitCount, bool requireCarry, string typeCode, HashSet<string> usedGameCombinations)
        {
            const int maxAttempts = 100;
            int maximumResult = requireCarry ? (int)Math.Pow(10, digitCount + 1) - 1 : (int)Math.Pow(10, digitCount) - 1;

            for (int attempt = 0; attempt < maxAttempts; attempt++)
            {
                int first = _random.Next(range.Min, range.Max + 1);
                int second = _random.Next(range.Min, range.Max + 1);
                int total = first + second;
                if (total > maximumResult)
                {
                    continue;
                }

                int carryCount = CountCarryOperations(first, second, digitCount);
                bool correctCarryMode = requireCarry ? carryCount > 0 : carryCount == 0;

                if (!correctCarryMode)
                {
                    continue;
                }

                int smaller = Math.Min(first, second);
                int larger = Math.Max(first, second);
                string key = $"{typeCode}:{smaller}:{larger}";

                if (!usedGameCombinations.Add(key))
                {
                    continue;
                }

                return (first, second, total, carryCount);
            }

            throw new InvalidOperationException($"Unable to generate a unique " + $"{digitCount}-digit " + $"{(requireCarry ? "with-carry" : "without-carry")} " + $"addition for range {range.Min}-{range.Max}.");
        }

        protected int CountCarryOperations(int first, int second, int digitCount)
        {
            int carry = 0;
            int carryCount = 0;
            int firstTemp = first;
            int secondTemp = second;

            for (int column = 0; column < digitCount; column++)
            {
                int firstDigit = firstTemp % 10;
                int secondDigit = secondTemp % 10;
                int columnTotal = firstDigit + secondDigit + carry;

                if (columnTotal >= 10)
                {
                    carry = 1;
                    carryCount++;
                }
                else
                {
                    carry = 0;
                }

                firstTemp /= 10;
                secondTemp /= 10;
            }

            return carryCount;
        }

        protected CalendarSubtractionRange GetCalendarSubtractionRange(int levelId, int difficultyId)
        {
            int actualDifficulty = ResolveDifficulty(difficultyId);

            if (!CalendarSubtractionDifficultyConfig.ByGrade.TryGetValue(levelId, out var ranges))
            {
                throw new ArgumentException($"Unsupported calendar level: {levelId}", nameof(levelId));
            }

            if (actualDifficulty < 1 || actualDifficulty > ranges.Length)
            {
                throw new ArgumentException(
                    $"Calendar difficulty {actualDifficulty} is not configured " +
                    $"for level {levelId}.",
                    nameof(difficultyId));
            }

            return ranges[actualDifficulty - 1];
        }

        protected List<(int First, int Second, int Product)>
            BuildMultiplicationFacts(DifficultyRange range, bool ordered)
        {
            if (range.Min < 1 || range.Max < range.Min)
            {
                throw new InvalidOperationException(
                    $"Invalid multiplication range {range.Min}-{range.Max}.");
            }

            int max = range.Max;

            var facts =
                new List<(int First, int Second, int Product)>();

            int firstLimit = ordered
                ? max
                : (int)Math.Sqrt(max);

            for (int first = 1; first <= firstLimit; first++)
            {
                int secondStart = ordered ? 1 : first;
                int secondLimit = max / first;

                for (int second = secondStart;
                     second <= secondLimit;
                     second++)
                {
                    int product = first * second;

                    if (product < range.Min || product > range.Max)
                        continue;

                    facts.Add((first, second, product));
                }
            }

            if (facts.Count == 0)
            {
                throw new InvalidOperationException(
                    $"No multiplication facts exist in range " +
                    $"{range.Min}-{range.Max}.");
            }

            return facts;
        }

        protected List<(int Divisor, int Quotient, int Dividend)> BuildDivisionFacts(DifficultyRange range)
        {
            if (range.Min < 1 || range.Max < range.Min)
            {
                throw new InvalidOperationException(
                    $"Invalid division range {range.Min}-{range.Max}.");
            }

            int max = range.Max;

            var facts =
                new List<(int Divisor, int Quotient, int Dividend)>();

            for (int divisor = 2; divisor <= max; divisor++)
            {
                int maxQuotient = max / divisor;

                for (int quotient = 1;
                     quotient <= maxQuotient;
                     quotient++)
                {
                    int dividend = divisor * quotient;

                    if (dividend < range.Min || dividend > max)
                        continue;

                    facts.Add((divisor, quotient, dividend));
                }
            }

            if (facts.Count == 0)
            {
                throw new InvalidOperationException(
                    $"No exact division facts exist in range " +
                    $"{range.Min}-{range.Max}.");
            }

            return facts;
        }

        protected List<int> BuildNumericalOptions(int correctAnswer,int minValue,int maxValue,int optionCount = 4)
        {
            if (maxValue < minValue ||
                maxValue - minValue + 1 < optionCount)
            {
                throw new InvalidOperationException(
                    $"Range {minValue}-{maxValue} does not contain " +
                    $"{optionCount} distinct answer options.");
            }

            if (correctAnswer < minValue || correctAnswer > maxValue)
            {
                throw new InvalidOperationException(
                    $"Correct answer {correctAnswer} is outside " +
                    $"the option range {minValue}-{maxValue}.");
            }

            var options = new List<int> { correctAnswer };

            options.AddRange(
                GetNearbyNumericalValues(
                    correctAnswer,
                    minValue,
                    maxValue,
                    optionCount - 1));

            if (options.Count < optionCount)
            {
                throw new InvalidOperationException(
                    "Unable to create enough distinct numerical options.");
            }

            Shuffle(options);

            return options;
        }


        protected List<int> GetNearbyNumericalValues(int correctAnswer,int minValue,int maxValue,int count)
        {
            var values = new List<int>();

            for (int distance = 1;
                 values.Count < count &&
                 distance <= maxValue - minValue;
                 distance++)
            {
                int lower = correctAnswer - distance;
                int upper = correctAnswer + distance;

                if (lower >= minValue)
                    values.Add(lower);

                if (values.Count < count && upper <= maxValue)
                    values.Add(upper);
            }

            return values;
        }

        protected List<string> BuildTextOptions(string correctAnswer,IEnumerable<string> distractors,int optionCount = 4)
        {
            var available = distractors
                .Where(x =>
                    !string.Equals(
                        x,
                        correctAnswer,
                        StringComparison.Ordinal))
                .Distinct(StringComparer.Ordinal)
                .ToList();

            Shuffle(available);

            if (available.Count < optionCount - 1)
            {
                throw new InvalidOperationException(
                    $"Not enough distinct equation options for " +
                    $"'{correctAnswer}'.");
            }

            var options = available
                .Take(optionCount - 1)
                .ToList();

            options.Add(correctAnswer);

            Shuffle(options);

            return options;
        }

        protected List<int> GetGrade1Factors(int levelId,int actualDifficulty)
        {
            if (!Grade1_Div_Mul_DifficultyConfig.ByLevel
                    .TryGetValue(levelId, out var ranges) ||
                actualDifficulty < 1 ||
                actualDifficulty > ranges.Length)
            {
                throw new InvalidOperationException(
                    $"No factor range configured for level {levelId}, " +
                    $"difficulty {actualDifficulty}.");
            }

            DifficultyRange range = ranges[actualDifficulty - 1];

            int min = Math.Max(2, range.Min);
            int max = range.Max;

            if (min > max)
            {
                throw new InvalidOperationException(
                    $"Invalid factor range: {min}-{max}.");
            }

            return Enumerable
                .Range(min, max - min + 1)
                .ToList();
        }

        protected List<T> GetGrade1Candidates<T>(string questionTypeCode,Func<T, string> combinationKey,IEnumerable<T> candidates,HashSet<string> usedGameCombinations)
        {
            return candidates
                .GroupBy(combinationKey)
                .Select(group => group.First())
                .ToList();
        }

        protected int GetDifficultyValue(Dictionary<int, int[]> config,int levelId,int difficultyId)
        {
            int actualDifficulty = ResolveDifficulty(difficultyId);

            if (!config.TryGetValue(levelId, out var values))
            {
                throw new ArgumentException(
                    $"Unsupported grade/level: {levelId}",
                    nameof(levelId));
            }

            if (actualDifficulty < 1 || actualDifficulty > values.Length)
            {
                throw new ArgumentException(
                    $"Difficulty {actualDifficulty} is not configured for level {levelId}.",
                    nameof(difficultyId));
            }

            return values[actualDifficulty - 1];
        }
    }
}
