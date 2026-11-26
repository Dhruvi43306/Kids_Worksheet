using kids_app.Models;
using kids_app.Services.Configurations.Reading;

namespace kids_app.Services
{
    public partial class EarlyLevelWorksheetGenerationService
    {
        private GeneratedQuestion GenerateIdentifyUpperLowerCase(int questionNumber,int questionTypeId,int levelId,int difficultyId,HashSet<string> usedGameCombinations)
        {
            if (usedGameCombinations == null)
            {
                throw new ArgumentNullException(nameof(usedGameCombinations));
            }

            int actualDifficulty = ResolveDifficulty(difficultyId);

            var range = GetDifficultyRange(ReadingDifficultyConfig.IdentifyUpperLowerCaseByLevel,levelId,actualDifficulty);

            if (range.Min > range.Max)
            {
                throw new InvalidOperationException(
                    $"Invalid alphabet range {range.Min}-{range.Max} " +
                    $"for level {levelId}, difficulty {actualDifficulty}.");
            }

            // Generate uppercase alphabet candidates.
            var candidates = (from letterCode in Enumerable.Range(range.Min,range.Max - range.Min + 1)

                from askUppercase in new[] { true, false }

                select new
                {
                    Letter = (char)letterCode,
                    AskUppercase = askUppercase
                }
            ).ToList();

            string keyPrefix =
                $"IDENTIFY_UPPER_LOWER:L{levelId}:D{actualDifficulty}";

            // Select an unused letter and question direction.
            var selected = GetUnusedCandidate(candidates,keyPrefix,x => $"{x.Letter}:{x.AskUppercase}",usedGameCombinations);

            // Determine target and correct answer.
            string targetLetter = selected.AskUppercase
                ? char.ToLowerInvariant(selected.Letter).ToString()
                : selected.Letter.ToString();

            string correctAnswer = selected.AskUppercase
                ? selected.Letter.ToString()
                : char.ToLowerInvariant(selected.Letter).ToString();

            string targetCase = selected.AskUppercase
                ? "Uppercase"
                : "Lowercase";

            // Difficulty-based option count.
            int optionCount = actualDifficulty switch
            {
                1 => 3,
                2 => 4,
                3 => 5,
                _ => throw new ArgumentOutOfRangeException(
                    nameof(difficultyId),
                    "Unsupported difficulty level.")
            };

            // Generate incorrect options.
            var availableOptions = Enumerable.Range(
                    range.Min,
                    range.Max - range.Min + 1)
                .Select(x => (char)x)
                .Where(x => x != selected.Letter)
                .Select(x => selected.AskUppercase
                    ? x.ToString()
                    : char.ToLowerInvariant(x).ToString())
                .ToList();

            Shuffle(availableOptions);

            var options = new List<string>
    {
        correctAnswer
    };

            options.AddRange(
                availableOptions.Take(optionCount - 1));

            // Shuffle correct and incorrect options.
            Shuffle(options);

            string questionText = selected.AskUppercase
                ? "Choose the uppercase letter for the given lowercase letter."
                : "Choose the lowercase letter for the given uppercase letter.";

            var data = new
            {
                questionType = "Identifyuppercaseandlowercaseletters",
                targetLetter,
                targetCase,
                options,
                selectionMode = "single",
                answerType = "letter"
            };

            return CreateQuestion(questionNumber,questionTypeId,questionText,data,correctAnswer);
        }

