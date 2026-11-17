using kids_app.Dto.GenratedWorkSheet;
using kids_app.Models;
using kids_app.Services.Configurations.Addition;
using kids_app.Services.Configurations.OddEven;
using Org.BouncyCastle.Asn1.X500;
using System.Text.Json;

namespace kids_app.Services
{
    public partial class Grade1WorksheetGenerationService
    {

        private GeneratedQuestion GenerateOddEvenParityOrPair(int questionNumber,int questionTypeId,string code,int levelId,int difficultyId,List<string> visualIcons,HashSet<string> usedGameCombinations)
        {
            if (usedGameCombinations == null)
            {
                throw new ArgumentNullException(nameof(usedGameCombinations));
            }

            code = (code ?? string.Empty).Trim().ToUpperInvariant();

            int actualDifficulty = ResolveDifficulty(difficultyId);

            var icons = (visualIcons ?? new List<string>())
                .Where(icon => !string.IsNullOrWhiteSpace(icon))
                .Distinct()
                .ToList();

            string keyPrefix =
                $"{code}:L{levelId}:D{actualDifficulty}";

            switch (code)
            {

                case "ODD_EVEN_PAIRING_REMAINDER":
                    {
                        var range = GetDifficultyRange(OddEvenDifficultyConfig.PairingRemainderByLevel,levelId,actualDifficulty);

                        int minimumTotal = Math.Max(2, range.Min);

                        if (minimumTotal > range.Max)
                        {
                            throw new InvalidOperationException(
                                $"Invalid pairing range {range.Min}-{range.Max} " +
                                $"for level {levelId}, difficulty {actualDifficulty}.");
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

                        var selected = GetUnusedCandidate(
                            candidates,
                            keyPrefix,
                            x => x.Total.ToString(),
                            usedGameCombinations);

                        string? selectedIcon = icons.Count > 0
                            ? icons[_random.Next(icons.Count)]
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
                            .Select(pairIndex => new
                            {
                                id = $"PAIR_{pairIndex + 1}",
                                objects = counters
                                    .Skip(pairIndex * 2)
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

                        return CreateQuestion(questionNumber,questionTypeId,questionText,data,selected.Remainder.ToString());
                    }


                case "ODD_EVEN_COUNT_SET":
                    {
                        var range = GetDifficultyRange(OddEvenDifficultyConfig.CountSetByLevel,levelId,actualDifficulty);

                        const int setSize = 6;
                        const int maxAttempts = 5000;

                        int availableCount = range.Max - range.Min + 1;

                        if (availableCount < setSize)
                        {
                            throw new InvalidOperationException(
                                $"The count-set range {range.Min}-{range.Max} " +
                                $"does not contain enough distinct numbers.");
                        }

                        int[] selectedNumbers = Array.Empty<int>();
                        bool generated = false;

                        for (int attempt = 0; attempt < maxAttempts; attempt++)
                        {
                            var chosenNumbers = new HashSet<int>();

                            while (chosenNumbers.Count < setSize)
                            {
                                chosenNumbers.Add(
                                    _random.Next(range.Min, range.Max + 1));
                            }

                            var numbers = chosenNumbers
                                .OrderBy(number => number)
                                .ToArray();
                            bool containsOdd = numbers.Any(number => number % 2 != 0);
                            bool containsEven = numbers.Any(number => number % 2 == 0);

                            if (!containsOdd || !containsEven)
                            {
                                continue;
                            }

                            string uniqueKey =
                                $"{keyPrefix}:{string.Join("-", numbers)}";

                            if (!usedGameCombinations.Add(uniqueKey))
                            {
                                continue;
                            }

                            selectedNumbers = numbers;
                            generated = true;
                            break;
                        }

                        if (!generated)
                        {
                            throw new InvalidOperationException(
                                $"Could not generate a unique odd/even number set " +
                                $"for level {levelId}, difficulty {actualDifficulty}.");
                        }

                        int oddCount = selectedNumbers.Count(number => number % 2 != 0);
                        int evenCount = selectedNumbers.Count(number => number % 2 == 0);

                        var oddNumbers = selectedNumbers
                            .Where(number => number % 2 != 0)
                            .ToArray();

                        var evenNumbers = selectedNumbers
                            .Where(number => number % 2 == 0)
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

                        string answer = System.Text.Json.JsonSerializer.Serialize(
                            new
                            {
                                odd = oddCount,
                                even = evenCount
                            });

                        return CreateQuestion(questionNumber,questionTypeId,questionText,data,answer);
                    }

                case "ODD_EVEN_SUM_PARITY":
                    {
                        var range = GetDifficultyRange(OddEvenDifficultyConfig.SumParityByLevel,levelId,actualDifficulty);

                        if (range.Min < 1 || range.Max < range.Min)
                        {
                            throw new InvalidOperationException(
                                $"Invalid sum-parity range {range.Min}-{range.Max}.");
                        }

                        var candidates = (
                            from firstNumber in Enumerable.Range(range.Min,range.Max - range.Min + 1)
                            from secondNumber in Enumerable.Range(range.Min,range.Max - range.Min + 1)
                            where firstNumber <= secondNumber

                            let sum = firstNumber + secondNumber

                            select new
                            {
                                FirstNumber = firstNumber,
                                SecondNumber = secondNumber,
                                Sum = sum,
                                Parity = sum % 2 == 0 ? "Even" : "Odd"
                            }
                        ).ToList();

                        var selected = GetUnusedCandidate(
                            candidates,
                            keyPrefix,
                            x => $"{x.FirstNumber}:{x.SecondNumber}",
                            usedGameCombinations);

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
                                $"{selected.FirstNumber} + " +
                                $"{selected.SecondNumber} = ?",

                            options = new[] { "Odd", "Even" },

                            answerMode = "choice",
                            answerType = "parity"
                        };

                        return CreateQuestion(questionNumber,questionTypeId,questionText,data,selected.Parity);
                    }

                default:
                    throw new ArgumentException(
                        $"Unsupported advanced odd/even question type: {code}",
                        nameof(code));
            }
        }

        private GeneratedQuestion GenerateOddEvenPredictOne(int questionNumber,int questionTypeId,string code,int levelId,int difficultyId,HashSet<string> usedGameCombinations)
        {
            if (usedGameCombinations == null)
            {
                throw new ArgumentNullException(nameof(usedGameCombinations));
            }

            code = (code ?? string.Empty).Trim().ToUpperInvariant();

            if (code != "ADD_ONE" && code != "SUBTRACT_ONE")
            {
                throw new ArgumentException(
                    $"Unsupported odd-even prediction question type: {code}",
                    nameof(code));
            }

            if (levelId != 2)
            {
                throw new ArgumentOutOfRangeException(
                    nameof(levelId),
                    levelId,
                    "Odd-even prediction supports only Learning Level ID 2.");
            }

            int actualDifficulty = ResolveDifficulty(difficultyId);

            DifficultyRange range = GetDifficultyRange(
                OddEvenDifficultyConfig.StartingNumberByLevel,
                levelId,
                actualDifficulty);

            // The question type determines the operation.
            bool isAddition = code == "ADD_ONE";

            string operation = code;
            string symbol = isAddition ? "+" : "-";
            string operationLabel = isAddition ? "Add One" : "Subtract One";

            var candidates = Enumerable
                .Range(range.Min, range.Max - range.Min + 1)
                .Select(number =>
                {
                    int result = isAddition ? number + 1 : number - 1;

                    return new
                    {
                        StartingNumber = number,
                        Result = result,
                        Parity = result % 2 == 0 ? "Even" : "Odd"
                    };
                })
                .Where(x => x.Result >= 0)
                .ToList();

            string keyPrefix =
                $"ODD_EVEN_{operation}:L{levelId}:D{actualDifficulty}";

            var selected = GetUnusedCandidate(
                candidates,
                keyPrefix,
                x => x.StartingNumber.ToString(),
                usedGameCombinations);

            string questionText = isAddition
                ? $"Add one: {selected.StartingNumber} + 1 = " +
                  $"{selected.Result}. Is {selected.Result} odd or even?"
                : $"Subtract one: {selected.StartingNumber} - 1 = " +
                  $"{selected.Result}. Is {selected.Result} odd or even?";

            var data = new
            {
                renderKey = "PredictTheOddEvenChange",
                questionType = code,
                title = "One More or One Less",

                operation,
                operationLabel,

                startingNumber = selected.StartingNumber,
                changeBy = 1,
                result = selected.Result,

                equation =
                    $"{selected.StartingNumber} {symbol} 1 = {selected.Result}",

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

        private GeneratedQuestion GenerateOddEvenNumerical(int questionNumber,int questionTypeId,string code,int levelId,int difficultyId,HashSet<string> usedGameCombinations)
        {
            if (usedGameCombinations == null)
                throw new ArgumentNullException(nameof(usedGameCombinations));

            code = (code ?? string.Empty).Trim().ToUpperInvariant();

            if (levelId != 2)
                throw new ArgumentOutOfRangeException(
                    nameof(levelId),
                    "Odd/Even question types support only Level 2.");

            int actualDifficulty = ResolveDifficulty(difficultyId);

            Dictionary<int, DifficultyRange[]> difficultyRanges = code switch
            {
                "ODD_EVEN_SUBTRACTION_PARITY" =>
                    OddEvenDifficultyConfig.SubtractionParityByLevel,

                "ODD_EVEN_MISSING_ADDEND_PARITY" =>
                    OddEvenDifficultyConfig.MissingAddendParityByLevel,

                "ODD_EVEN_COUNT_IN_RANGE" =>
                    OddEvenDifficultyConfig.SubtractionParityByLevel,

                _ => throw new ArgumentException(
                    $"Unsupported Odd/Even question type: {code}")
            };

            DifficultyRange range = GetDifficultyRange(difficultyRanges,levelId,actualDifficulty);

            if (code == "ODD_EVEN_SUBTRACTION_PARITY")
            {
                var candidates = (
                    from minuend in Enumerable.Range(
                        range.Min,
                        range.Max - range.Min + 1)
                    from subtrahend in Enumerable.Range(1, minuend - 1)
                    let result = minuend - subtrahend
                    select new
                    {
                        Minuend = minuend,
                        Subtrahend = subtrahend,
                        Parity = result % 2 == 0 ? "Even" : "Odd"
                    }
                ).ToList();

                string keyPrefix =
                    $"{code}:L{levelId}:D{actualDifficulty}";

                var selected = GetUnusedCandidate(
                    candidates,
                    keyPrefix,
                    x => $"{x.Minuend}-{x.Subtrahend}",
                    usedGameCombinations);
                string questionText = $"Is {selected.Minuend} - {selected.Subtrahend} odd or even?";

                var data = new
                {
                    renderKey = "OddEvenNumerical",
                    questionType = code,
                    title = "Predict the Parity of a Difference",
                    questionText = questionText,
                    minuend = selected.Minuend,
                    subtrahend = selected.Subtrahend,
                    equation = $"{selected.Minuend} - {selected.Subtrahend} = ?",
                    options = new[] { "Odd", "Even" },
                    answerMode = "choice",
                    answerType = "parity"
                };

                return CreateQuestion(questionNumber,questionTypeId,questionText,data,selected.Parity);
            }
            if (code == "ODD_EVEN_MISSING_ADDEND_PARITY")
            {
                var numbers = Enumerable.Range(
                    range.Min,
                    range.Max - range.Min + 1).ToList();

                var candidates = (
                    from baseNumber in numbers
                    from targetParity in new[] { "Odd", "Even" }
                    from addend in numbers
                    where ((baseNumber + addend) % 2 == 0
                        ? "Even"
                        : "Odd") == targetParity
                    select new
                    {
                        BaseNumber = baseNumber,
                        TargetParity = targetParity,
                        CorrectAddend = addend
                    }
                ).ToList();

                string keyPrefix =
                    $"{code}:L{levelId}:D{actualDifficulty}";

                var selected = GetUnusedCandidate(
                    candidates,
                    keyPrefix,
                    x => $"{x.BaseNumber}:{x.TargetParity}:{x.CorrectAddend}",
                    usedGameCombinations);

                var distractors = numbers
                    .Where(x =>
                        x % 2 != selected.CorrectAddend % 2)
                    .Distinct()
                    .OrderBy(_ => _random.Next())
                    .Take(3)
                    .ToList();

                if (distractors.Count < 3)
                    throw new InvalidOperationException(
                        "Unable to generate three distinct incorrect options.");

                var options = new List<int> { selected.CorrectAddend };
                options.AddRange(distractors);

                options = options
                    .OrderBy(_ => _random.Next())
                    .ToList();
                string questionText = $"Choose the number that makes the sum " +
                        $"{selected.TargetParity.ToLowerInvariant()}.";
                var data = new
                {
                    renderKey = "OddEvenNumerical",
                    questionType = code,
                    title = "Choose a Number to Make the Sum Odd or Even",
                    questionText = questionText,
                       
                    baseNumber = selected.BaseNumber,
                    targetParity = selected.TargetParity,
                    equation =
                        $"{selected.BaseNumber} + ? = {selected.TargetParity.ToLowerInvariant()}",
                    options = options.ToArray(),
                    answerMode = "choice",
                    answerType = "number"
                };

                return CreateQuestion(questionNumber,questionTypeId,questionText,data,selected.CorrectAddend.ToString());
            }

            if (code == "ODD_EVEN_COUNT_IN_RANGE")
            {
                var numbers = Enumerable.Range(
                    range.Min,
                    range.Max - range.Min + 1).ToList();

                var candidates = (
                    from startNumber in numbers
                    from endNumber in numbers
                    where endNumber - startNumber >= 6
                    from parity in new[] { "Odd", "Even" }
                    let count = Enumerable.Range(
                            startNumber + 1,
                            endNumber - startNumber - 1)
                        .Count(number =>
                            parity == "Even"
                                ? number % 2 == 0
                                : number % 2 != 0)
                    select new
                    {
                        StartNumber = startNumber,
                        EndNumber = endNumber,
                        Parity = parity,
                        Count = count
                    }
                ).ToList();

                string keyPrefix = $"{code}:L{levelId}:D{actualDifficulty}";

                var selected = GetUnusedCandidate(candidates,keyPrefix,x => $"{x.StartNumber}:{x.EndNumber}:{x.Parity}",usedGameCombinations);
                string questionText = $"How many {selected.Parity.ToLowerInvariant()} numbers " +
                        $"are strictly between {selected.StartNumber} " +
                        $"and {selected.EndNumber}?";
                var data = new
                {
                    renderKey = "OddEvenNumerical",
                    questionType = code,
                    title = "Count Odd or Even Numbers in a Range",
                    questionText = questionText,
                    startNumber = selected.StartNumber,
                    endNumber = selected.EndNumber,
                    parityToCount = selected.Parity,
                    answerMode = "number",
                    answerType = "count"
                };

                return CreateQuestion(questionNumber,questionTypeId,questionText,data,selected.Count.ToString());
            }

            throw new ArgumentException(
                $"Unsupported Odd/Even question type: {code}");
        }
    }
}
