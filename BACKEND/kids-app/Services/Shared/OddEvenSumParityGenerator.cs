
using kids_app.Dto.GenratedWorkSheet;
using kids_app.Models;
using kids_app.Services.Configurations.Addition;
using kids_app.Services.Configurations.OddEven;
using System.Text.Json;

namespace kids_app.Services.Shared
{
    public static class OddEvenQuestionGenerator
    {
        public static GeneratedQuestion Generate(
            int questionNumber,
            int questionTypeId,
            string code,
            int levelId,
            int difficultyId,
            List<string>? visualIcons,
            HashSet<string> usedGameCombinations)
        {
            if (usedGameCombinations == null)
                throw new ArgumentNullException(nameof(usedGameCombinations));

            code = (code ?? string.Empty).Trim().ToUpperInvariant();

            // Resolve Mixed difficulty.
            int actualDifficulty = difficultyId == 4
                ? Random.Shared.Next(1, 4)
                : difficultyId;

            if (actualDifficulty < 1 || actualDifficulty > 3)
                throw new ArgumentOutOfRangeException(nameof(difficultyId));

            var icons = (visualIcons ?? new List<string>())
                .Where(x => !string.IsNullOrWhiteSpace(x))
                .Distinct()
                .ToList();

            string keyPrefix =
                $"{code}:L{levelId}:D{actualDifficulty}";

            switch (code)
            {
                // ==========================================
                // 1. PAIR NUMBERS AND FIND LEFTOVERS
                // ==========================================

                case "ODD_EVEN_PAIRING_REMAINDER":
                    {
                        var range = GetRange(
                            OddEvenDifficultyConfig.PairingRemainderByLevel,
                            levelId,
                            actualDifficulty);

                        int minimumTotal = Math.Max(2, range.Min);

                        if (minimumTotal > range.Max)
                        {
                            throw new InvalidOperationException(
                                $"Invalid pairing range {range.Min}-{range.Max}.");
                        }

                        var candidates = Enumerable
                            .Range(minimumTotal, range.Max - minimumTotal + 1)
                            .Select(total => new
                            {
                                Total = total,
                                PairCount = total / 2,
                                Remainder = total % 2
                            })
                            .ToList();

                        var available = candidates
                            .Where(x => !usedGameCombinations.Contains(
                                $"{keyPrefix}:{x.Total}"))
                            .ToList();

                        if (available.Count == 0)
                        {
                            throw new InvalidOperationException(
                                $"No unused pairing combinations remain for level {levelId}.");
                        }

                        var selected = available[
                            Random.Shared.Next(available.Count)];

                        usedGameCombinations.Add(
                            $"{keyPrefix}:{selected.Total}");

                        string? selectedIcon = icons.Count > 0
                            ? icons[Random.Shared.Next(icons.Count)]
                            : null;

                        var counters = Enumerable
                            .Range(1, selected.Total)
                            .Select(index => new
                            {
                                id = $"COUNTER_{index}",
                                icon = selectedIcon
                            })
                            .ToArray();

                        var pairs = Enumerable
                            .Range(0, selected.PairCount)
                            .Select(index => new
                            {
                                id = $"PAIR_{index + 1}",
                                objects = counters
                                    .Skip(index * 2)
                                    .Take(2)
                                    .ToArray()
                            })
                            .ToArray();

                        var unpairedObjects = counters
                            .Skip(selected.PairCount * 2)
                            .ToArray();

                        string questionText =
                            $"There are {selected.Total} counters. " +
                            "Make pairs of two. How many counters remain unpaired?";

                        var data = new
                        {
                            renderKey = "OddEvenParityorPair",
                            questionType = code,
                            title = "Pair Numbers and Find Leftovers",

                            totalItems = selected.Total,
                            pairSize = 2,
                            pairCount = selected.PairCount,
                            remainder = selected.Remainder,

                            counters,
                            pairs,
                            unpairedObjects,

                            answerMode = "input",
                            answerType = "number"
                        };

                        return CreateQuestion(
                            questionNumber,
                            questionTypeId,
                            questionText,
                            data,
                            selected.Remainder.ToString());
                    }

                // ==========================================
                // 2. COUNT ODD AND EVEN NUMBERS
                // ==========================================

                case "ODD_EVEN_COUNT_SET":
                    {
                        var range = GetRange(
                            OddEvenDifficultyConfig.CountSetByLevel,
                            levelId,
                            actualDifficulty);

                        const int setSize = 6;
                        const int maxAttempts = 5000;

                        if (range.Max - range.Min + 1 < setSize)
                        {
                            throw new InvalidOperationException(
                                $"Not enough numbers in range {range.Min}-{range.Max}.");
                        }

                        int[] selectedNumbers = Array.Empty<int>();
                        bool generated = false;

                        for (int attempt = 0; attempt < maxAttempts; attempt++)
                        {
                            var chosenNumbers = new HashSet<int>();

                            while (chosenNumbers.Count < setSize)
                            {
                                chosenNumbers.Add(
                                    Random.Shared.Next(range.Min, range.Max + 1));
                            }

                            var numbers = chosenNumbers
                                .OrderBy(x => x)
                                .ToArray();

                            bool containsOdd = numbers.Any(x => x % 2 != 0);
                            bool containsEven = numbers.Any(x => x % 2 == 0);

                            if (!containsOdd || !containsEven)
                                continue;

                            string uniqueKey =
                                $"{keyPrefix}:{string.Join("-", numbers)}";

                            if (!usedGameCombinations.Add(uniqueKey))
                                continue;

                            selectedNumbers = numbers;
                            generated = true;
                            break;
                        }

                        if (!generated)
                        {
                            throw new InvalidOperationException(
                                $"Could not generate a unique odd/even set for level {levelId}.");
                        }

                        int oddCount = selectedNumbers.Count(x => x % 2 != 0);
                        int evenCount = selectedNumbers.Count(x => x % 2 == 0);

                        var oddNumbers = selectedNumbers
                            .Where(x => x % 2 != 0)
                            .ToArray();

                        var evenNumbers = selectedNumbers
                            .Where(x => x % 2 == 0)
                            .ToArray();

                        string questionText =
                            $"Count the odd and even numbers in this set: " +
                            $"{string.Join(", ", selectedNumbers)}. " +
                            "How many are odd, and how many are even?";

                        var data = new
                        {
                            renderKey = "OddEvenParityorPair",
                            questionType = code,
                            title = "Count Odd and Even Numbers",

                            numbers = selectedNumbers,
                            numberCount = setSize,

                            oddNumbers,
                            evenNumbers,
                            oddCount,
                            evenCount,

                            answerMode = "two-inputs",
                            answerType = "odd-even-counts"
                        };

                        string answer = JsonSerializer.Serialize(
                            new
                            {
                                odd = oddCount,
                                even = evenCount
                            });

                        return CreateQuestion(
                            questionNumber,
                            questionTypeId,
                            questionText,
                            data,
                            answer);
                    }

                // ==========================================
                // 3. PREDICT WHETHER A SUM IS ODD OR EVEN
                // ==========================================

                case "ODD_EVEN_SUM_PARITY":
                    {
                        var range = GetRange(
                            OddEvenDifficultyConfig.SumParityByLevel,
                            levelId,
                            actualDifficulty);

                        var candidates = (
                            from first in Enumerable.Range(
                                range.Min, range.Max - range.Min + 1)

                            from second in Enumerable.Range(
                                range.Min, range.Max - range.Min + 1)

                            where first <= second

                            let sum = first + second

                            select new
                            {
                                FirstNumber = first,
                                SecondNumber = second,
                                Sum = sum,
                                Parity = sum % 2 == 0 ? "Even" : "Odd"
                            }
                        ).ToList();

                        var available = candidates
                            .Where(x => !usedGameCombinations.Contains(
                                $"{keyPrefix}:{x.FirstNumber}:{x.SecondNumber}"))
                            .ToList();

                        if (available.Count == 0)
                        {
                            throw new InvalidOperationException(
                                $"No unused sum-parity combinations remain for level {levelId}.");
                        }

                        var selected = available[
                            Random.Shared.Next(available.Count)];

                        usedGameCombinations.Add(
                            $"{keyPrefix}:{selected.FirstNumber}:{selected.SecondNumber}");

                        string questionText =
                            $"Predict whether the sum of {selected.FirstNumber} " +
                            $"and {selected.SecondNumber} is odd or even.";

                        var data = new
                        {
                            renderKey = "OddEvenParityorPair",
                            questionType = code,
                            title = "Predict the Sum's Parity",

                            firstNumber = selected.FirstNumber,
                            secondNumber = selected.SecondNumber,

                            equation =
                                $"{selected.FirstNumber} + {selected.SecondNumber} = ?",

                            options = new[] { "Odd", "Even" },

                            answerMode = "choice",
                            answerType = "parity"
                        };

                        return CreateQuestion(
                            questionNumber,
                            questionTypeId,
                            questionText,
                            data,
                            selected.Parity);
                    }

                default:
                    throw new ArgumentException(
                        $"Unsupported odd/even question type: {code}",
                        nameof(code));
            }
        }

        // ==========================================
        // COMMON HELPERS
        // ==========================================

        private static DifficultyRange GetRange(
            Dictionary<int, DifficultyRange[]> config,
            int levelId,
            int difficultyId)
        {
            if (!config.TryGetValue(levelId, out var ranges))
            {
                throw new InvalidOperationException(
                    $"No odd/even configuration found for level {levelId}.");
            }

            if (difficultyId < 1 || difficultyId > ranges.Length)
            {
                throw new ArgumentOutOfRangeException(
                    nameof(difficultyId));
            }

            return ranges[difficultyId - 1];
        }

        private static GeneratedQuestion CreateQuestion(
            int questionNumber,
            int questionTypeId,
            string questionText,
            object data,
            string answer)
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
    }
}
