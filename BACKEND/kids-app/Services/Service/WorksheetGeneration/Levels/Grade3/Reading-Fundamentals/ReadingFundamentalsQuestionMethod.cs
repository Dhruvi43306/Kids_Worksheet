using kids_app.Models;
using kids_app.Services.Configurations.Reading;

namespace kids_app.Services
{
    public partial class Grade3WorksheetGenerationService
    {
        private GeneratedQuestion GenerateIdentifyUpperLowerCase(int questionNumber, int questionTypeId, int levelId, int difficultyId, HashSet<string> usedGameCombinations)
        {
            if (usedGameCombinations == null)
            {
                throw new ArgumentNullException(nameof(usedGameCombinations));
            }

            int actualDifficulty = ResolveDifficulty(difficultyId);

            var range = GetDifficultyRange(ReadingDifficultyConfig.IdentifyUpperLowerCaseByLevel, levelId, actualDifficulty);

            if (range.Min > range.Max)
            {
                throw new InvalidOperationException(
                    $"Invalid alphabet range {range.Min}-{range.Max} " +
                    $"for level {levelId}, difficulty {actualDifficulty}.");
            }

            // Generate uppercase alphabet candidates.
            var candidates = (from letterCode in Enumerable.Range(range.Min, range.Max - range.Min + 1)

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
            var selected = GetUnusedCandidate(candidates, keyPrefix, x => $"{x.Letter}:{x.AskUppercase}", usedGameCombinations);

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

            return CreateQuestion(questionNumber, questionTypeId, questionText, data, correctAnswer);
        }

        private GeneratedQuestion GenerateReadingFundamentalsQuestion(int questionNumber, int questionTypeId, string questionTypeCode, int levelId, int difficultyId, HashSet<string> usedGameCombinations)
        {
            if (usedGameCombinations == null)
            {
                throw new ArgumentNullException(nameof(usedGameCombinations));
            }

            questionTypeCode = (questionTypeCode ?? string.Empty)
                .Trim()
                .ToUpperInvariant();

            int actualDifficulty = ResolveDifficulty(difficultyId);

            var range = GetDifficultyRange(ReadingDifficultyConfig.ReadingFundamentalsAlphabetByLevel, levelId, actualDifficulty);

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
                        var selected = GetUnusedCandidate(candidates, keyPrefix, x => $"{x.Start}:{x.MissingIndex}", usedGameCombinations);

                        // Generate complete alphabetical sequence.
                        var completeSequence = Enumerable.Range(selected.Start, sequenceLength)
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

                        var options = new List<string> { correctLetter.ToString() };

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

            return CreateQuestion(questionNumber, questionTypeId, questionText, data, correctAnswer);
        }

        private GeneratedQuestion GeneratePhonicsSoundsQuestion(int questionNumber, int questionTypeId, string questionTypeCode, int levelId, int difficultyId, HashSet<string> usedGameCombinations)
        {
            if (usedGameCombinations == null)
            {
                throw new ArgumentNullException(nameof(usedGameCombinations));
            }

            questionTypeCode = (questionTypeCode ?? string.Empty)
                .Trim()
                .ToUpperInvariant();

            int actualDifficulty = ResolveDifficulty(difficultyId);

            if (!PhonicsDifficultyConfig.PhonicsWordsByLevel.TryGetValue(
                levelId,
                out var words))
            {
                throw new ArgumentOutOfRangeException(
                    nameof(levelId),
                    $"Phonics words are not configured for level {levelId}.");
            }

            // Difficulty settings.
            int optionCount = actualDifficulty switch
            {
                1 => 3,
                2 => 4,
                3 => 5,
                _ => throw new ArgumentOutOfRangeException(
                    nameof(difficultyId),
                    "Unsupported difficulty level.")
            };

            // Number of letter-sound pairs for matching.
            int pairCount = optionCount;

            string keyPrefix =
                $"{questionTypeCode}:L{levelId}:D{actualDifficulty}";

            string questionText;
            string correctAnswer;
            object data;

            // ==========================================
            // PREPARE UNIQUE LETTER-SOUND COMBINATIONS
            // ==========================================

            var soundPairs = words
                .SelectMany(word => new[]
                {
            new PhonicsSoundPair(
                word.BeginningGrapheme,
                word.BeginningSound),

            new PhonicsSoundPair(
                word.EndingGrapheme,
                word.EndingSound)
                })
                .GroupBy(x =>
                    $"{x.Grapheme.ToUpperInvariant()}:{x.Sound.ToLowerInvariant()}")
                .Select(x => x.First())
                .ToList();

            // Build answer choices from available sounds.
            List<string> BuildSoundOptions(string correctSound)
            {
                var availableOptions = soundPairs
                    .Select(x => x.Sound)
                    .Distinct(StringComparer.OrdinalIgnoreCase)
                    .Where(x => !string.Equals(
                        x,
                        correctSound,
                        StringComparison.OrdinalIgnoreCase))
                    .ToList();

                if (availableOptions.Count < optionCount - 1)
                {
                    throw new InvalidOperationException(
                        $"Not enough sound options for {questionTypeCode}, " +
                        $"level {levelId}, difficulty {actualDifficulty}.");
                }

                Shuffle(availableOptions);

                var options = new List<string>
        {
            correctSound
        };

                options.AddRange(
                    availableOptions.Take(optionCount - 1));

                Shuffle(options);

                return options;
            }

            // Build unique combinations for matching.
            List<List<PhonicsSoundPair>> BuildSoundCombinations(
                List<PhonicsSoundPair> candidates,
                int combinationSize)
            {
                var result = new List<List<PhonicsSoundPair>>();

                var current = new List<PhonicsSoundPair>();

                void Generate(int startIndex)
                {
                    if (current.Count == combinationSize)
                    {
                        result.Add(current.ToList());
                        return;
                    }

                    for (
                        int i = startIndex;
                        i <= candidates.Count -
                            (combinationSize - current.Count);
                        i++)
                    {
                        current.Add(candidates[i]);

                        Generate(i + 1);

                        current.RemoveAt(current.Count - 1);
                    }
                }

                Generate(0);

                return result;
            }


            switch (questionTypeCode)
            {

                case "IDENTIFY_BEGINNING_SOUNDS":
                    {
                        // Each word can be used only once
                        // in the same worksheet.
                        var selected = GetUnusedCandidate(words, keyPrefix, x => x.Word, usedGameCombinations);

                        string correctSound = selected.BeginningSound;

                        var options = BuildSoundOptions(correctSound);

                        questionText =
                            $"Which sound do you hear at the beginning of '{selected.Word}'?";

                        correctAnswer = correctSound;

                        data = new
                        {
                            questionType = "identifyBeginningSounds",
                            targetWord = selected.Word,
                            targetPosition = "beginning",
                            options,
                            selectionMode = "single",
                            answerType = "sound"
                        };

                        break;
                    }


                case "IDENTIFY_ENDING_SOUNDS":
                    {
                        // Each word can be used only once
                        // in the same worksheet.
                        var selected = GetUnusedCandidate(words, keyPrefix, x => x.Word, usedGameCombinations);

                        string correctSound = selected.EndingSound;

                        var options = BuildSoundOptions(correctSound);

                        questionText =
                            $"Which sound do you hear at the end of '{selected.Word}'?";

                        correctAnswer = correctSound;

                        data = new
                        {
                            questionType = "identifyEndingSounds",
                            targetWord = selected.Word,
                            targetPosition = "ending",
                            options,
                            selectionMode = "single",
                            answerType = "sound"
                        };
                        break;
                    }

                case "MATCH_LETTERS_WITH_SOUNDS":
                    {
                        if (soundPairs.Count < pairCount)
                        {
                            throw new InvalidOperationException(
                                "Not enough unique letter-sound pairs for matching.");
                        }

                        var candidates = BuildSoundCombinations(
                            soundPairs,
                            pairCount);

                        // Select an unused combination of letter-sound pairs.
                        var selectedPairs = GetUnusedCandidate(
                            candidates,
                            keyPrefix,
                            x => string.Join(
                                "|",
                                x.OrderBy(p => p.Grapheme)
                                 .ThenBy(p => p.Sound)
                                 .Select(p => $"{p.Grapheme}:{p.Sound}")),
                            usedGameCombinations);

                        // Left column: letters / letter groups.
                        var letters = selectedPairs
                            .Select(x => x.Grapheme)
                            .ToList();

                        // Right column: phonetic sounds.
                        var sounds = selectedPairs
                            .Select(x => x.Sound)
                            .ToList();

                        // Shuffle both columns separately.
                        Shuffle(letters);
                        Shuffle(sounds);

                        // Correct matching answer.
                        // Example: B:/b/|C:/k/|SH:/sh/
                        correctAnswer = string.Join(
                            "|",
                            selectedPairs
                                .OrderBy(x => x.Grapheme)
                                .ThenBy(x => x.Sound)
                                .Select(x => $"{x.Grapheme}:{x.Sound}"));

                        questionText =
                            "Match each letter or letter group with its correct sound.";

                        data = new
                        {
                            questionType = "matchLettersWithSounds",
                            letters,
                            sounds,
                            pairCount,
                            selectionMode = "matching",
                            answerType = "soundPairs"
                        };

                        break;
                    }


                case "CHOOSE_THE_CORRECT_SOUND":
                    {
                        // Select a unique letter-sound combination.
                        var selected = GetUnusedCandidate(soundPairs, keyPrefix, x => $"{x.Grapheme}:{x.Sound}", usedGameCombinations);

                        string correctSound = selected.Sound;

                        var options = BuildSoundOptions(correctSound);

                        questionText =
                            $"Which sound does the letter or letter group '{selected.Grapheme}' make?";

                        correctAnswer = correctSound;

                        data = new
                        {
                            questionType = "chooseTheCorrectSound",
                            targetLetter = selected.Grapheme,
                            options,
                            selectionMode = "single",
                            answerType = "sound"
                        };

                        break;
                    }

                default:
                    throw new NotSupportedException(
                        $"Phonics question type '{questionTypeCode}' is not supported.");
            }

            return CreateQuestion(questionNumber, questionTypeId, questionText, data, correctAnswer);
        }


        private GeneratedQuestion GenerateSightWordsQuestion(int questionNumber,int questionTypeId,string questionTypeCode,int levelId,int difficultyId,HashSet<string> usedGameCombinations)
        {
            if (usedGameCombinations == null)
            {
                throw new ArgumentNullException(nameof(usedGameCombinations));
            }

            questionTypeCode = (questionTypeCode ?? string.Empty)
                .Trim()
                .ToUpperInvariant();

            int actualDifficulty = ResolveDifficulty(difficultyId);

            // =====================================
            // GET WORDS USING LEVEL + DIFFICULTY
            // =====================================

            if (!SightWordsDifficultyConfig.SightWordsByLevelAndDifficulty
                .TryGetValue(levelId, out var difficultyBanks) ||
                !difficultyBanks.TryGetValue(actualDifficulty, out var configuredWords))
            {
                throw new ArgumentOutOfRangeException(
                    nameof(levelId),
                    $"Sight words are not configured for Level {levelId}, Difficulty {actualDifficulty}.");
            }

            // =====================================
            // GET DIFFICULTY SETTINGS
            // =====================================

            if (!SightWordsDifficultyConfig.DifficultySettingsByLevel
                .TryGetValue(levelId, out var levelSettings) ||
                !levelSettings.TryGetValue(actualDifficulty, out var settings))
            {
                throw new ArgumentOutOfRangeException(
                    nameof(difficultyId),
                    $"Sight word difficulty settings are missing for Level {levelId}, Difficulty {actualDifficulty}.");
            }

            var sightWords = configuredWords.ToList();

            int optionCount = settings.OptionCount;

            if (sightWords.Count < optionCount)
            {
                throw new InvalidOperationException(
                    $"Not enough sight words for Level {levelId}, Difficulty {actualDifficulty}.");
            }

            string keyPrefix =
                $"SIGHT_WORDS:L{levelId}:D{actualDifficulty}";

            string questionText;
            string correctAnswer;
            object data;

            // =====================================
            // BUILD ANSWER OPTIONS
            // =====================================

            List<string> BuildOptions(string targetWord)
            {
                var availableOptions = sightWords
                    .Where(x => !string.Equals(
                        x.Word,
                        targetWord,
                        StringComparison.OrdinalIgnoreCase))
                    .Select(x => x.Word)
                    .Distinct(StringComparer.OrdinalIgnoreCase)
                    .ToList();

                if (availableOptions.Count < optionCount - 1)
                {
                    throw new InvalidOperationException(
                        $"Not enough sight-word options for {questionTypeCode}, " +
                        $"Level {levelId}, Difficulty {actualDifficulty}.");
                }

                Shuffle(availableOptions);

                var options = new List<string>
        {
            targetWord
        };

                options.AddRange(availableOptions.Take(optionCount - 1));

                Shuffle(options);

                return options;
            }

            // =====================================
            // SELECT UNUSED SIGHT WORD
            // =====================================

            var selected = GetUnusedCandidate(
                sightWords,
                keyPrefix,
                x => x.Word.ToLowerInvariant(),
                usedGameCombinations
            );

            correctAnswer = selected.Word;

            // =====================================
            // GENERATE QUESTION
            // =====================================

            switch (questionTypeCode)
            {
                // =====================================
                // 1. IDENTIFY SIGHT WORDS
                // =====================================

                case "IDENTIFY_SIGHT_WORDS":
                    {
                        var options = BuildOptions(selected.Word);

                        string sentence = selected.Sentence.Replace(
                            "{word}",
                            selected.Word,
                            StringComparison.OrdinalIgnoreCase);

                        questionText =
                            "Read the sentence and identify the sight word.";

                        data = new
                        {
                            questionType = "identifySightWords",
                            targetWord = selected.Word,
                            sentence,
                            options,
                            selectionMode = "single",
                            answerType = "word"
                        };

                        break;
                    }

                // =====================================
                // 2. COMPLETE MISSING SIGHT WORDS
                // =====================================

                case "COMPLETE_MISSING_SIGHT_WORDS":
                    {
                        var options = BuildOptions(selected.Word);

                        string sentence = selected.Sentence.Replace(
                            "{word}",
                            "_____",
                            StringComparison.OrdinalIgnoreCase);

                        questionText =
                            "Choose the sight word that completes the sentence.";

                        data = new
                        {
                            questionType = "completeMissingSightWords",
                            sentence,
                            missingWord = true,
                            options,
                            selectionMode = "single",
                            answerType = "word"
                        };

                        break;
                    }

                // =====================================
                // 3. MATCH WORDS WITH PICTURES
                // =====================================

                case "MATCH_WORDS_WITH_PICTURES":
                    {
                        var options = BuildOptions(selected.Word);

                        questionText =
                            "Look at the picture and choose the matching word.";

                        data = new
                        {
                            questionType = "matchWordsWithPictures",
                            picture = selected.Picture,
                            pictureDescription = selected.PictureDescription,
                            pictureType = "emoji",
                            options,
                            selectionMode = "single",
                            answerType = "word"
                        };

                        break;
                    }

                // =====================================
                // 4. CHOOSE THE CORRECT WORD
                // =====================================

                case "CHOOSE_THE_CORRECT_WORD":
                    {
                        var options = BuildOptions(selected.Word);

                        questionText =
                            "Read the clue and choose the correct sight word.";

                        data = new
                        {
                            questionType = "chooseTheCorrectWord",
                            clue = selected.Clue,
                            options,
                            selectionMode = "single",
                            answerType = "word"
                        };

                        break;
                    }

                default:
                    throw new NotSupportedException(
                        $"Sight words question type '{questionTypeCode}' is not supported.");
            }

            return CreateQuestion(questionNumber,questionTypeId,questionText,data,correctAnswer
            );
        }


        private GeneratedQuestion GenerateRhymingWordsQuestion(int questionNumber,int questionTypeId,string questionTypeCode,int levelId,int difficultyId,HashSet<string> usedGameCombinations)
        {
            if (usedGameCombinations == null)
            {
                throw new ArgumentNullException(nameof(usedGameCombinations));
            }

            questionTypeCode = (questionTypeCode ?? string.Empty)
                .Trim()
                .ToUpperInvariant();

            int actualDifficulty = ResolveDifficulty(difficultyId);

            // =====================================
            // GET RHYMING WORDS BY LEVEL + DIFFICULTY
            // =====================================

            if (!RhymingWordsDifficultyConfig.RhymingWordsByLevelAndDifficulty
                .TryGetValue(levelId, out var difficultyFamilies) ||
                !difficultyFamilies.TryGetValue(actualDifficulty, out var configuredFamilies))
            {
                throw new ArgumentOutOfRangeException(
                    nameof(levelId),
                    $"Rhyming words are not configured for Level {levelId}, Difficulty {actualDifficulty}.");
            }

            // =====================================
            // GET DIFFICULTY SETTINGS
            // =====================================

            if (!RhymingWordsDifficultyConfig.DifficultySettingsByLevel
                .TryGetValue(levelId, out var levelSettings) ||
                !levelSettings.TryGetValue(actualDifficulty, out var settings))
            {
                throw new ArgumentOutOfRangeException(
                    nameof(difficultyId),
                    $"Rhyming difficulty settings are missing for Level {levelId}, Difficulty {actualDifficulty}.");
            }

            int optionCount = settings.OptionCount;
            int rhymeGroupSize = settings.RhymeGroupSize;

            // =====================================
            // FILTER WORDS BY WORD LENGTH
            // =====================================

            var families = configuredFamilies
                .Select(family => family
                    .Where(x =>
                        x.Word.Length >= settings.MinimumWordLength &&
                        x.Word.Length <= settings.MaximumWordLength)
                    .ToArray())
                .Where(family => family.Length >= rhymeGroupSize)
                .ToList();

            if (families.Count < 2)
            {
                throw new InvalidOperationException(
                    $"Not enough rhyme families for Level {levelId}, Difficulty {actualDifficulty}.");
            }

            var allWords = families
                .SelectMany(x => x)
                .ToList();

            // =====================================
            // CREATE CANDIDATES
            // =====================================

            var candidates = new List<(
                RhymingWordItem[] Family,
                RhymingWordItem Target)>();

            foreach (var family in families)
            {
                foreach (var word in family)
                {
                    candidates.Add((family, word));
                }
            }

            // Use one shared prefix so selected target words
            // do not repeat across different rhyming activities
            // in the same worksheet.

            string keyPrefix =
                $"RHYMING_WORDS:L{levelId}:D{actualDifficulty}";

            var selected = GetUnusedCandidate(
                candidates,
                keyPrefix,
                x => x.Target.Word.ToLowerInvariant(),
                usedGameCombinations
            );

            var familyWords = selected.Family;
            var target = selected.Target;

            string questionText;
            string correctAnswer;
            object data;

            // =====================================
            // BUILD OPTIONS
            // =====================================

            List<string> BuildOptions(
                string correctWord,
                IEnumerable<string> distractors)
            {
                var available = distractors
                    .Where(x => !string.Equals(
                        x,
                        correctWord,
                        StringComparison.OrdinalIgnoreCase))
                    .Distinct(StringComparer.OrdinalIgnoreCase)
                    .ToList();

                if (available.Count < optionCount - 1)
                {
                    throw new InvalidOperationException(
                        $"Not enough distractor words for {questionTypeCode}, " +
                        $"Level {levelId}, Difficulty {actualDifficulty}.");
                }

                Shuffle(available);

                var options = new List<string>
        {
            correctWord
        };

                options.AddRange(available.Take(optionCount - 1));

                Shuffle(options);

                return options;
            }

            // Distractors must come from other rhyme families.
            // This prevents multiple correct answers.

            var otherFamilyWords = families
                .Where(family => !ReferenceEquals(family, familyWords))
                .SelectMany(family => family)
                .Select(x => x.Word)
                .Distinct(StringComparer.OrdinalIgnoreCase)
                .ToList();

            // =====================================
            // GENERATE QUESTION
            // =====================================

            switch (questionTypeCode)
            {
                // =====================================
                // 1. FIND MATCHING RHYMING WORDS
                // =====================================

                case "FIND_MATCHING_RHYMING_WORDS":
                    {
                        var matchingWords = familyWords
                            .Where(x => !string.Equals(
                                x.Word,
                                target.Word,
                                StringComparison.OrdinalIgnoreCase))
                            .ToList();

                        if (matchingWords.Count == 0)
                        {
                            throw new InvalidOperationException(
                                "No matching rhyming word is available.");
                        }

                        Shuffle(matchingWords);

                        var matchingWord = matchingWords.First();

                        var options = BuildOptions(
                            matchingWord.Word,
                            otherFamilyWords
                        );

                        questionText =
                            $"Find the word that rhymes with {target.Word}.";

                        correctAnswer = matchingWord.Word;

                        data = new
                        {
                            questionType = "findMatchingRhymingWords",
                            targetWord = target.Word,
                            options,
                            selectionMode = "single",
                            answerType = "word"
                        };

                        break;
                    }

                // =====================================
                // 2. CHOOSE THE ODD RHYMING WORD
                // =====================================

                case "CHOOSE_THE_ODD_RHYMING_WORDS":
                    {
                        // Select the required number of rhyming words.
                        // The selected target is always included.

                        var rhymingWords = new List<string>
            {
                target.Word
            };

                        var remainingRhymingWords = familyWords
                            .Where(x => !string.Equals(
                                x.Word,
                                target.Word,
                                StringComparison.OrdinalIgnoreCase))
                            .Select(x => x.Word)
                            .ToList();

                        Shuffle(remainingRhymingWords);

                        rhymingWords.AddRange(
                            remainingRhymingWords.Take(rhymeGroupSize - 1)
                        );

                        if (rhymingWords.Count != rhymeGroupSize)
                        {
                            throw new InvalidOperationException(
                                "Not enough words in the selected rhyme family.");
                        }

                        // Select exactly one word from another family.
                        // It should not rhyme with the selected group.

                        var oddWords = otherFamilyWords
                            .Where(x => !rhymingWords.Contains(
                                x,
                                StringComparer.OrdinalIgnoreCase))
                            .ToList();

                        if (oddWords.Count == 0)
                        {
                            throw new InvalidOperationException(
                                "No unrelated word is available for the odd-rhyme question.");
                        }

                        Shuffle(oddWords);

                        string oddWord = oddWords.First();

                        var options = rhymingWords
                            .Append(oddWord)
                            .ToList();

                        Shuffle(options);

                        questionText =
                            "Choose the word that does not rhyme with the others.";

                        correctAnswer = oddWord;

                        data = new
                        {
                            questionType = "chooseTheOddRhymingWord",
                            rhymingWords,
                            options,
                            selectionMode = "single",
                            answerType = "word"
                        };

                        break;
                    }

                // =====================================
                // 3. COMPLETE RHYMING PAIRS
                // =====================================

                case "COMPLETE_RHYMING_PAIRS":
                    {
                        var matchingWords = familyWords
                            .Where(x => !string.Equals(
                                x.Word,
                                target.Word,
                                StringComparison.OrdinalIgnoreCase))
                            .ToList();

                        if (matchingWords.Count == 0)
                        {
                            throw new InvalidOperationException(
                                "No matching rhyming word is available.");
                        }

                        Shuffle(matchingWords);

                        var matchingWord = matchingWords.First();

                        var options = BuildOptions(
                            matchingWord.Word,
                            otherFamilyWords
                        );

                        questionText =
                            $"Complete the rhyming pair: {target.Word} - ____";

                        correctAnswer = matchingWord.Word;

                        data = new
                        {
                            questionType = "completeRhymingPairs",
                            firstWord = target.Word,
                            options,
                            selectionMode = "single",
                            answerType = "word"
                        };

                        break;
                    }

                // =====================================
                // 4. MATCH PICTURES WITH RHYMING WORDS
                // =====================================

                case "MATCH_PICTURES_WITH_RHYMING_WORDS":
                    {
                        var matchingWords = familyWords
                            .Where(x => !string.Equals(
                                x.Word,
                                target.Word,
                                StringComparison.OrdinalIgnoreCase))
                            .ToList();

                        if (matchingWords.Count == 0)
                        {
                            throw new InvalidOperationException(
                                "No matching rhyming word is available.");
                        }

                        Shuffle(matchingWords);

                        var matchingWord = matchingWords.First();

                        var options = BuildOptions(
                            matchingWord.Word,
                            otherFamilyWords
                        );

                        questionText =
                            "Look at the picture and choose the word that rhymes with it.";

                        correctAnswer = matchingWord.Word;

                        data = new
                        {
                            questionType = "matchPicturesWithRhymingWords",
                            picture = target.Picture,
                            pictureWord = target.Word,
                            pictureDescription = target.PictureDescription,
                            pictureType = "emoji",
                            options,
                            selectionMode = "single",
                            answerType = "word"
                        };

                        break;
                    }

                default:
                    throw new NotSupportedException(
                        $"Rhyming question type '{questionTypeCode}' is not supported.");
            }

            return CreateQuestion(
                questionNumber,
                questionTypeId,
                questionText,
                data,
                correctAnswer
            );
        }

        private GeneratedQuestion GenerateVocabularyDevelopmentQuestion(int questionNumber, int questionTypeId, string questionTypeCode, int levelId, int difficultyId, HashSet<string> usedGameCombinations)
        {
            if (usedGameCombinations == null)
                throw new ArgumentNullException(nameof(usedGameCombinations));

            questionTypeCode = (questionTypeCode ?? string.Empty)
                .Trim()
                .ToUpperInvariant();

            int actualDifficulty = ResolveDifficulty(difficultyId);

            if (!VocabularyDevelopmentDifficultyConfig.WordsByLevel.TryGetValue(
                levelId, out var configuredWords))
            {
                throw new ArgumentOutOfRangeException(
                    nameof(levelId),
                    $"Vocabulary words are not configured for level {levelId}.");
            }

            if (!VocabularyDevelopmentDifficultyConfig.DifficultyByLevel.TryGetValue(
                levelId, out var difficultySettings) ||
                !difficultySettings.TryGetValue(actualDifficulty, out var settings))
            {
                throw new ArgumentOutOfRangeException(
                    nameof(difficultyId),
                    $"Difficulty {actualDifficulty} is not configured for level {levelId}.");
            }

            if (questionTypeCode != "READ_AND_IDENTIFY_WORDS" &&
                questionTypeCode != "ARRANGE_LETTERS_TO_MAKE_WORDS" &&
                questionTypeCode != "COMPLETE_MISSING_LETTERS_IN_WORDS")
            {
                throw new NotSupportedException(
                    $"Vocabulary question type '{questionTypeCode}' is not supported.");
            }

            var eligibleWords = configuredWords
                .Where(x =>
                    x.Word.Length >= settings.MinimumWordLength &&
                    x.Word.Length <= settings.MaximumWordLength)
                .ToList();

            if (eligibleWords.Count < 1)
            {
                throw new InvalidOperationException(
                    $"No vocabulary words found for level {levelId}, " +
                    $"difficulty {actualDifficulty}.");
            }

            int optionCount = settings.OptionCount;

            // The selected target must not repeat in the same worksheet
            // for this activity, learning level and difficulty.
            string keyPrefix =
                $"{questionTypeCode}:L{levelId}:D{actualDifficulty}";

            var selected = GetUnusedCandidate(
                eligibleWords,
                keyPrefix,
                x => x.Word.Trim().ToLowerInvariant(),
                usedGameCombinations);

            string targetWord = selected.Word.Trim().ToLowerInvariant();

            var distractors = configuredWords
                .Where(x => !string.Equals(
                    x.Word,
                    targetWord,
                    StringComparison.OrdinalIgnoreCase))
                .Select(x => x.Word.Trim().ToLowerInvariant())
                .Distinct(StringComparer.OrdinalIgnoreCase)
                .ToList();

            if (distractors.Count < optionCount - 1)
            {
                throw new InvalidOperationException(
                    $"Not enough vocabulary options for level {levelId}, " +
                    $"difficulty {actualDifficulty}.");
            }

            List<string> BuildOptions()
            {
                var available = distractors.ToList();

                Shuffle(available);

                var options = new List<string> { targetWord };

                options.AddRange(available.Take(optionCount - 1));

                Shuffle(options);

                return options;
            }

            string questionText;
            string correctAnswer = targetWord;
            object data;

            switch (questionTypeCode)
            {

                case "READ_AND_IDENTIFY_WORDS":
                    {
                        var options = BuildOptions();

                        questionText =
                            "Look at the picture and choose the correct word.";

                        data = new
                        {
                            questionType = "readAndIdentifyWords",
                            targetWord,
                            picture = selected.Picture,
                            pictureDescription = selected.Description,
                            pictureType = "emoji",
                            options,
                            selectionMode = "single",
                            answerType = "word",
                            difficultyLevel = actualDifficulty
                        };

                        break;
                    }


                case "ARRANGE_LETTERS_TO_MAKE_WORDS":
                    {
                        var letters = targetWord
                            .ToCharArray()
                            .Select(c => c.ToString())
                            .ToList();

                        Shuffle(letters);

                        // Avoid displaying the correctly arranged word.
                        if (string.Concat(letters).Equals(
                            targetWord,
                            StringComparison.OrdinalIgnoreCase))
                        {
                            letters.Reverse();
                        }

                        // Rotate again for words whose reversed form
                        // happens to be identical.
                        if (string.Concat(letters).Equals(
                            targetWord,
                            StringComparison.OrdinalIgnoreCase) &&
                            letters.Count > 1)
                        {
                            letters.Add(letters[0]);
                            letters.RemoveAt(0);
                        }

                        questionText =
                            "Arrange the letters to make a meaningful word.";

                        data = new
                        {
                            questionType = "arrangeLettersToMakeWords",
                            picture = selected.Picture,
                            pictureDescription = selected.Description,
                            scrambledLetters = letters,
                            letterCount = letters.Count,
                            selectionMode = "reorder",
                            answerType = "word",
                            difficultyLevel = actualDifficulty
                        };

                        break;
                    }

                // ==========================================
                // 3. COMPLETE MISSING LETTERS IN WORDS
                // ==========================================

                case "COMPLETE_MISSING_LETTERS_IN_WORDS":
                    {
                        int missingCount = Math.Min(
                            settings.MissingLetterCount,
                            Math.Max(1, targetWord.Length - 1));

                        var positions = Enumerable
                            .Range(0, targetWord.Length)
                            .ToList();

                        Shuffle(positions);

                        var missingIndexes = positions
                            .Take(missingCount)
                            .OrderBy(x => x)
                            .ToList();

                        var pattern = targetWord
                            .Select((letter, index) =>
                                missingIndexes.Contains(index) ? '_' : letter)
                            .Select(x => x.ToString())
                            .ToArray();

                        var options = BuildOptions();

                        questionText =
                            "Choose the correct word to complete the missing letters.";

                        data = new
                        {
                            questionType = "completeMissingLettersInWords",
                            picture = selected.Picture,
                            pictureDescription = selected.Description,
                            pattern = string.Join(" ", pattern),
                            missingIndexes,
                            options,
                            selectionMode = "single",
                            answerType = "word",
                            difficultyLevel = actualDifficulty
                        };

                        break;
                    }

                default:
                    throw new NotSupportedException(
                        $"Vocabulary question type '{questionTypeCode}' is not supported.");
            }

            return CreateQuestion(questionNumber, questionTypeId, questionText, data, correctAnswer);
        }

        private GeneratedQuestion GenerateSimpleSentencesQuestion(int questionNumber, int questionTypeId, string questionTypeCode, int levelId, int difficultyId, HashSet<string> usedGameCombinations)
        {
            if (usedGameCombinations == null)
                throw new ArgumentNullException(nameof(usedGameCombinations));

            string code = (questionTypeCode ?? string.Empty).Trim().ToUpperInvariant();

            int actualDifficulty = ResolveDifficulty(difficultyId);

            if (!SimpleSentencesDifficultyConfig.SentencesByLevel.TryGetValue(
                levelId, out var sentenceBank))
            {
                throw new InvalidOperationException(
                    $"No simple sentence content found for learning level {levelId}.");
            }

            if (!SimpleSentencesDifficultyConfig.DifficultyByLevel.TryGetValue(
                levelId, out var levelDifficulties) ||
                !levelDifficulties.TryGetValue(actualDifficulty, out var settings))
            {
                throw new InvalidOperationException(
                    $"No difficulty settings found for level {levelId}, difficulty {actualDifficulty}.");
            }

            // Select one unused sentence for this question type, level and difficulty.
            var selected = GetUnusedCandidate(
                sentenceBank,
                $"{code}_LEVEL_{levelId}_DIFFICULTY_{actualDifficulty}",
                item => item.Sentence.Trim().ToLowerInvariant(),
                usedGameCombinations);

            // Shuffle helper.
            List<T> ShuffleItems<T>(IEnumerable<T> source)
            {
                var result = source.ToList();

                for (int i = result.Count - 1; i > 0; i--)
                {
                    int j = Random.Shared.Next(i + 1);
                    (result[i], result[j]) = (result[j], result[i]);
                }

                return result;
            }

            // Build answer choices and keep the correct answer in the choices.
            List<string> BuildOptions(string correct, IEnumerable<string> candidates)
            {
                var distractors = candidates
                    .Where(x => !string.IsNullOrWhiteSpace(x))
                    .Where(x => !string.Equals(
                        x.Trim(), correct.Trim(), StringComparison.OrdinalIgnoreCase))
                    .Distinct(StringComparer.OrdinalIgnoreCase)
                    .ToList();

                var selectedDistractors = ShuffleItems(distractors)
                    .Take(Math.Max(0, settings.OptionCount - 1))
                    .ToList();

                var options = new List<string> { correct };
                options.AddRange(selectedDistractors);

                return ShuffleItems(options);
            }

            string correctAnswer;
            string questionText;
            object questionData;

            switch (code)
            {
                case "READING_AND_UNDERSTAND_SIMPLE_SENTENCES":
                    {
                        correctAnswer = selected.Answer;

                        var options = BuildOptions(
                            correctAnswer,
                            sentenceBank.Select(x => x.Answer));

                        questionText = selected.Sentence + " " + selected.Question;

                        questionData = new
                        {
                            questionType = "readAndUnderstandSimpleSentences",
                            sentence = selected.Sentence,
                            comprehensionQuestion = selected.Question,
                            picture = selected.Picture,
                            pictureDescription = selected.PictureDescription,
                            options,
                            selectionMode = "single",
                            answerType = "word",
                            difficultyLevel = actualDifficulty
                        };

                        break;
                    }

                case "CHOOSE_THE_CORRECT_SENTENCE":
                    {
                        correctAnswer = selected.Sentence;

                        var options = BuildOptions(
                            correctAnswer,
                            sentenceBank.Select(x => x.Sentence));

                        questionText = "Choose the sentence that matches the picture.";

                        questionData = new
                        {
                            questionType = "chooseTheCorrectSentence",
                            picture = selected.Picture,
                            pictureDescription = selected.PictureDescription,
                            options,
                            selectionMode = "single",
                            answerType = "sentence",
                            difficultyLevel = actualDifficulty
                        };

                        break;
                    }

                case "COMPLETE_MISSING_WORDS":
                    {
                        correctAnswer = selected.Answer;

                        var words = selected.Sentence
                            .Split(' ', StringSplitOptions.RemoveEmptyEntries)
                            .ToList();

                        int missingIndex = words.FindIndex(word =>
                            string.Equals(
                                word.TrimEnd('.', ',', '!', '?'),
                                correctAnswer,
                                StringComparison.OrdinalIgnoreCase));

                        if (missingIndex < 0)
                        {
                            throw new InvalidOperationException(
                                $"Answer '{correctAnswer}' was not found in sentence '{selected.Sentence}'.");
                        }

                        words[missingIndex] = "_____";

                        string sentencePattern = string.Join(" ", words);

                        var options = BuildOptions(
                            correctAnswer,
                            sentenceBank.Select(x => x.Answer));

                        questionText = "Choose the missing word to complete the sentence.";

                        questionData = new
                        {
                            questionType = "completeMissingWords",
                            sentence = selected.Sentence,
                            sentencePattern,
                            missingWordIndex = missingIndex,
                            picture = selected.Picture,
                            pictureDescription = selected.PictureDescription,
                            options,
                            selectionMode = "single",
                            answerType = "word",
                            difficultyLevel = actualDifficulty
                        };

                        break;
                    }

                case "ARRANGE_WORDS_TO_FORM_SENTENCES":
                    {
                        correctAnswer = selected.Sentence;

                        var sentenceWords = selected.Sentence
                            .Split(' ', StringSplitOptions.RemoveEmptyEntries)
                            .ToList();

                        var scrambledWords = ShuffleItems(sentenceWords);

                        // Ensure that the displayed order is not already correct.
                        if (string.Join(" ", scrambledWords) == correctAnswer)
                        {
                            scrambledWords = sentenceWords
                                .Skip(1)
                                .Concat(sentenceWords.Take(1))
                                .ToList();
                        }

                        questionText = "Arrange the words to form a meaningful sentence.";

                        questionData = new
                        {
                            questionType = "arrangeWordsToFormSentences",
                            picture = selected.Picture,
                            pictureDescription = selected.PictureDescription,
                            scrambledWords,
                            wordCount = scrambledWords.Count,
                            selectionMode = "reorder",
                            answerType = "sentence",
                            difficultyLevel = actualDifficulty
                        };

                        break;
                    }

                default:
                    throw new ArgumentException(
                        $"Unsupported simple sentences question type: {questionTypeCode}");
            }

            return CreateQuestion(questionNumber, questionTypeId, questionText, questionData, correctAnswer);
        }



    }
}