        private GeneratedQuestion GenerateReadingFundamentalsQuestion(int questionNumber,int questionTypeId,string questionTypeCode,int levelId,int difficultyId,HashSet<string> usedGameCombinations)
        {
            if (usedGameCombinations == null)
            {
                throw new ArgumentNullException(nameof(usedGameCombinations));
            }

            questionTypeCode = (questionTypeCode ?? string.Empty)
                .Trim()
                .ToUpperInvariant();

            int actualDifficulty = ResolveDifficulty(difficultyId);

            var range = GetDifficultyRange(ReadingDifficultyConfig.ReadingFundamentalsAlphabetByLevel,levelId,actualDifficulty);

            if (range.Min > range.Max)
            {
                throw new InvalidOperationException(
                    $"Invalid alphabet range {range.Min}-{range.Max} " +
                    $"for level {levelId}, difficulty {actualDifficulty}.");
            }

            // Generate available alphabet letters.
            var alphabetLetters = Enumerable.Range(
                    range.Min,
                    range.Max - range.Min + 1)
                .Select(x => (char)x)
                .ToList();

            // Difficulty-based settings.
            int itemCount = actualDifficulty switch
            {
                1 => 3,
                2 => 4,
                3 => 5,
                _ => throw new ArgumentOutOfRangeException(
                    nameof(difficultyId),
                    "Unsupported difficulty level.")
            };

            // Sequence length for missing-letter question.
            int sequenceLength = actualDifficulty switch
            {
                1 => 4,
                2 => 5,
                3 => 6,
                _ => throw new ArgumentOutOfRangeException(
                    nameof(difficultyId),
                    "Unsupported difficulty level.")
            };

            string keyPrefix =
                $"{questionTypeCode}:L{levelId}:D{actualDifficulty}";

            string questionText;
            string correctAnswer;
            object data;

            // Generate unique letter combinations.
            // This local function is inside the same generator method.
            List<List<char>> BuildCombinations(int combinationSize)
            {
                var result = new List<List<char>>();

                var current = new List<char>();

                void Build(int startIndex)
                {
                    if (current.Count == combinationSize)
                    {
                        result.Add(current.ToList());
                        return;
                    }

                    for (
                        int i = startIndex;
                        i <= alphabetLetters.Count -
                            (combinationSize - current.Count);
                        i++)
                    {
                        current.Add(alphabetLetters[i]);

                        Build(i + 1);

                        current.RemoveAt(current.Count - 1);
                    }
                }

                Build(0);

                return result;
            }

            switch (questionTypeCode)
            {

                case "MATCH_UPPER_LOWER_CASE_LETTERS":
                    {
                        int pairCount = itemCount;

                        var candidates = BuildCombinations(pairCount);

                        var selectedLetters = GetUnusedCandidate(
                            candidates,
                            keyPrefix,
                            x => string.Join(
                                "",
                                x.OrderBy(letter => letter)),
                            usedGameCombinations);

                        // Uppercase letters.
                        var uppercaseLetters = selectedLetters
                            .Select(x => x.ToString())
                            .ToList();

                        // Lowercase letters.
                        var lowercaseLetters = selectedLetters
                            .Select(x => char.ToLowerInvariant(x).ToString())
                            .ToList();

                        // Shuffle both columns independently.
                        Shuffle(uppercaseLetters);
                        Shuffle(lowercaseLetters);

                        // Ensure the same correct pairs are not already
                        // aligned in exactly the same column positions.
                        if (uppercaseLetters
                            .Select(x => char.ToLowerInvariant(x[0]).ToString())
                            .SequenceEqual(lowercaseLetters))
                        {
                            var firstLetter = lowercaseLetters[0];

                            lowercaseLetters.RemoveAt(0);

                            lowercaseLetters.Add(firstLetter);
                        }

                        // Example: A:a|D:d|H:h
                        correctAnswer = string.Join(
                            "|",
                            selectedLetters
                                .OrderBy(x => x)
                                .Select(x =>
                                    $"{x}:{char.ToLowerInvariant(x)}"));

                        questionText =
                            "Match each uppercase letter with its lowercase letter.";

                        data = new
                        {
                           questionType = "Matchuppercasewithlowercase",
                           uppercaseLetters,
                           lowercaseLetters,
                           pairCount,
                           selectionMode = "matching",
                           answerType = "letterPairs"
                        };

                        break;
                    }
                    

                case "FIND_THE_MISSING_LETTERS":
                    {
                        // Generate possible starting positions.
                        int startCount =
                            range.Max - range.Min - sequenceLength + 2;

                        if (startCount <= 0)
                        {
                            throw new InvalidOperationException(
                                "Alphabet range is too small for the missing-letter sequence.");
                        }

                        var candidates = (
                            from start in Enumerable.Range(
                                range.Min,
                                startCount)

                            from missingIndex in Enumerable.Range(
                                0,
                                sequenceLength)

                            select new
                            {
                                Start = start,
                                MissingIndex = missingIndex
                            }
                        ).ToList();

                        // Select an unused sequence and missing position.
                        var selected = GetUnusedCandidate(candidates,keyPrefix,x => $"{x.Start}:{x.MissingIndex}",usedGameCombinations);

                        // Generate complete alphabetical sequence.
                        var completeSequence = Enumerable.Range(selected.Start,sequenceLength)
                            .Select(x => (char)x)
                            .ToList();

                        char correctLetter = completeSequence[selected.MissingIndex];

                        // Hide the missing letter.
                        List<string?> sequence = completeSequence
                            .Select((letter, index) =>
                                index == selected.MissingIndex
                                    ? null
                                    : letter.ToString())
                            .ToList();

                        // Exclude all sequence letters from incorrect options.
                        var availableOptions = alphabetLetters
                            .Where(x => !completeSequence.Contains(x))
                            .Select(x => x.ToString())
                            .ToList();

                        if (availableOptions.Count < itemCount - 1)
                        {
                            throw new InvalidOperationException(
                                "Not enough incorrect options for missing-letter question.");
                        }

                        Shuffle(availableOptions);

                        var options = new List<string>{correctLetter.ToString()};

                        options.AddRange(availableOptions.Take(itemCount - 1));

                        Shuffle(options);

                        correctAnswer = correctLetter.ToString();

                        questionText =
                            "Find the missing letter in the alphabetical sequence.";

                        data = new
                        {
                           questionType = "Findthemissingletter",
                           sequence,
                           missingIndex = selected.MissingIndex,
                           options,
                           selectionMode = "single",
                           answerType = "letter"
                        };

                        break;
                    }


                case "ARRANGE_LETTERS_ALPHA_ORDER":
                    {
                        int letterCount = itemCount;

                        var candidates = BuildCombinations(letterCount);

                        var selectedLetters = GetUnusedCandidate(
                            candidates,
                            keyPrefix,
                            x => string.Join(
                                "",
                                x.OrderBy(letter => letter)),
                            usedGameCombinations);

                        // Correct alphabetical order.
                        var orderedLetters = selectedLetters
                            .OrderBy(x => x)
                            .Select(x => x.ToString())
                            .ToList();

                        // Create shuffled letters.
                        var shuffledLetters = orderedLetters.ToList();

                        Shuffle(shuffledLetters);

                        // Ensure they are not already in correct order.
                        if (shuffledLetters.SequenceEqual(orderedLetters))
                        {
                            shuffledLetters.Reverse();
                        }

                        // Example: A,C,H
                        correctAnswer = string.Join(",", orderedLetters);

                        questionText =
                            "Arrange the following letters in alphabetical order.";

                        data = new
                        {
                           questionType = "Arrangelettersinalphabeticalorder",
                           letters = shuffledLetters,
                           letterCount,
                           selectionMode = "reorder",
                           answerType = "letterSequence"
                        };

                        break;
                    }

                default:
                    throw new NotSupportedException(
                        $"Reading question type '{questionTypeCode}' is not supported.");
            }

            return CreateQuestion(questionNumber,questionTypeId,questionText,data,correctAnswer);
        }

    }
}
